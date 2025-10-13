// utils/helpers.js
export const createSearchParams = (filters) => ({
    query: filters.query,
    start_date: filters.startDate.toISOString().split('T')[0],
    end_date: filters.endDate.toISOString().split('T')[0],
    threshold: filters.threshold,
    value: filters.value,
    CityName: 'All',
    stateName: 'All',
    complaintType: 'All',
    complaintMode: 'All',
    companyName: 'All',
    complaintStatus: 'All',
  });
  