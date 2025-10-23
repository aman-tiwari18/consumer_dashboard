// hooks/useApiData.js
import { useState, useCallback , useEffect } from 'react';
import { apiService } from '../services/apiService';

export const useApiData = (defaultStateData = null) => {
    const [totalCounts, setTotalCounts] = useState(0);
    const [userData, setUserData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (defaultStateData && stateData.length === 0) {
            setStateData(defaultStateData);
        }
    }, [defaultStateData]);

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

    const formatStateName = (name) => {
    if (!name) return name;
    return name
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/\s+/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };


    const fetchSpatialData = useCallback(async (filters) => {
        try {
            const params = {
                query: filters.query,
                startDate: filters.startDate,
                endDate: filters.endDate,
                threshold: filters.threshold,
                value: filters.value,
                complaintNumbers: filters.complaintNumbers
            };

            const data = await apiService.fetchSpatialData(params);

            const formattedData = Object.entries(data).map(([state, count]) => ({
                stateName: formatStateName(state),
                counts: count
            }));
            setStateData(formattedData);
            return formattedData;
        } catch (error) {
            console.error("Error fetching spatial data:", error);
            return []
        }
    }, [defaultStateData]);


    const fetchCategoryWithCount = useCallback(async (prompt, setCategories) => {
        try {
            const data = await apiService.fetchCategoryWithCount(prompt);
            setCategories(data);
            return data;
        } catch (error) {
            console.log('Error fetching categoryWithCount', error)
            throw error;
        }
    },[])



    return {
        totalCounts,
        setTotalCounts,
        userData,
        setStateData,
        stateData,
        setUserData,
        isLoading,
        setIsLoading,
        fetchCategories,
        fetchSemanticRCA,
        fetchSpatialData,
        fetchCategoryWithCount,
        fetchUserData
    };
};