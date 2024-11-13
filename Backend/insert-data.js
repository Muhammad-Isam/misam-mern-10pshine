require('dotenv').config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const db = client.db("gettingStarted");
        const col = db.collection("people");

        const peopleDocuments = [
            {
                "name": { "first": "Alan", "last": "Turing" },
                "birth": new Date(1912, 5, 23),
                "death": new Date(1954, 5, 7),
                "contribs": ["Turing machine", "Turing test", "Turingery"],
                "views": 1250000
            },
            {
                "name": { "first": "Grace", "last": "Hopper" },
                "birth": new Date(1906, 12, 9),
                "death": new Date(1992, 1, 1),
                "contribs": ["Mark I", "UNIVAC", "COBOL"],
                "views": 3860000
            }
        ];

        const p = await col.insertMany(peopleDocuments);
        const filter = { "name.last": "Turing" };
        const document = await col.findOne(filter);
        console.log("Document found:\n" + JSON.stringify(document));

    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
