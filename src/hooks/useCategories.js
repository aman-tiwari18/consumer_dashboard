// hooks/useCategories.js
import { useState, useEffect } from 'react';
import categoryWithPrompt from '../resources/category_with_prompt.json';

export const useCategories = () => {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    const initialCategories = categoryWithPrompt.ConsumerGrievanceCategories.reduce((acc, item) => {
      acc[item.category] = {
        prompt: item.categoryPrompt,
        count: item.count || 0
      };
      return acc;
    }, {});
    setCategories(initialCategories);
  }, []);

  return { categories, setCategories };
};
