const express = require('express');
const request = require('supertest');
const { MongoClient, ObjectId } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const notesRoutes = require('../routes/notesRoutes'); // Import your routes

let server;
let mongoServer;
let client;
let db;
let notesCollection;
let usersCollection;
let testUserId;
let testNoteId;

// Helper function to create a test note
const createTestNote = async (userId) => {
    const newNote = {
        userId,
        title: 'Test Note',
        content: 'This is a test note.',
        category: 'Test Category',
        isFavorite: 'No',
        createdAt: new Date(),
    };

    const result = await notesCollection.insertOne(newNote);
    return result.insertedId;
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db('testNotesApp');
    notesCollection = db.collection('notes');
    usersCollection = db.collection('users');

    const user = await usersCollection.insertOne({ name: 'Test User' });
    testUserId = user.insertedId.toString();  // Convert ObjectId to string

    // Create a test note for the user
    testNoteId = await createTestNote(testUserId);

    // Log the user and note to check if they were inserted correctly
    console.log('Test User ID:', testUserId);  // Log only the ID (as string)
    console.log('Test Notes:', await notesCollection.find({ userId: testUserId }).toArray());

    const app = express();
    app.use(express.json());
    app.use('/notes', notesRoutes(notesCollection)); // Attach your routes to Express app
    server = app.listen(4001);
});


afterAll(async () => {
    await notesCollection.deleteOne({ _id: new ObjectId(testNoteId) });
    await client.close();
    await mongoServer.stop();
    await server.close();
});

describe('Notes Routes Tests', () => {
    it('should fetch all notes for a user', async () => {
        console.log('Fetching notes for userId:', testUserId.toString());
    
        // Log the notes in the database before the test runs
        const notesBeforeTest = await notesCollection.find({ userId: testUserId }).toArray();
        console.log('Notes before test:', notesBeforeTest); // Check if the note is in the database
        console.log('id: ', notesBeforeTest[0]._id )
        console.log('user id: ', notesBeforeTest[0].userId)
    
        const res = await request(server)
            .get('/notes/getNotes')
            .query({ userId: testUserId });
    
        console.log('Response Body:', res.body);
    
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1); // Ensure that one note is returned
        expect(res.body[0].title).toBe('Test Note');
    });

    it('should create a new note', async () => {
        const newNote = {
            userId: testUserId.toString(),
            title: 'New Note',
            content: 'This is a new test note.',
            category: 'New Category',
        };

        const res = await request(server) // Assuming `notesRoutes` is an express router
            .post('/notes/createNote')
            .send(newNote);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Note created successfully');
        expect(res.body.noteId).toBeDefined();

        // Verify the note was actually inserted
        const note = await notesCollection.findOne({ _id: new ObjectId(res.body.noteId) });
        expect(note).toBeDefined();
        expect(note.title).toBe('New Note');
    });

    it('should update an existing note', async () => {
        const updatedNote = {
            title: 'Updated Test Note',
            content: 'This note has been updated.',
            category: 'Updated Category',
        };

        const res = await request(server) // Assuming `notesRoutes` is an express router
            .put(`/notes/${testNoteId}`)
            .send(updatedNote);

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Test Note');
        expect(res.body.content).toBe('This note has been updated.');
    });

    it('should delete a note', async () => {
        const res = await request(server) // Assuming `notesRoutes` is an express router
            .delete(`/notes/${testNoteId}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Note deleted successfully');

        // Verify the note was deleted
        const note = await notesCollection.findOne({ _id: new ObjectId(testNoteId) });
        expect(note).toBeNull();
    });
});
