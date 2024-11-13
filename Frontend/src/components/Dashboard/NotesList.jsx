import React, { useState, useEffect } from 'react';
import Note from './Note';
import styles from './NotesList.module.css';

const NotesList = ({ userId, notes, categories, user, searchQuery, selectedCategory }) => {
    const [fetchedNotes, setFetchedNotes] = useState([]);

    const fetchNotes = async () => {
        try {
            const response = await fetch(`http://localhost:5000/notes/getNotes?userId=${userId}`);
            if (!response.ok) throw new Error('Error fetching notes');
            const data = await response.json();
            setFetchedNotes(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Function to update the favorite status of a note in the fetchedNotes state
    const updateFavoriteStatus = (noteId, isFavorite) => {
        setFetchedNotes(prevNotes =>
            prevNotes.map(note =>
                note._id === noteId ? { ...note, isFavorite } : note
            )
        );
    };

    const handleDeleteNote = (noteId) => {
        setFetchedNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
    };

    useEffect(() => {
        if (userId) fetchNotes();
    }, [userId]);

    // Filter notes based on search query and selected category
    const filteredNotes = fetchedNotes.filter((note) => {
        const matchesCategory =
          selectedCategory === 'All Notes' ||
          (selectedCategory === 'Favorites' && note.isFavorite === 'Yes') ||
          note.category === selectedCategory;

        const matchesSearchQuery =
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearchQuery;
    });

    return (
        <div className={styles.notesList}>
            {filteredNotes.map((note) => (
                <Note
                    key={note._id}
                    note={note}
                    handleDeleteNote={handleDeleteNote}
                    updateFavoriteStatus={updateFavoriteStatus}  // Pass update function
                    user={user}
                    categories={categories}
                />
            ))}
        </div>
    );
};

export default NotesList;
