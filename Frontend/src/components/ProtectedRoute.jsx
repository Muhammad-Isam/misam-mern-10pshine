import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isLoggedIn = !!localStorage.getItem('user'); // Check if user data is stored in local storage

    return isLoggedIn ? children : <Navigate to="/" />; // Redirect to home if not logged in
};

export default ProtectedRoute;
