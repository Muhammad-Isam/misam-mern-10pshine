import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import logo_main from '../../assets/logo.png';
import icon_search from '../../assets/search-icon.png';
import avatar from '../../assets/avatar.png';

const Header = ({ username, setSearchQuery, showSearch = true }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setDropdownOpen(false); // Close dropdown when opening modal
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSavePassword = () => {
    if (newPassword === confirmPassword) {
      // Call backend API to update password
      alert("Password updated successfully");
      closePasswordModal();
    } else {
      alert("Passwords do not match");
    }
  };

  return (
    <div className={styles.Header_Class}>
      <img src={logo_main} alt="Logo" className={styles.logo} />
      <h1 className={styles.title}>NotesFlare</h1>

      {showSearch && (
        <div className={styles.Search_Box}>
          <input 
            type="text" 
            placeholder="Search"
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
          <img src={icon_search} alt="Search Icon" />
        </div>
      )}

      <div className={styles.Profile_Section}>
        <div className={styles.Profile_Icon} onClick={toggleDropdown}>
          <img src={avatar} alt="Profile Avatar" className={styles.avatar} />
          {!dropdownOpen && <span className={styles.username}>{username || "Guest"}</span>}
        </div>

        {dropdownOpen && (
          <div className={styles.Dropdown}>
            <span className={styles.Dropdown_Name}>{username || "Guest"}</span>
            <hr />
            <div className={styles.Dropdown_Item} onClick={openPasswordModal}>Change Password</div>
            <hr />
            <div className={styles.Dropdown_Item} onClick={() => {
              handleLogout();
              setDropdownOpen(false);
            }}>
              Logout
            </div>
          </div>
        )}
      </div>

      {isPasswordModalOpen && (
        <div className={styles.passwordModal}>
          <div className={styles.passwordModalHeader}>
            <span>Change Password</span>
            <button className={styles.closePasswordModal} onClick={closePasswordModal}>×</button>
          </div>
          <div className={styles.passwordModalBody}>
            <input 
              type="password" 
              placeholder="Enter new password" 
              className={styles.passwordInput}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Re-enter password" 
              className={styles.passwordInput}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className={styles.passwordSaveButton} onClick={handleSavePassword}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
