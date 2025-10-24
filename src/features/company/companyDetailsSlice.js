import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCompanyDetails = createAsyncThunk(
  'companyDetails/fetchCompanyDetails',
  async ({ limit = 50, forceRefresh = false, query = '', batchSize = 10 }, { getState, rejectWithValue }) => {
    try {
      const { cachedData } = getState().companyDetails;

      // Create cache key that includes query to avoid conflicts between different category queries
      const cacheKey = `companies_${query || 'default'}`;
      const currentCache = cachedData?.[cacheKey];
      const cacheValid = currentCache?.timestamp && (Date.now() - currentCache.timestamp < 3600 * 1000);
      
      if (!forceRefresh && cacheValid && currentCache.data) {
        return { data: currentCache.data, fromCache: true };
      }

      const res = await axios.post(
        "https://cdis.iitk.ac.in/consumer_api/get_company_details?sectorname=All&companyname=All&categoryname=All",
        {},
        { headers: { Accept: "application/json" } }
      );

      const companies = res.data || [];
      // Smart limiting: if limit is 0, use intelligent default based on query
      let companiesToFetch;
      if (limit === 0) {
        // For AlertComponent, limit to top 50 companies to prevent timeouts
        companiesToFetch = companies.slice(0, 50);
        console.log(`Smart limit applied: Using top 50 companies instead of all ${companies.length} for query: "${query}"`);
      } else {
        companiesToFetch = companies.slice(0, limit);
      }

      console.log(`Fetching data for ${companiesToFetch.length} companies with query: "${query}" in batches of ${batchSize}`);
      
      // Process companies in batches to prevent timeout issues
      const results = [];
      for (let i = 0; i < companiesToFetch.length; i += batchSize) {
        const batch = companiesToFetch.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(companiesToFetch.length / batchSize)} (${batch.length} companies)`);
        
        const batchResults = await Promise.all(
          batch.map(async (company, batchIndex) => {
            const globalIndex = i + batchIndex;
            const payload = {
              query: query, // Use the passed query parameter
              skip: 0,
              size: 0,
              start_date: "2025-01-01",
              end_date: "2025-03-30",
              value: 2,
              CityName: "All",
              stateName: "All",
              complaintType: "All",
              complaintMode: "All",
              companyName: company.companyname,
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
                  timeout: 15000, // Reduced to 15 seconds per request
                }
              );

              return {
                companyName: company.companyname,
                sectorName: company.sectorname,
                catName: company.catname,
                counts: response.data?.total_count || 0,
              };
            } catch (err) {
              const errorType = err.code === 'ECONNABORTED' ? 'timeout' : 'network';
              console.error(`Error fetching count for ${company.companyname} (${errorType}):`, err.message);
              return {
                companyName: company.companyname,
                sectorName: company.sectorname,
                catName: company.catname,
                counts: 0,
                error: errorType, // Track error type for debugging
              };
            }
          })
        );
        
        // Add batch results to main results array
        results.push(...batchResults);
        
        // Add small delay between batches to prevent overwhelming the server
        if (i + batchSize < companiesToFetch.length) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between batches
        }
      }

      return { data: results, fromCache: false, cacheKey, query };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  companyData: [],
  loading: false,
  error: null,
  cachedData: {}, // Changed to object to store multiple query-specific caches
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
        const { data, fromCache, cacheKey } = action.payload;
        state.companyData = data;

        if (!fromCache && cacheKey) {
          // Initialize cachedData as object if it doesn't exist
          if (!state.cachedData) {
            state.cachedData = {};
          }
          // Store data with query-specific cache key
          state.cachedData[cacheKey] = { data, timestamp: Date.now() };
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
