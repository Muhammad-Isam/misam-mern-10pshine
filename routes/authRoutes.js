const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const router = express.Router();
require('dotenv').config();

const OTP_EXPIRY = 60 * 1000; // 1 minute in milliseconds
const JWT_EXPIRY = '1h'; // Token expiry time
const otpStore = {};

// JWT verification middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from headers

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Export the router function
module.exports = (usersCollection) => {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Your Gmail address
            pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail App Password
        },
    });
    // Forgot Password Route
    router.post('/forgot-password', async (req, res) => {
        const { email } = req.body;

        try {
            // Validate input
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            const user = await usersCollection.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const otp = crypto.randomInt(100000, 999999).toString();
            const expiresAt = Date.now() + OTP_EXPIRY;
            otpStore[email] = { otp, expiresAt };

            await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: email,
                subject: 'Your OTP for Password Reset',
                text: `Your OTP is ${otp}. It is valid for 1 minute.`,
            });

            // Include the OTP in the response for testing purposes
            res.status(200).json({ message: 'OTP sent to email', otp });
        } catch (error) {
            console.error('Error sending OTP:', error);
            res.status(500).json({ message: 'Error sending OTP' });
        }
    });


    // Reset Password Route
    router.post('/reset-password', async (req, res) => {
        const { email, otp, newPassword } = req.body;

        try {
            if (!email || !otp || !newPassword) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const otpEntry = otpStore[email];
            if (!otpEntry) {
                return res.status(400).json({ message: 'OTP not found or expired' });
            }

            if (otpEntry.otp !== otp || otpEntry.expiresAt < Date.now()) {
                delete otpStore[email];
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await usersCollection.updateOne(
                { email },
                { $set: { password: hashedPassword } }
            );

            delete otpStore[email]; // Clear OTP after successful reset
            res.status(200).json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Error resetting password' });
        }
    });

    // Login Route
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await usersCollection.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

            // Return user data along with the token
            res.status(200).json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email } });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Signup Route
    router.post('/signup', async (req, res) => {
        const { name, email, password, contact } = req.body;
    
        try {
            // Check if the user already exists
            const userExists = await usersCollection.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }
    
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Create new user with the current timestamp for createdAt
            const newUser = await usersCollection.insertOne({
                name,
                email,
                password: hashedPassword,
                contact,
                createdAt: new Date() // Sets the current timestamp
            });
    
            // Return newly created user information
            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: newUser.insertedId,
                    name,
                    email,
                    contact, // Include contact in the response
                    createdAt: newUser.createdAt // Access createdAt directly from the insert result
                }
            });
        } catch (error) {
            console.error(error); // Log the actual error to console for debugging
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    

    router.get('/protected', verifyToken, (req, res) => {
        res.status(200).json({ message: 'This is a protected route', user: req.user });
    });

    return router;
};
