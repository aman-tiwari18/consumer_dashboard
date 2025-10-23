// services/apiService.js
import axios from 'axios';

const API_ENDPOINTS = {
    CATEGORIES: 'https://cdis.iitk.ac.in/consumer_api/get_ai_subcategory',
    SEMANTIC_RCA: 'https://cdis.iitk.ac.in/consumer_api/get_semantic_rca',
    USER_DATA: 'https://cdis.iitk.ac.in/consumer_api/get_userdata',
    SPATIAL_DATA: 'https://cdis.iitk.ac.in/consumer_api/get_spatial_analysis_data',
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
    },

    fetchSpatialData: async (params) => {
        const response = await axios.post(API_ENDPOINTS.SPATIAL_DATA, {
            query: params.query,
            start_date: params.startDate.toISOString().split('T')[0],
            end_date: params.endDate.toISOString().split('T')[0],
            value: params.value || 1,
            CityName: 'All',
            stateName: 'All',
            complaintType: 'All',
            complaintMode: 'All',
            companyName: 'All',
            complaintStatus: 'All',
            threshold: params.threshold || 1.3,
            complaint_numbers: params.complaintNumbers || ["NA"]
        });
        return response.data;
    },

  fetchCategoryWithCount: async (prompt) => {
  try {
    const categoryRes = await axios.post(
      API_ENDPOINTS.CATEGORIES,
      {
        input_prompt: prompt,
        max_retries: 3,
      },
      {
        headers: { accept: 'application/json' },
      }
    );

    const categoriesData = categoryRes?.data || {};

    const baseCategories = Object.entries(categoriesData).reduce((acc, [key, value]) => {
      acc[key] = {
        prompt: value.prompt || '',
        count: 0,
      };
      return acc;
    }, {});

    const categoryNames = Object.keys(baseCategories);
    const updatedCategories = { ...baseCategories };

    let totalComplaints = 0;
    const batchSize = 5; 

    for (let i = 0; i < categoryNames.length; i += batchSize) {
      const batch = categoryNames.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (categoryName) => {
          try {
            const response = await apiService.fetchSemanticRCA({
              query: categoryName,
              start_date: '2016-01-01',
              end_date: '2017-01-01',
              threshold: 1.3,
              value: 1,
              CityName: 'All',
              stateName: 'All',
              complaintType: 'All',
              complaintMode: 'All',
              companyName: 'All',
              complaintStatus: 'All',
              complaintNumbers: ['NA'],
            });

            let count = 0;

            if (Array.isArray(response)) {
              count = response.length;
            } else if (Array.isArray(response?.data)) {
              count = response.data.length;
            } else {
              const responseData = response?.data;
              count =
                responseData?.totalCount ??
                responseData?.total_counts ??
                responseData?.count ??
                responseData?.totalcount ??
                responseData?.total ??
                0;
            }

            updatedCategories[categoryName] = {
              ...updatedCategories[categoryName],
              count,
            };

            totalComplaints += count;
          } catch (err) {
            console.error(`Failed to fetch count for ${categoryName}:`, err);
            updatedCategories[categoryName] = {
              ...updatedCategories[categoryName],
              count: 0,
            };
          }
        })
      );

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return {
      updatedData: updatedCategories,
      totalCount: totalComplaints,
      totalCategories: categoryNames.length,
    };
  } catch (error) {
    console.error('Error in fetchCategoryWithCount:', error);
    throw error;
  }
},

        
};