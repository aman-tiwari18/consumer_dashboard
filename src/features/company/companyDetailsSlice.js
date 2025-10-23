import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCompanyDetails = createAsyncThunk(
  'companyDetails/fetchCompanyDetails',
  async ({ limit = 10, forceRefresh = false }, { getState, rejectWithValue }) => {
    try {
      const { cachedData } = getState().companyDetails;

      const cacheValid = cachedData?.timestamp && (Date.now() - cachedData.timestamp < 3600 * 1000);
      if (!forceRefresh && cacheValid && cachedData.data) {
        return { data: cachedData.data, fromCache: true };
      }

      const res = await axios.post(
        "https://cdis.iitk.ac.in/consumer_api/get_company_details?sectorname=All&companyname=All&categoryname=All",
        {},
        { headers: { Accept: "application/json" } }
      );

      const companies = res.data || [];
      const companiesToFetch = companies.slice(0, limit);

      const results = await Promise.all(
        companiesToFetch.map(async (company) => {
          const payload = {
            query: company.companyname,
            skip: 0,
            size: 0,
            start_date: "2025-01-01",
            end_date: "2025-03-30",
            value: 2,
            CityName: "All",
            stateName: "All",
            complaintType: "All",
            complaintMode: "All",
            companyName: "All",
            complaintStatus: "All",
            threshold: 1.5,
            complaint_numbers: ["NA"],
          };

          try {
            const response = await axios.post(
              "https://cdis.iitk.ac.in/consumer_api/search",
              payload,
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              }
            );

            return {
              companyName: company.companyname,
              sectorName: company.sectorname,
              catName: company.catname,
              counts: response.data?.total_count || 0,
            };
          } catch (err) {
            console.error(`Error fetching count for ${company.companyname}:`, err);
            return {
              companyName: company.companyname,
              sectorName: company.sectorname,
              catName: company.catname,
              counts: 0,
            };
          }
        })
      );

      return { data: results, fromCache: false };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  companyData: [],
  loading: false,
  error: null,
  cachedData: null,
};

const companyDetailsSlice = createSlice({
  name: 'companyDetails',
  initialState,
  reducers: {
    clearCompanyData: (state) => {
      state.companyData = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyDetails.fulfilled, (state, action) => {
        const { data, fromCache } = action.payload;
        state.companyData = data;

        if (!fromCache) {
          state.cachedData = { data, timestamp: Date.now() };
        }

        state.loading = false;
      })
      .addCase(fetchCompanyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch company details';
      });
  },
});

export const { clearCompanyData } = companyDetailsSlice.actions;
export default companyDetailsSlice.reducer;
