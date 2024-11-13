const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;
let client;
let db;
let notesCollection;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log("MongoDB URI:", uri); // Ensure this prints a valid URI
  
    if (typeof uri !== 'string') {
      throw new Error("MongoDB URI is not a valid string.");
    }
  
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db('testNotesApp');
    notesCollection = db.collection('notes');
  });
  
afterAll(async () => {
    await notesCollection.deleteMany({}); // Clean up test data
    await client.close(); // Close the MongoDB client
    await mongoServer.stop(); // Stop the in-memory MongoDB server
});
