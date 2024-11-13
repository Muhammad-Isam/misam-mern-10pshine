const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb'); // Import ObjectId

module.exports = (notesCollection) => {

    // Route to fetch all notes for a user
    router.get('/getNotes', async (req, res) => {
        const { userId } = req.query;

        try {
            const notes = await notesCollection.find({ userId }).toArray();
            res.status(200).json(notes);
        } catch (error) {
            console.error('Error fetching notes:', error);
            res.status(500).json({ message: 'Error fetching notes' });
        }
    });

    router.put('/:id', async (req, res) => {
        const { title, content, category } = req.body;
        const noteId = req.params.id;
    
        console.log('Note ID:', noteId);
        console.log('Update Data:', { title, content, category });
    
        try {
            // Update the document without returning it
            const updateResult = await notesCollection.updateOne(
                { _id: new ObjectId(noteId) },
                {
                    $set: {
                        title,
                        content,
                        category,
                        updatedAt: new Date(),
                    }
                }
            );
    
            // Check if any document was updated
            if (updateResult.matchedCount === 0) {
                return res.status(404).json({ message: 'Note not found' });
            }
    
            // Retrieve the updated document
            const updatedNote = await notesCollection.findOne({ _id: new ObjectId(noteId) });
    
            res.status(200).json(updatedNote);
        } catch (error) {
            console.error('Error updating note:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    router.get('/:id', async (req, res) => {
        const noteId = req.params.id;
    
        try {
            const note = await notesCollection.findOne({ _id: new ObjectId(noteId) });
            if (!note) {
                return res.status(404).json({ message: 'Note not found' });
            }
            res.status(200).json(note);
        } catch (error) {
            console.error('Error fetching note:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
    


    // Route to create a new note
    router.post('/createNote', async (req, res) => {
        const { userId, title, content, category, isFavorite } = req.body;

        try {
            // Validate the required fields
            if (!userId || !title || !content) {
                return res.status(400).json({ message: 'User ID, title, and content are required' });
            }

            // Create a new note object
            const newNote = {
                userId,         // User ID from the request body
                title,          // Title of the note
                content,        // Content of the note
                category: category || 'Uncategorized', // Default to 'Uncategorized' if no category provided
                isFavorite: isFavorite || 'No',
                createdAt: new Date(),
            };

            // Insert the note into the database
            const result = await notesCollection.insertOne(newNote);
            res.status(201).json({ message: 'Note created successfully', noteId: result.insertedId });
        } catch (error) {
            console.error('Error creating note:', error);
            res.status(500).json({ message: 'Error creating note' });
        }
    });

    router.patch('/:id/favorite', async (req, res) => {
        const noteId = req.params.id;
        const { isFavorite } = req.body; // Expecting "Yes" or "No" in the request body
    
        try {
            // Ensure isFavorite is either "Yes" or "No"
            if (isFavorite !== "Yes" && isFavorite !== "No") {
                return res.status(400).json({ message: 'Invalid value for isFavorite' });
            }
    
            // Update the document without returning it
            const updateResult = await notesCollection.updateOne(
                { _id: new ObjectId(noteId) },
                { $set: { isFavorite } }
            );
    
            if (updateResult.matchedCount === 0) {
                return res.status(404).json({ message: 'Note not found' });
            }
    
            // Retrieve the updated document
            const updatedNote = await notesCollection.findOne({ _id: new ObjectId(noteId) });
    
            res.status(200).json(updatedNote);
        } catch (error) {
            console.error('Error updating favorite status:', error);
            res.status(500).json({ message: 'Error updating favorite status' });
        }
    });

    router.delete('/:id', async (req, res) => {
        const noteId = req.params.id;
    
        try {
            const result = await notesCollection.deleteOne({ _id: new ObjectId(noteId) });
    
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Note not found' });
            }
    
            res.status(200).json({ message: 'Note deleted successfully' });
        } catch (error) {
            console.error('Error deleting note:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
    
    // Route to update the category of a note
router.patch('/:id/category', async (req, res) => {
    const noteId = req.params.id;
    const { category } = req.body; // Expecting the new category in the request body

    try {
        // Validate that a category is provided
        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        // Update the category field of the specified note
        const updateResult = await notesCollection.updateOne(
            { _id: new ObjectId(noteId) },
            { $set: { category } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Retrieve the updated note
        const updatedNote = await notesCollection.findOne({ _id: new ObjectId(noteId) });

        res.status(200).json(updatedNote);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Error updating category' });
    }
});


    return router;
};

