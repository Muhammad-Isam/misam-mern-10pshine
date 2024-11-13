import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Category from '../Category';
import NotesList from './NotesList';
import AddNote from './AddNote';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || {};
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(['All Notes', 'Favorites']);  // Include 'Favourites'
  const [selectedCategory, setSelectedCategory] = useState('All Notes');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`http://localhost:5000/notes/getNotes?userId=${user.id}`);
        const data = await response.json();
        setNotes(data);

        // Include Favorites in the categories if they are present
        const uniqueCategories = ['All Notes', 'Favorites', ...new Set(data.map(note => note.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, [user.id]);

  return (
    <div>
      <Header username={user.name} setSearchQuery={setSearchQuery} />
      <Category
        categories={categories}
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory} // Pass the selected category
      />

      <AddNote
        user={user}
        onClick={() => navigate('/new-note', { state: { user, categories } })}
      />
      <NotesList
        userId={user.id}
        notes={notes}
        user={user}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        categories={categories}
      />
    </div>
  );
}
