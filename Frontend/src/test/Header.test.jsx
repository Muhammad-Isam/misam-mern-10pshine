import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Header from '../components/Header/Header';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
jest.mock('../assets/logo.png', () => 'logo');
jest.mock('../assets/search-icon.png', () => 'search-icon');
jest.mock('../assets/avatar.png', () => 'avatar');

// Mock fetch for password update API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Password updated successfully' }),
  })
);

// Mock window.alert to avoid errors in tests
global.alert = jest.fn();

describe('Header Component', () => {
  const setSearchQuery = jest.fn();

  // Mock localStorage methods
  beforeEach(() => {
    global.localStorage = {
      removeItem: jest.fn(),
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    render(
      <Router>
        <Header username="John Doe" setSearchQuery={setSearchQuery} />
      </Router>
    );
  });

  it('should render the header correctly', () => {
    expect(screen.getByAltText(/Logo/)).toBeInTheDocument();
    expect(screen.getByText(/NotesFlare/)).toBeInTheDocument();
    expect(screen.getByAltText(/Profile Avatar/)).toBeInTheDocument();
  });

  it('should call setSearchQuery when typing in the search box', () => {
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(setSearchQuery).toHaveBeenCalledWith('test');
  });

  it('should toggle the profile dropdown when clicked', () => {
    const profileIcon = screen.getByAltText(/Profile Avatar/);
    fireEvent.click(profileIcon);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should open and close the password modal when "Change Password" is clicked', () => {
    const profileIcon = screen.getByAltText(/Profile Avatar/);
    fireEvent.click(profileIcon);

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Change Password')).not.toBeInTheDocument();
  });

  it('should call handleSavePassword when the Save button is clicked', async () => {
    const profileIcon = screen.getByAltText(/Profile Avatar/);
    fireEvent.click(profileIcon);

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    fireEvent.change(screen.getByPlaceholderText('Enter current password'), {
      target: { value: 'oldPassword' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'newPassword' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), {
      target: { value: 'newPassword' },
    });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/auth/change-password', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          currentPassword: 'oldPassword',
          newPassword: 'newPassword',
        }),
      }));
    });
  });


});
