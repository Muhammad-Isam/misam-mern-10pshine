import React from 'react';
import styles from './Category.module.css';

const Category = ({ categories, setSelectedCategory, selectedCategory }) => {
  return (
    <div className={styles.categoryContainer}>
      {categories.map((category, index) => (
        <div
          key={index}
          className={`${styles.categoryItem} ${category === selectedCategory ? styles.selectedCategory : ''}`}
          onClick={() => setSelectedCategory(category)}
        >
          {category}
        </div>
      ))}
    </div>
  );
};

export default Category;
