// hooks/useApplyFilters.js
import { useCallback } from 'react';
import { API_CONSTANTS } from '../utils/constants';
import { createSearchParams } from '../utils/helpers';

export const useApplyFilters = ({
    filters,
    updateFilters,
    fetchSemanticRCA,
    fetchSpatialData,
    fetchUserData,
    fetchCategories,
    saveToHistory,
    totalCounts,
    stateData,
    setIsLoading
}) => {
    const handleApplyFilters = useCallback(async () => {
        setIsLoading(true);
        try {
            const query = filters.query || API_CONSTANTS.DEFAULT_PROMPT;
            const complaintNumbers = await fetchSemanticRCA({
                ...filters,
                query
            });

            if (complaintNumbers.length > 0) {
                await fetchUserData(complaintNumbers);
            }

            updateFilters({ complaintNumbers });
            await fetchSpatialData({ ...filters, query });
            await fetchCategories(query);

            const searchParams = {
                ...createSearchParams({ ...filters, query }),
                complaint_numbers: complaintNumbers
            };
            searchParams.total_counts = complaintNumbers.length;
            saveToHistory(searchParams);
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
        saveToHistory,
        totalCounts,
        stateData,
        setIsLoading
    ]);

    return { handleApplyFilters };
};