import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthorisationForm from './components/AuthorisationForm';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import TextEditor from './components/Editor/TextEditor'; // Import TextEditor
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthorisationForm />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/new-note"
                    element={
                        <ProtectedRoute>
                            <TextEditor />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/texteditor"
                    element={
                        <ProtectedRoute>
                            <TextEditor />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
