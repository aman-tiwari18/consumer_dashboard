// hooks/useFilters.js
import { useState } from 'react';
import { API_CONSTANTS } from '../utils/constants';

export const useFilters = () => {
  const [filters, setFilters] = useState(API_CONSTANTS.INITIAL_FILTERS);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(API_CONSTANTS.INITIAL_FILTERS);
  };

  return {
    filters,
    handleFilterChange,
    updateFilters,
    resetFilters
  };
};