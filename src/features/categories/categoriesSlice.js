import { createSlice } from '@reduxjs/toolkit';
import { fetchAllCategoriesThunk } from './categoriesThunk';

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    data: {},             
    totalComplaints: 0,
    totalCategories: 0,
    isLoading: false,
    error: null,
    lastFetched: null,     
  },
  reducers: {
    clearCategories: (state) => {
      state.data = {};
      state.totalComplaints = 0;
      state.totalCategories = 0;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategoriesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCategoriesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.categories;
        state.totalComplaints = action.payload.totalComplaints;
        state.totalCategories = Object.keys(action.payload.categories).length;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllCategoriesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
