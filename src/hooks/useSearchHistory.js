// hooks/useSearchHistory.js
import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useLocalStorage('searchHistory', []);

  const removeHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, [setSearchHistory]);

  const saveToHistory = useCallback((searchParams, totalCounts) => {
    const historyItem = { 
      id: Date.now(),
      params: searchParams,
      timestamp: new Date().toLocaleString(),
      total_counts: totalCounts
    };
    const updatedHistory = [...searchHistory, historyItem].slice(0, 10);
    setSearchHistory(updatedHistory);
  }, [searchHistory, setSearchHistory]);

  const clearHistory = useCallback(() => {
    removeHistory();
  }, [removeHistory]);

  const deleteHistoryItem = useCallback((id) => {
    const newHistory = searchHistory.filter(h => h.id !== id);
    setSearchHistory(newHistory);
  }, [searchHistory, setSearchHistory]);

  return {
    searchHistory,
    saveToHistory,
    clearHistory,
    deleteHistoryItem
  };
};