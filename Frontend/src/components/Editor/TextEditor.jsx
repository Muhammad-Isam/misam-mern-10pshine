import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import styles from './TextEditor.module.css';
import Header from '../Header/Header';

const TextEditor = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user || {};
    const note = location.state?.note || null;

    // Filter out "All Notes" and "Favorites" from categories
    const categories = (location.state?.categories || []).filter(cat => cat !== 'All Notes' && cat !== 'Favorites');

    const [content, setContent] = useState(note ? note.content : '');
    const [title, setTitle] = useState(note ? note.title : '');
    const [category, setCategory] = useState(note ? note.category : '');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const titleWordLimit = 10;
    const noteId = note ? note._id : null;

    const handleSave = async () => {
        const updatedNoteData = {
            userId: user.id,
            title,
            content,
            category: category || "Uncategorized",
            isFavorite: "No"
        };

        try {
            if (noteId) {
                const { data } = await axios.put(`http://localhost:5000/notes/${noteId}`, updatedNoteData);
                console.log('Note updated successfully:', data);
            } else {
                const { data } = await axios.post('http://localhost:5000/notes/createNote', updatedNoteData);
                console.log('Note created successfully:', data);
            }
            navigate('/dashboard', { state: { user } });
        } catch (error) {
            console.error('Error saving note:', error);
            alert(error.response?.data?.message || 'Error saving note.');
        }
    };

    const handleBack = () => {
        navigate('/dashboard', { state: { user } });
    };

    const handleCategoryChange = (e) => {
        if (e.target.value === 'Add New Category') {
            setIsAddingCategory(true);
            setCategory('');
        } else {
            setCategory(e.target.value);
            setIsAddingCategory(false);
        }
    };

    const handleTitleChange = (e) => {
        const words = e.target.value.split(' ');
        if (words.length <= titleWordLimit) {
            setTitle(e.target.value);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'size': [] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    return (
        <>
            <Header username={user.name} showSearch={false} /> {/* Hide search bar in Header */}
            <div className={styles.textEditor}>
                <div className={styles.header}>
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Enter Title (Max 10 words)"
                        className={styles.titleInput}
                    />
                    {isAddingCategory ? (
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Enter New Category"
                            className={styles.categoryInput}
                        />
                    ) : (
                        <select
                            value={category}
                            onChange={handleCategoryChange}
                            className={styles.categoryInput}
                        >
                            <option value="">Select Category</option>
                            <option value="Add New Category">Add New Category</option>
                            {[...new Set(categories)].map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>

                    )}
                    <button onClick={handleBack} className={styles.backButton}>Back</button>
                    <button onClick={handleSave} className={styles.saveButton}>Save Note</button>
                </div>

                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    placeholder="Write your note here..."
                    className={styles.quillEditor}
                />
            </div>
        </>
    );
};

export default TextEditor;
