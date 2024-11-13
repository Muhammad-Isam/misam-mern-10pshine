const express = require('express');
const request = require('supertest');
const { MongoClient, ObjectId } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('../routes/authRoutes'); // Import your auth routes
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Import crypto to generate OTP

let server;
let mongoServer;
let client;
let db;
let usersCollection;
let testUserId;
let testUserEmail;
let testUserPassword;
let testToken;

let otpStore = {};  // Mocking otpStore for OTP storage
const OTP_EXPIRY = 3600000;  // OTP expiry time (1 hour)

// Generate OTP at the top and store it in otpStore for easy use in tests
let generatedOTP = null;  // OTP variable to store the generated OTP

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db('testAuthApp');
    usersCollection = db.collection('users');

    // Create a test user for authentication
    const hashedPassword = await bcrypt.hash('TestPassword123', 10);
    const result = await usersCollection.insertOne({ name: 'Test User', email: 'testuser@example.com', password: hashedPassword });
    testUserId = result.insertedId;
    testUserEmail = 'testuser@example.com';
    testUserPassword = 'TestPassword123';

    // Generate a mock OTP and store it in otpStore for testing password reset
    generatedOTP = crypto.randomInt(100000, 999999).toString();  // Generate random OTP
    const expiresAt = Date.now() + OTP_EXPIRY;
    otpStore[testUserEmail] = { otp: generatedOTP, expiresAt };

    const app = express();
    app.use(express.json());
    app.use('/auth', authRoutes(usersCollection)); // Attach auth routes
    server = app.listen(4000);
});

afterAll(async () => {
    await usersCollection.deleteOne({ _id: new ObjectId(testUserId) });
    await client.close();
    await mongoServer.stop();
    await server.close();
});

describe('Auth Routes Tests', () => {
    it('should signup a new user', async () => {
        const newUser = {
            name: 'New User',
            email: 'newuser@example.com',
            password: 'NewPassword123',
        };

        const res = await request(server)
            .post('/auth/signup')
            .send(newUser);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User created successfully');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user.name).toBe(newUser.name);
        expect(res.body.user.email).toBe(newUser.email);
    });

    it('should login an existing user', async () => {
        const loginData = {
            email: testUserEmail,
            password: testUserPassword,
        };

        const res = await request(server)
            .post('/auth/login')
            .send(loginData);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Login successful');
        expect(res.body.token).toBeDefined();
        expect(res.body.user.id).toBe(testUserId.toString());
        expect(res.body.user.email).toBe(testUserEmail);

        testToken = res.body.token;  // Store token for use in protected routes
    });

    it('should change password with correct current password', async () => {
        const currentPassword = testUserPassword;
        const newPassword = 'UpdatedPassword123';

        const res = await request(server)
            .post('/auth/change-password')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ currentPassword, newPassword });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Password changed successfully');

        // Verify if the password was updated in the database
        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(testUserId) });
        const isPasswordUpdated = await bcrypt.compare(newPassword, updatedUser.password);
        expect(isPasswordUpdated).toBe(true);

        // Update the test user's password for further tests
        testUserPassword = newPassword;
    });

    it('should send OTP for password reset', async () => {
        const res = await request(server)
            .post('/auth/forgot-password')
            .send({ email: testUserEmail });
    
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('OTP sent to email');
        generatedOTP = res.body.otp;  // Store the OTP for use in the reset-password test
    });
    

    it('should reset password with valid OTP', async () => {
        if (!generatedOTP) {
            console.log('No OTP generated');
            return;
        }

        const newPassword = 'NewPasswordForReset123';

        const res = await request(server)
            .post('/auth/reset-password')
            .send({
                email: testUserEmail,
                otp: generatedOTP,
                newPassword,
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Password reset successfully');
    });

    it('should access a protected route with valid token', async () => {
        const res = await request(server)
            .get('/auth/protected')
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('This is a protected route');
        expect(res.body.user.id).toBe(testUserId.toString());
    });

    it('should return an error for protected route without token', async () => {
        const res = await request(server)
            .get('/auth/protected');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Access denied. No token provided.');
    });
});
