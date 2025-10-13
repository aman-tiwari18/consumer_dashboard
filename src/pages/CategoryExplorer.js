// pages/CategoryExplorer.js
import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Components
import LoadingScreen from '../components/LoadingScreen';
import FilterPanel from '../components/FilterPanel';
import SearchHistory from '../components/SearchHistory';
import TreemapChart from '../components/TreemapChart';
import UserDataTable from '../components/UserDataTable';

// Custom Hooks
import { useCategories } from '../hooks/useCategories';
import { useFilters } from '../hooks/useFilters';
import { useApiData } from '../hooks/useApiData';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useDataPointHandler } from '../hooks/useDataPointHandler';
import { useHistoryHandler } from '../hooks/useHistoryHandler';
import { useApplyFilters } from '../hooks/useApplyFilters';

const CategoryExplorer = () => {
    const navigate = useNavigate();

    // Custom hooks
    const { categories, setCategories } = useCategories();
    const { filters, handleFilterChange, updateFilters } = useFilters();
    const { searchHistory, saveToHistory, clearHistory, deleteHistoryItem } = useSearchHistory();
    const {
        totalCounts,
        setTotalCounts,
        userData,
        isLoading,
        setIsLoading,
        fetchCategories: fetchCategoriesApi,
        fetchSemanticRCA,
        fetchUserData
    } = useApiData();

    // Enhanced fetch functions
    const fetchCategories = (prompt) => fetchCategoriesApi(prompt, setCategories);

    // Action handlers
    const { handleDataPointClick } = useDataPointHandler({
        categories,
        filters,
        handleFilterChange,
        fetchSemanticRCA,
        fetchUserData,
        fetchCategories,
        saveToHistory,
        setIsLoading
    });

    const { handleHistoryClick } = useHistoryHandler({
        filters,
        updateFilters,
        fetchSemanticRCA,
        fetchUserData,
        fetchCategories,
        setTotalCounts,
        setIsLoading
    });

    const { handleApplyFilters } = useApplyFilters({
        filters,
        updateFilters,
        fetchSemanticRCA,
        fetchUserData,
        fetchCategories,
        saveToHistory,
        totalCounts,
        setIsLoading
    });

    if (!categories) {
        return <LoadingScreen message="Loading categories..." />;
    }

    return (
        <Box sx={{ p: 2 }}>

            <SearchHistory
                searchHistory={searchHistory}
                onHistoryClick={handleHistoryClick}
                onClearHistory={clearHistory}
                onDeleteHistoryItem={deleteHistoryItem}
            />

            <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onApplyFilters={handleApplyFilters}
                isLoading={isLoading}
                searchHistory={searchHistory}
                clearHistory={clearHistory}
            />

            <TreemapChart
                categories={categories}
                totalCounts={totalCounts}
                onDataPointClick={handleDataPointClick}
                isLoading={isLoading}
            />

            <UserDataTable userData={userData} />
        </Box>
    );
};

export default CategoryExplorer;