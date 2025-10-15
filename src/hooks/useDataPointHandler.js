// hooks/useDataPointHandler.js
import { useCallback } from 'react';
import { createSearchParams } from '../utils/helpers';

export const useDataPointHandler = ({
    categories,
    filters,
    handleFilterChange,
    fetchSemanticRCA,
    fetchSpatialData,
    fetchUserData,
    fetchCategories,
    saveToHistory,
    setIsLoading
}) => {
    const handleDataPointClick = useCallback(async (_, __, config) => {
        setIsLoading(true);
        try {
            const categoryData = Object.entries(categories)[config.dataPointIndex];
            if (!categoryData) return;

            handleFilterChange('query', categoryData[0]);
            const complaintNumbers = await fetchSemanticRCA({
                ...filters,
                query: categoryData[0]
            });

            if (complaintNumbers && complaintNumbers.length > 0) {
                await fetchUserData(complaintNumbers);
                handleFilterChange('complaintNumbers', complaintNumbers);
            }
            
            await fetchSpatialData({ ...filters, query: categoryData[0] });
            await fetchCategories(categoryData[1].prompt);

            const searchParams = {
                ...createSearchParams({ ...filters, query: categoryData[0] }),
                complaint_numbers: complaintNumbers || filters.complaintNumbers
            };
            searchParams.total_counts = complaintNumbers ? complaintNumbers.length : 0;
            saveToHistory(searchParams);
        } catch (error) {
            console.error('Error handling category click:', error);
        } finally {
            setIsLoading(false);
        }
    }, [
        categories,
        filters,
        handleFilterChange,
        fetchSemanticRCA,
        fetchUserData,
        fetchCategories,
        saveToHistory,
        setIsLoading
    ]);

    return { handleDataPointClick };
};