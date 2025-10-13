// hooks/useApiData.js
import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

export const useApiData = () => {
    const [totalCounts, setTotalCounts] = useState(0);
    const [userData, setUserData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCategories = useCallback(async (prompt, setCategories) => {
        try {
            const data = await apiService.fetchCategories(prompt);
            setCategories(data);
            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }, []);

    const fetchSemanticRCA = useCallback(async (filters) => {
        try {
            const params = {
                query: filters.query,
                startDate: filters.startDate?.toISOString().split('T')[0],
                endDate: filters.endDate?.toISOString().split('T')[0],
                threshold: filters.threshold,
                value: filters.value,
                complaintNumbers: filters.complaintNumbers
            };
            const data = await apiService.fetchSemanticRCA(params);
            setTotalCounts(data.total_counts);
            return data.complaintNumbers;
        } catch (error) {
            console.error('Error fetching semantic RCA:', error);
            return [];
        }
    }, []);

    const fetchUserData = useCallback(async (complaintNumbers) => {
        try {
            const data = await apiService.fetchUserData(complaintNumbers);
            setUserData(data);
            return data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            setUserData([]);
            return [];
        }
    }, []);

    return {
        totalCounts,
        setTotalCounts,
        userData,
        setUserData,
        isLoading,
        setIsLoading,
        fetchCategories,
        fetchSemanticRCA,
        fetchUserData
    };
};