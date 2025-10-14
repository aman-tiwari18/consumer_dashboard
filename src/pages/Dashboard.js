import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

import FilterPanel from '../components/FilterPanel';
import SearchHistory from '../components/SearchHistory';

import { useCategories } from '../hooks/useCategories';
import { useFilters } from '../hooks/useFilters';
import { useApiData } from '../hooks/useApiData';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useDataPointHandler } from '../hooks/useDataPointHandler';
import { useHistoryHandler } from '../hooks/useHistoryHandler';
import { useApplyFilters } from '../hooks/useApplyFilters';
import AlertComponent from '../components/AlertComponent';
import ProportionalBlocks from '../components/ProprotionalBlocks';

const Dashboard = () => {
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
    const fetchCategories = async (prompt) => {
        const { updatedData, totalCount} = await fetchCategoriesApi(prompt, setCategories);
        setCategories(updatedData);      // update categories state
        setTotalCounts(totalCount);      // update total complaints
    };

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

const totalComplaints = categories? Object.values(categories).reduce((sum, cat) => sum + (cat.count || 0), 0): 0;
const totalCategories = categories ? Object.keys(categories).length : 0;
const formatCategories = (categories) => {
  if (!categories || typeof categories !== 'object') return [];

  return Object.entries(categories).map(([key, value]) => ({
    categoryName: key,
    counts: value.count || 0,
  }));
};

const categoriesData = formatCategories(categories);


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: '90vw' }}>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'background.paper' }}>
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
            </Box>

            <div style={{ display: 'flex', flexDirection: 'row', padding: '0 2rem', justifyContent: 'center', alignContent: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <ProportionalBlocks
                        categories={categories}
                        totalCounts={totalCounts  || totalComplaints} // fallback if totalCounts not set
                        onDataPointClick={handleDataPointClick}
                        isLoading={isLoading}
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <AlertComponent totalCount={totalCounts || totalComplaints} categoriesCount = {totalCategories} data= {categoriesData} />
                </div>
            </div>
        </Box>
    );
};

export default Dashboard;