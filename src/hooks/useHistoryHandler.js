// hooks/useHistoryHandler.js
import { useCallback } from 'react';

export const useHistoryHandler = ({
    filters,
    updateFilters,
    fetchSemanticRCA,
    fetchSpatialData,
    fetchUserData,
    fetchCategories,
    // fetchCategoryWithCount,
    setTotalCounts,
    setIsLoading
}) => {
    const handleHistoryClick = useCallback(async (historyItem) => {
        setIsLoading(true);
        try {
            const { params } = historyItem;
            updateFilters({
                query: params.query,
                startDate: new Date(params.start_date),
                endDate: new Date(params.end_date),
                threshold: params.threshold,
                value: params.value,
                complaintNumbers: params.complaint_numbers
            });

            await fetchSemanticRCA({
                ...filters,
                query: params.query
            });
            await fetchSpatialData({ ...filters, query: params.query });

            await fetchUserData(params.complaint_numbers);
            await fetchCategories(params.query);
            // await fetchCategoryWithCount(params.query);
            setTotalCounts(historyItem.total_counts || 0);
        } catch (error) {
            console.error('Error loading history item:', error);
        } finally {
            setIsLoading(false);
        }
    }, [
        filters,
        updateFilters,
        fetchSemanticRCA,
        fetchSpatialData,
        fetchUserData,
        fetchCategories,
        // fetchCategoryWithCount,
        setTotalCounts,
        setIsLoading
    ]);

    return { handleHistoryClick };
};