import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCategoryAlerts = createAsyncThunk(
  'categoryAlerts/fetchCategoryAlerts',
  async ({ forceRefresh = false }, { getState, rejectWithValue }) => {
    try {
      const { cachedData } = getState().categoryAlerts;

      const cacheValid = cachedData?.timestamp && (Date.now() - cachedData.timestamp < 3600 * 1000);
      if (!forceRefresh && cacheValid && cachedData.data) {
        return { data: cachedData.data, fromCache: true };
      }

      const response = await axios.post('https://cdis.iitk.ac.in/consumer_api/get_category_alert', {
        last_days: 84,
        given_date: "2025-09-01",
        value: 1,
        CityName: "All",
        stateName: "All",
        complaintType: "All",
        complaintMode: "All",
        companyName: "All",
        complaintStatus: "All",
        threshold: 1.3,
        complaint_numbers: ["NA"]
      });

      return { data: response.data, fromCache: false };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  alertData: [],
  loading: false,
  error: null,
  cachedData: null,
  stats: null, 
};

const categoryAlertsSlice = createSlice({
  name: 'categoryAlerts',
  initialState,
  reducers: {
    clearAlerts: (state) => {
      state.alertData = [];
      state.error = null;
      state.stats = null;
    },
    updateStats: (state, action) => {
      state.stats = action.payload; 
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryAlerts.fulfilled, (state, action) => {
        const { data, fromCache } = action.payload;

        const sortedData = [...data].sort((a, b) => b.count - a.count);

        state.alertData = sortedData;

        state.stats = sortedData.reduce((acc, item) => acc + (item.count || 0), 0);

        if (!fromCache) {
          state.cachedData = { data, timestamp: Date.now() };
        }

        state.loading = false;
      })
      .addCase(fetchCategoryAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch category alerts';
      });
  },
});

export const { clearAlerts, updateStats } = categoryAlertsSlice.actions;
export default categoryAlertsSlice.reducer;
