import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import AuthorizationForm from '../components/AuthorisationForm.jsx';

// Mock axios and useNavigate from react-router-dom
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('AuthorizationForm Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate); // Ensure mockNavigate is returned from useNavigate
  });

  test('renders login form by default', () => {
    render(
      <Router>
        <AuthorizationForm />
      </Router>
    );

    expect(screen.getByText(/login form/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
  });

  test('switches to signup form on toggle', () => {
    render(
      <Router>
        <AuthorizationForm />
      </Router>
    );

    fireEvent.click(screen.getByText(/signup/i));
    expect(screen.getByText(/signup form/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/date of birth/i)).toBeInTheDocument();
  });

  test('displays error when required fields are missing in signup', () => {
    render(
      <Router>
        <AuthorizationForm />
      </Router>
    );

    fireEvent.click(screen.getByText(/signup/i));
    fireEvent.click(screen.getByText(/submit/i));

    expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
  });

  test('handles forgot password flow', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'OTP sent to your email.' } });

    render(
      <Router>
        <AuthorizationForm />
      </Router>
    );

    fireEvent.click(screen.getByText(/forgot password\?/i));
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText(/send otp/i));

    await act(async () => Promise.resolve());
    expect(screen.getByText(/otp sent to your email/i)).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/auth/forgot-password', { email: 'test@example.com' });
  });

  test('handles successful login', async () => {
    // Mock the login API call response
    axios.post.mockResolvedValueOnce({
      data: {
        message: 'Login successful',
        token: 'testToken',
        user: { id: 1, name: 'Test User' },
      },
    });

    render(
      <Router>
        <AuthorizationForm />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/submit/i));

    await act(async () => Promise.resolve());

    // Check that the login success message appears
    expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    // Ensure the token is saved in localStorage
    expect(localStorage.getItem('token')).toBe('testToken');
    // Check that mockNavigate was called with correct arguments
    expect(mockNavigate).toHaveBeenCalledWith('/Dashboard', { state: { user: { id: 1, name: 'Test User' } } });
  });

  test('shows error on failed login', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(
      <Router>
        <AuthorizationForm />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText(/submit/i));

    await act(async () => Promise.resolve());
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
