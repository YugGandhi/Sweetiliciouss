import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { auth as authApi } from '../services/api';
import '../styles/UserProfilePage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserProfilePage = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    nickname: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditingAddress, setIsEditingAddress] = useState(null); // null or index of address being edited

  // Load user data
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
      
      // If user has addresses, load them
      if (user.addresses && Array.isArray(user.addresses)) {
        setAddresses(user.addresses);
      }
    }
  }, [user]);

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authApi.updateProfile({
        fullName: personalInfo.fullName,
        phoneNumber: personalInfo.phoneNumber
      });
      
      // Update local user data
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      
      toast.success('Personal information updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile information');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordInfo.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      await authApi.updatePassword({
        currentPassword: passwordInfo.currentPassword,
        newPassword: passwordInfo.newPassword
      });
      
      // Reset form
      setPasswordInfo({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedAddresses = [...addresses];
      
      if (isEditingAddress !== null) {
        // Update existing address
        updatedAddresses[isEditingAddress] = newAddress;
      } else {
        // Add new address
        updatedAddresses.push(newAddress);
      }
      
      // If the new address is default, update other addresses
      if (newAddress.isDefault) {
        updatedAddresses.forEach((address, index) => {
          if (isEditingAddress !== index) {
            address.isDefault = false;
          }
        });
      }
      
      // Update addresses in the backend
      await authApi.updateProfile({ addresses: updatedAddresses });
      
      // Update local state
      setAddresses(updatedAddresses);
      setNewAddress({
        nickname: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
      });
      setIsEditingAddress(null);
      
      // Update local user data
      const updatedUser = { ...user, addresses: updatedAddresses };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      
      toast.success(isEditingAddress !== null ? 'Address updated successfully' : 'Address added successfully');
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (index) => {
    setNewAddress({ ...addresses[index] });
    setIsEditingAddress(index);
  };

  const handleDeleteAddress = async (index) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    setLoading(true);
    
    try {
      const updatedAddresses = [...addresses];
      updatedAddresses.splice(index, 1);
      
      // Update addresses in the backend
      await authApi.updateProfile({ addresses: updatedAddresses });
      
      // Update local state
      setAddresses(updatedAddresses);
      
      // Update local user data
      const updatedUser = { ...user, addresses: updatedAddresses };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const cancelAddressEdit = () => {
    setNewAddress({
      nickname: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    });
    setIsEditingAddress(null);
  };

  // Render personal information tab
  const renderPersonalInfo = () => (
    <div className="tab-content">
      <h2>Personal Information</h2>
      <form onSubmit={handlePersonalInfoSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={personalInfo.fullName}
            onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={personalInfo.email}
            disabled={true} // Email cannot be changed
          />
          <small className="form-hint">Email cannot be changed</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            value={personalInfo.phoneNumber}
            onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );

  // Render addresses tab
  const renderAddresses = () => (
    <div className="tab-content">
      <h2>{isEditingAddress !== null ? 'Edit Address' : 'Add New Address'}</h2>
      <form onSubmit={handleAddressSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="nickname">Nickname (e.g., Home, Work)</label>
          <input
            type="text"
            id="nickname"
            value={newAddress.nickname}
            onChange={(e) => setNewAddress({ ...newAddress, nickname: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="street">Street Address</label>
          <input
            type="text"
            id="street"
            value={newAddress.street}
            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        
        <div className="address-grid">
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              type="text"
              id="state"
              value={newAddress.state}
              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="zipCode">ZIP Code</label>
            <input
              type="text"
              id="zipCode"
              value={newAddress.zipCode}
              onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isDefault"
            checked={newAddress.isDefault}
            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
            disabled={loading}
          />
          <label htmlFor="isDefault">Set as default shipping address</label>
        </div>
        
        <div className="form-actions">
          {isEditingAddress !== null && (
            <button type="button" className="cancel-btn" onClick={cancelAddressEdit} disabled={loading}>
              Cancel
            </button>
          )}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : (isEditingAddress !== null ? 'Update Address' : 'Add Address')}
          </button>
        </div>
      </form>
      
      <div className="saved-addresses">
        <h3>Your Addresses</h3>
        
        {addresses.length === 0 ? (
          <div className="no-addresses">
            <p>You haven't added any addresses yet.</p>
          </div>
        ) : (
          <div className="addresses-list">
            {addresses.map((address, index) => (
              <div key={index} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                {address.isDefault && <span className="default-badge">Default</span>}
                <h4>{address.nickname}</h4>
                <div className="address-details">
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                </div>
                <div className="address-actions">
                  <button 
                    className="edit-btn" 
                    onClick={() => handleEditAddress(index)}
                    disabled={loading || isEditingAddress !== null}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteAddress(index)}
                    disabled={loading || isEditingAddress !== null}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render security tab
  const renderSecurity = () => (
    <div className="tab-content">
      <h2>Change Password</h2>
      <form onSubmit={handlePasswordSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={passwordInfo.currentPassword}
            onChange={(e) => setPasswordInfo({ ...passwordInfo, currentPassword: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={passwordInfo.newPassword}
            onChange={(e) => setPasswordInfo({ ...passwordInfo, newPassword: e.target.value })}
            required
            disabled={loading}
          />
          <small className="form-hint">Password must be at least 6 characters long</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={passwordInfo.confirmPassword}
            onChange={(e) => setPasswordInfo({ ...passwordInfo, confirmPassword: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="profile-page-container">
        <div className="profile-sidebar">
          <h2>My Account</h2>
          <ul className="profile-nav">
            <li 
              className={activeTab === 'personal' ? 'active' : ''} 
              onClick={() => setActiveTab('personal')}
            >
              Personal Information
            </li>
            <li 
              className={activeTab === 'addresses' ? 'active' : ''} 
              onClick={() => setActiveTab('addresses')}
            >
              Addresses
            </li>
            <li 
              className={activeTab === 'security' ? 'active' : ''} 
              onClick={() => setActiveTab('security')}
            >
              Security
            </li>
          </ul>
        </div>
        
        <div className="profile-content">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'addresses' && renderAddresses()}
          {activeTab === 'security' && renderSecurity()}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfilePage; 