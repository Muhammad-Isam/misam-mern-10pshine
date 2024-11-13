require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        const db = client.db('gettingStarted');  // Database name
        const notesCollection = db.collection('notes'); // Notes collection
        const usersCollection = db.collection('users'); // Users collection
        return { db, notesCollection, usersCollection }; // Return necessary collections
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = connectToDB;
