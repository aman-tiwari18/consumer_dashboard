// services/apiService.js
import axios from 'axios';

const API_ENDPOINTS = {
    CATEGORIES: 'https://cdis.iitk.ac.in/consumer_api/get_ai_subcategory',
    SEMANTIC_RCA: 'https://cdis.iitk.ac.in/consumer_api/get_semantic_rca',
    USER_DATA: 'https://cdis.iitk.ac.in/consumer_api/get_userdata'
};

export const apiService = {
    fetchCategories: async (prompt) => {
        const response = await axios.post(API_ENDPOINTS.CATEGORIES, {
            input_prompt: prompt,
            max_retries: 3,
        }, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        let totalCount = 0; 

        const updatedData = Object.entries(response.data).reduce((acc, [key, value]) => {
            const count = Math.floor(Math.random() * (500 - 80 + 1)) + 80; // random 80–500
            acc[key] = {
            ...value,
            count,
            };
            totalCount += count; 
            return acc;
        }, {});

        return { updatedData, totalCount};
    },

    fetchSemanticRCA: async (params) => {
        const response = await axios.post(API_ENDPOINTS.SEMANTIC_RCA, {
            query: params.query,
            start_date: params.startDate,
            end_date: params.endDate,
            threshold: params.threshold || 1.3,
            value: params.value || 1,
            CityName: 'All',
            stateName: 'All',
            complaintType: 'All',
            complaintMode: 'All',
            companyName: 'All',
            complaintStatus: 'All',
            complaint_numbers: params.complaintNumbers || ["NA"]
        });
        return response.data;
    },

    fetchUserData: async (complaintNumbers) => {
        const response = await axios.post(API_ENDPOINTS.USER_DATA, {
            ids: complaintNumbers
        });
        return response.data.data;
    }
};