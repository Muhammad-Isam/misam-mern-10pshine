import { MdAdd } from 'react-icons/md';
import styles from './AddNote.module.css';

export default function AddNote({ user, onClick }) {
  return (
    <div className={styles.noteNew} onClick={onClick}> {/* Add onClick handler */}
      <MdAdd className={styles.addIcon} />
    </div>
  );
};
