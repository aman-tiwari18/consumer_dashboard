import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './features/categories/categoriesSlice';
import categoryAlertsReducer from "./features/alerts/categoryAlertSlice"
import companyDetailsReducer from "./features/company/companyDetailsSlice"


export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    categoryAlerts : categoryAlertsReducer,
    companyDetails: companyDetailsReducer,
  },
});

export default store;
