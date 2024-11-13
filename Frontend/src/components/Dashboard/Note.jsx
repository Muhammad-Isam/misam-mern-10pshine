import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; // Import useEffect to handle initial categories
import {
  MdDeleteForever,
  MdFavorite,
  MdFavoriteBorder,
  MdMoveToInbox,
} from "react-icons/md";
import { Modal, Button, Form } from "react-bootstrap";
import styles from "./Note.module.css";

const Note = ({
  note,
  user,
  handleDeleteNote,
  categories: initialCategories,
  updateFavoriteStatus,
}) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(note.isFavorite === "Yes");
  const [moveNoteOpen, setMoveNoteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(note.category || "");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Initialize categories when the component mounts or when initialCategories change
    setCategories([...new Set(initialCategories)]);
  }, [initialCategories]);

  const toggleFavorite = async () => {
    const newFavoriteStatus = !isFavorite ? "Yes" : "No";
    try {
      await handleFavorite(note._id, newFavoriteStatus);
      setIsFavorite(newFavoriteStatus === "Yes");
      updateFavoriteStatus(note._id, newFavoriteStatus);
    } catch (error) {
      console.error("Failed to update favorite status:", error);
    }
  };

  const deleteNote = async (noteId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this note? This action cannot be undone."
    );
    if (!isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");
      console.log("Note deleted successfully");
      handleDeleteNote(noteId);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleFavorite = async (noteId, isFavorite) => {
    try {
      const response = await fetch(
        `http://localhost:5000/notes/${noteId}/favorite`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isFavorite }),
        }
      );

      if (!response.ok)
        throw new Error("Failed to update favorite status in backend");
    } catch (error) {
      console.error("Error in handleFavorite:", error);
      throw error;
    }
  };

  const handleNoteClick = () => {
    navigate("/texteditor", { state: { note, user, categories } });
  };

  const saveCategoryChanges = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/notes/${note._id}/category`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: selectedCategory }),
        }
      );

      if (response.ok) {
        note.category = selectedCategory;
        // Update categories state after saving the change
        setCategories((prevCategories) => {
          // Only add the new category to the list if it's not already present
          if (!prevCategories.includes(selectedCategory)) {
            return [...prevCategories, selectedCategory];
          }
          return prevCategories;
        });
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 2000);
        setMoveNoteOpen(false);
      } else {
        console.error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const addNewCategory = () => {
    if (newCategory.trim()) {
      const newCategoryTrimmed = newCategory.trim();
      // Check if the category already exists
      if (!categories.includes(newCategoryTrimmed)) {
        setCategories((prevCategories) => [...prevCategories, newCategoryTrimmed]);
      }
      setSelectedCategory(newCategoryTrimmed); // Set the new category as selected
      setNewCategory(""); // Clear the input field
    }
  };

  return (
    <div className={styles.note} onDoubleClick={handleNoteClick}>
      {isFavorite ? (
        <MdFavorite
          className={`${styles.heartIcon} ${styles.filledHeart}`}
          onClick={toggleFavorite}
        />
      ) : (
        <MdFavoriteBorder
          className={styles.heartIcon}
          onClick={toggleFavorite}
        />
      )}
      <MdMoveToInbox
        className={styles.moveIcon}
        onClick={() => setMoveNoteOpen(true)}
      />

      <span className={styles.noteTitle}>{note.title}</span>

      <div
        className={styles.noteContent}
        dangerouslySetInnerHTML={{
          __html:
            note.content.split(" ").slice(0, 10).join(" ") +
            (note.content.split(" ").length > 10 ? "..." : ""),
        }}
      />

      <div className={styles.noteFooter}>
        <small>{new Date(note.createdAt).toLocaleDateString()}</small>
        <MdDeleteForever
          className={styles.deleteIcon}
          size="1.3em"
          onClick={() => deleteNote(note._id)}
        />
      </div>

      <Modal
        show={moveNoteOpen}
        onHide={() => setMoveNoteOpen(false)}
        centered
        backdrop="static"
        dialogClassName={styles.moveNoteModal}
      >
        <Modal.Header closeButton className={styles.moveNoteHeader}>
          <Modal.Title>Move Note to Category</Modal.Title>
          <button
            className={styles.closeModal}
            onClick={() => setMoveNoteOpen(false)}
          >
            &#10005;
          </button>
        </Modal.Header>

        <Modal.Body className={styles.moveNoteCategories}>
          <Form>
            <div className={styles.categoryList}>
              {categories
                .filter(
                  (category) => category !== "All Notes" && category !== "Favorites"
                )
                .map((category) => (
                  <Form.Check
                    key={category}
                    type="radio"
                    label={category}
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                    className={styles.moveNoteItem}
                  />
                ))}
            </div>
            <Form.Group className="mt-3 d-flex">
              <Form.Control
                type="text"
                placeholder="Add New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className={styles.newCategoryInput}
              />
              <Button
                variant="secondary"
                className={styles.newCategoryButton}
                onClick={addNewCategory}
              >
                +
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Button
            variant="primary"
            onClick={saveCategoryChanges}
            className={styles.moveNoteButton}
          >
            Move Note
          </Button>
        </Modal.Footer>
      </Modal>

      {showConfirmation && (
        <div className={styles.confirmationModal}>
          <span>Category updated successfully!</span>
        </div>
      )}
    </div>
  );
};

export default Note;
