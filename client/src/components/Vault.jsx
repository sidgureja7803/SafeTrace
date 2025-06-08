import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaCopy, FaShieldAlt, FaUserSecret, FaKey, FaNewspaper, FaRandom, FaSignOutAlt, FaUser, FaCreditCard, FaStickyNote } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { encrypt, decrypt, generateSecurePassword } from '../utils/encryption';
import { gsap } from 'gsap';
import '../styles/Vault.css';

// Vault item types
const ITEM_TYPES = {
  PASSWORD: 'password',
  CARD: 'card',
  NOTE: 'note'
};

const Vault = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vaultItems, setVaultItems] = useState([]);
  const [activeMenu, setActiveMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: ITEM_TYPES.PASSWORD,
    title: '',
    description: '',
    data: {}
  });
  const [editingItem, setEditingItem] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [masterPassword, setMasterPassword] = useState('');
  const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Get user from auth
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchVaultItems(currentUser.uid);
      }
      setLoading(false);
    });

    // Animate vault items
    gsap.fromTo(
      '.vault-item',
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.4, 
        stagger: 0.1,
        ease: 'power2.out'
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchVaultItems = async (userId) => {
    try {
      // In a real app, this would be an API call to your backend
      // For this demo, we'll use localStorage
      const storedItems = localStorage.getItem(`vault_${userId}`);
      if (storedItems) {
        setVaultItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Error fetching vault items:', error);
      setError('Failed to load vault items');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setActiveMenu(!activeMenu);
  };

  const handleAddItem = () => {
    if (!isMasterPasswordSet) {
      setError('Please set a master password first');
      return;
    }
    
    resetForm();
    setShowAddForm(true);
    setEditingItem(null);
  };

  const handleEditItem = (item) => {
    if (!isMasterPasswordSet) {
      setError('Please set a master password first');
      return;
    }
    
    setFormData({
      ...item,
      data: decryptItemData(item)
    });
    setShowAddForm(true);
    setEditingItem(item);
  };

  const handleDeleteItem = (itemId) => {
    const updatedItems = vaultItems.filter(item => item.id !== itemId);
    setVaultItems(updatedItems);
    saveVaultItems(updatedItems);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDataInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: value
      }
    }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      data: {}
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      setError('Title is required');
      return;
    }
    
    // Encrypt the data
    const encryptedData = {};
    Object.keys(formData.data).forEach(key => {
      encryptedData[key] = encrypt(formData.data[key], masterPassword);
    });
    
    const newItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      userId: user.uid,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      encrypted: true,
      data: encryptedData,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (editingItem) {
      // Update existing item
      const updatedItems = vaultItems.map(item => 
        item.id === editingItem.id ? newItem : item
      );
      setVaultItems(updatedItems);
      saveVaultItems(updatedItems);
    } else {
      // Add new item
      const updatedItems = [...vaultItems, newItem];
      setVaultItems(updatedItems);
      saveVaultItems(updatedItems);
    }
    
    resetForm();
    setShowAddForm(false);
  };

  const handleCancel = () => {
    resetForm();
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      type: ITEM_TYPES.PASSWORD,
      title: '',
      description: '',
      data: {}
    });
    setError('');
  };

  const togglePasswordVisibility = (itemId) => {
    setShowPassword(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show toast or notification
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const decryptItemData = (item) => {
    if (!item.encrypted) return item.data;
    
    const decryptedData = {};
    Object.keys(item.data).forEach(key => {
      try {
        decryptedData[key] = decrypt(item.data[key], masterPassword);
      } catch (error) {
        decryptedData[key] = '[Decryption failed]';
      }
    });
    
    return decryptedData;
  };

  const saveVaultItems = (items) => {
    localStorage.setItem(`vault_${user.uid}`, JSON.stringify(items));
  };

  const handleSetMasterPassword = (e) => {
    e.preventDefault();
    if (masterPassword.length < 8) {
      setError('Master password must be at least 8 characters long');
      return;
    }
    
    setIsMasterPasswordSet(true);
    setError('');
  };

  const generateRandomPassword = () => {
    const password = generateSecurePassword(16);
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        password
      }
    }));
  };

  if (loading) {
    return <div className="loading">Loading vault...</div>;
  }

  // Render master password form if not set
  if (!isMasterPasswordSet) {
    return (
      <div className="dashboard-container">
        <aside className={`sidebar ${activeMenu ? 'active' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <FaShieldAlt className="logo-icon" />
              <span>SafeTrace</span>
            </div>
            <button className="menu-toggle" onClick={toggleMenu}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          <div className="sidebar-content">
            <div className="user-info">
              <div className="user-avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User avatar" />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className="user-details">
                <h3>{user?.displayName || 'User'}</h3>
                <p>{user?.email || 'No email'}</p>
              </div>
            </div>
            <nav className="sidebar-nav">
              <Link to="/dashboard" className="nav-item">
                <FaShieldAlt className="nav-icon" />
                <span>Dashboard</span>
              </Link>
              <Link to="/breach-checker" className="nav-item">
                <FaUserSecret className="nav-icon" />
                <span>Breach Checker</span>
              </Link>
              <Link to="/vault" className="nav-item active">
                <FaLock className="nav-icon" />
                <span>Secure Vault</span>
              </Link>
              <Link to="/risk-checker" className="nav-item">
                <FaKey className="nav-icon" />
                <span>Risk Analysis</span>
              </Link>
              <Link to="/news" className="nav-item">
                <FaNewspaper className="nav-icon" />
                <span>Privacy News</span>
              </Link>
              <Link to="/fake-data" className="nav-item">
                <FaRandom className="nav-icon" />
                <span>Fake Data</span>
              </Link>
            </nav>
          </div>
          <div className="sidebar-footer">
            <button className="sign-out-button" onClick={handleSignOut}>
              <FaSignOutAlt className="sign-out-icon" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-header">
            <h1>Secure Vault</h1>
            <p className="welcome-message">Set up your vault</p>
          </header>

          <div className="master-password-container">
            <div className="master-password-card">
              <FaLock className="lock-icon" />
              <h2>Set Master Password</h2>
              <p>
                Your master password is used to encrypt all your vault data. 
                It's never stored anywhere and cannot be recovered if lost.
              </p>
              
              {error && <div className="error-message">{error}</div>}
              
              <form onSubmit={handleSetMasterPassword}>
                <div className="form-group">
                  <label htmlFor="masterPassword">Master Password</label>
                  <input
                    type="password"
                    id="masterPassword"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    placeholder="Enter a strong password"
                    required
                  />
                </div>
                <p className="password-requirements">
                  Password must be at least 8 characters long. Use a mix of letters, numbers, and symbols.
                </p>
                <button type="submit" className="primary-button">
                  Set Master Password
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${activeMenu ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <FaShieldAlt className="logo-icon" />
            <span>SafeTrace</span>
          </div>
          <button className="menu-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <div className="sidebar-content">
          <div className="user-info">
            <div className="user-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User avatar" />
              ) : (
                <FaUser />
              )}
            </div>
            <div className="user-details">
              <h3>{user?.displayName || 'User'}</h3>
              <p>{user?.email || 'No email'}</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            <Link to="/dashboard" className="nav-item">
              <FaShieldAlt className="nav-icon" />
              <span>Dashboard</span>
            </Link>
            <Link to="/breach-checker" className="nav-item">
              <FaUserSecret className="nav-icon" />
              <span>Breach Checker</span>
            </Link>
            <Link to="/vault" className="nav-item active">
              <FaLock className="nav-icon" />
              <span>Secure Vault</span>
            </Link>
            <Link to="/risk-checker" className="nav-item">
              <FaKey className="nav-icon" />
              <span>Risk Analysis</span>
            </Link>
            <Link to="/news" className="nav-item">
              <FaNewspaper className="nav-icon" />
              <span>Privacy News</span>
            </Link>
            <Link to="/fake-data" className="nav-item">
              <FaRandom className="nav-icon" />
              <span>Fake Data</span>
            </Link>
          </nav>
        </div>
        <div className="sidebar-footer">
          <button className="sign-out-button" onClick={handleSignOut}>
            <FaSignOutAlt className="sign-out-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Secure Vault</h1>
          <p className="welcome-message">Store and manage your sensitive information</p>
        </header>

        <div className="vault-container">
          <div className="vault-actions">
            <button className="add-item-button" onClick={handleAddItem}>
              <FaPlus />
              <span>Add Item</span>
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {showAddForm ? (
            <div className="add-form-container">
              <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-type-selector">
                  <button
                    type="button"
                    className={`type-button ${formData.type === ITEM_TYPES.PASSWORD ? 'active' : ''}`}
                    onClick={() => handleTypeChange(ITEM_TYPES.PASSWORD)}
                  >
                    <FaKey />
                    <span>Password</span>
                  </button>
                  <button
                    type="button"
                    className={`type-button ${formData.type === ITEM_TYPES.CARD ? 'active' : ''}`}
                    onClick={() => handleTypeChange(ITEM_TYPES.CARD)}
                  >
                    <FaCreditCard />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    className={`type-button ${formData.type === ITEM_TYPES.NOTE ? 'active' : ''}`}
                    onClick={() => handleTypeChange(ITEM_TYPES.NOTE)}
                  >
                    <FaStickyNote />
                    <span>Note</span>
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description (Optional)</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter a description"
                  />
                </div>

                {/* Dynamic fields based on item type */}
                {formData.type === ITEM_TYPES.PASSWORD && (
                  <>
                    <div className="form-group">
                      <label htmlFor="username">Username/Email</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.data.username || ''}
                        onChange={handleDataInputChange}
                        placeholder="Enter username or email"
                      />
                    </div>
                    <div className="form-group password-group">
                      <label htmlFor="password">Password</label>
                      <div className="password-input-container">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.data.password || ''}
                          onChange={handleDataInputChange}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowPassword(prev => ({...prev, new: !prev.new}))}
                        >
                          {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        <button
                          type="button"
                          className="generate-password"
                          onClick={generateRandomPassword}
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="url">Website URL</label>
                      <input
                        type="text"
                        id="url"
                        name="url"
                        value={formData.data.url || ''}
                        onChange={handleDataInputChange}
                        placeholder="Enter website URL"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="notes">Notes</label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.data.notes || ''}
                        onChange={handleDataInputChange}
                        placeholder="Enter additional notes"
                      ></textarea>
                    </div>
                  </>
                )}

                {formData.type === ITEM_TYPES.CARD && (
                  <>
                    <div className="form-group">
                      <label htmlFor="cardholderName">Cardholder Name</label>
                      <input
                        type="text"
                        id="cardholderName"
                        name="cardholderName"
                        value={formData.data.cardholderName || ''}
                        onChange={handleDataInputChange}
                        placeholder="Enter cardholder name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input
                        type={showPassword.cardNumber ? 'text' : 'password'}
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.data.cardNumber || ''}
                        onChange={handleDataInputChange}
                        placeholder="Enter card number"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(prev => ({...prev, cardNumber: !prev.cardNumber}))}
                      >
                        {showPassword.cardNumber ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expiryMonth">Expiry Month</label>
                        <input
                          type="text"
                          id="expiryMonth"
                          name="expiryMonth"
                          value={formData.data.expiryMonth || ''}
                          onChange={handleDataInputChange}
                          placeholder="MM"
                          maxLength="2"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="expiryYear">Expiry Year</label>
                        <input
                          type="text"
                          id="expiryYear"
                          name="expiryYear"
                          value={formData.data.expiryYear || ''}
                          onChange={handleDataInputChange}
                          placeholder="YY"
                          maxLength="2"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                          type={showPassword.cvv ? 'text' : 'password'}
                          id="cvv"
                          name="cvv"
                          value={formData.data.cvv || ''}
                          onChange={handleDataInputChange}
                          placeholder="CVV"
                          maxLength="4"
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowPassword(prev => ({...prev, cvv: !prev.cvv}))}
                        >
                          {showPassword.cvv ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="notes">Notes</label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.data.notes || ''}
                        onChange={handleDataInputChange}
                        placeholder="Enter additional notes"
                      ></textarea>
                    </div>
                  </>
                )}

                {formData.type === ITEM_TYPES.NOTE && (
                  <>
                    <div className="form-group">
                      <label htmlFor="content">Note Content</label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.data.content || ''}
                        onChange={handleDataInputChange}
                        placeholder="Enter your secure note"
                        rows="6"
                      ></textarea>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    {editingItem ? 'Save Changes' : 'Save Item'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="vault-items-container">
              {vaultItems.length === 0 ? (
                <div className="empty-vault">
                  <FaLock className="empty-icon" />
                  <h3>Your vault is empty</h3>
                  <p>Add your first item to get started.</p>
                  <button className="add-item-button" onClick={handleAddItem}>
                    <FaPlus />
                    <span>Add Item</span>
                  </button>
                </div>
              ) : (
                <div className="vault-items-grid">
                  {vaultItems.map(item => {
                    const decryptedData = decryptItemData(item);
                    return (
                      <div key={item.id} className="vault-item">
                        <div className="vault-item-header">
                          {item.type === ITEM_TYPES.PASSWORD && <FaKey className="item-icon" />}
                          {item.type === ITEM_TYPES.CARD && <FaCreditCard className="item-icon" />}
                          {item.type === ITEM_TYPES.NOTE && <FaStickyNote className="item-icon" />}
                          <h3>{item.title}</h3>
                        </div>
                        
                        {item.description && (
                          <p className="item-description">{item.description}</p>
                        )}
                        
                        <div className="item-details">
                          {item.type === ITEM_TYPES.PASSWORD && (
                            <>
                              {decryptedData.username && (
                                <div className="detail-row">
                                  <span className="detail-label">Username:</span>
                                  <span className="detail-value">{decryptedData.username}</span>
                                  <button 
                                    className="copy-button" 
                                    onClick={() => copyToClipboard(decryptedData.username)}
                                  >
                                    <FaCopy />
                                  </button>
                                </div>
                              )}
                              {decryptedData.password && (
                                <div className="detail-row">
                                  <span className="detail-label">Password:</span>
                                  <span className="detail-value password-value">
                                    {showPassword[item.id] ? decryptedData.password : '••••••••'}
                                  </span>
                                  <button 
                                    className="toggle-button" 
                                    onClick={() => togglePasswordVisibility(item.id)}
                                  >
                                    {showPassword[item.id] ? <FaEyeSlash /> : <FaEye />}
                                  </button>
                                  <button 
                                    className="copy-button" 
                                    onClick={() => copyToClipboard(decryptedData.password)}
                                  >
                                    <FaCopy />
                                  </button>
                                </div>
                              )}
                              {decryptedData.url && (
                                <div className="detail-row">
                                  <span className="detail-label">URL:</span>
                                  <span className="detail-value url-value">
                                    <a href={decryptedData.url} target="_blank" rel="noopener noreferrer">
                                      {decryptedData.url}
                                    </a>
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          
                          {item.type === ITEM_TYPES.CARD && (
                            <>
                              {decryptedData.cardholderName && (
                                <div className="detail-row">
                                  <span className="detail-label">Name:</span>
                                  <span className="detail-value">{decryptedData.cardholderName}</span>
                                </div>
                              )}
                              {decryptedData.cardNumber && (
                                <div className="detail-row">
                                  <span className="detail-label">Number:</span>
                                  <span className="detail-value">
                                    {showPassword[item.id] ? decryptedData.cardNumber : '•••• •••• •••• ••••'}
                                  </span>
                                  <button 
                                    className="toggle-button" 
                                    onClick={() => togglePasswordVisibility(item.id)}
                                  >
                                    {showPassword[item.id] ? <FaEyeSlash /> : <FaEye />}
                                  </button>
                                  <button 
                                    className="copy-button" 
                                    onClick={() => copyToClipboard(decryptedData.cardNumber)}
                                  >
                                    <FaCopy />
                                  </button>
                                </div>
                              )}
                              {(decryptedData.expiryMonth && decryptedData.expiryYear) && (
                                <div className="detail-row">
                                  <span className="detail-label">Expiry:</span>
                                  <span className="detail-value">
                                    {decryptedData.expiryMonth}/{decryptedData.expiryYear}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          
                          {item.type === ITEM_TYPES.NOTE && (
                            <div className="note-content">
                              <p>{decryptedData.content}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="item-actions">
                          <button 
                            className="edit-button" 
                            onClick={() => handleEditItem(item)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="delete-button" 
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Vault; 