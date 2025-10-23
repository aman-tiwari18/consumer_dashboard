import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiService } from '../../services/apiService'; // move this logic here or import it

export const fetchAllCategoriesThunk = createAsyncThunk(
  'categories/fetchAll',
  async (_, { getState }) => {
    const state = getState().categories;

    // ✅ Skip fetching if categories are already loaded (cache for 30 minutes)
    const THIRTY_MIN = 30 * 60 * 1000;
    if (state.lastFetched && Date.now() - state.lastFetched < THIRTY_MIN) {
      console.log('✅ Using cached categories data');
      return {
        categories: state.data,
        totalComplaints: state.totalComplaints,
      };
    }

    // 1️⃣ Fetch base categories
    const res = await axios.get('https://cdis.iitk.ac.in/consumer_api/get_all_categories', {
      headers: { accept: 'application/json' },
    });
    const data = res?.data || [];

    const baseCategories = data.reduce((acc, item) => {
      acc[item.category] = { prompt: item.categoryPrompt || '', count: 0 };
      return acc;
    }, {});

    // 2️⃣ Fetch counts for each category (batch 5 at a time)
    const updatedCategories = { ...baseCategories };
    let totalComplaints = 0;

    const categoryNames = Object.keys(baseCategories);
    const batchSize = 5;

    for (let i = 0; i < categoryNames.length; i += batchSize) {
      const batch = categoryNames.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (categoryName) => {
          try {
            const response = await apiService.fetchSemanticRCA({
              query: categoryName,
              startDate: '2025-01-01',
              endDate: '2025-01-31',
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

            const count =
              response?.data?.totalCount ||
              response?.data?.total_counts ||
              response?.data?.count ||
              0;

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

      // Small delay to avoid throttling
      await new Promise((res) => setTimeout(res, 200));
    }

    return { categories: updatedCategories, totalComplaints };
  }
);
