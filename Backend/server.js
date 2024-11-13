const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectToDB = require('./config/connection');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

(async () => {
    try {
        const { db, usersCollection, notesCollection } = await connectToDB();
        
        // Import and use authRoutes
        const authRoutes = require('./routes/authRoutes')(usersCollection);
        app.use('/auth', authRoutes);
        
        // Import and use notesRoutes
        const notesRoutes = require('./routes/notesRoutes')(notesCollection);
        app.use('/notes', notesRoutes);

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.error("Failed to connect to the database:", err);
        process.exit(1);
    }
})();
