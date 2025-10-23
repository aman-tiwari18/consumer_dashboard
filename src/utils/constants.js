// utils/constants.js
export const API_CONSTANTS = {
    DEFAULT_PROMPT: `Issues with PDS, ration cards, food quality in fair price shops, 
      sugar, wheat, rice distribution, essential commodity prices, food adulteration, 
      or problems with FSSAI compliance`,
    
    INITIAL_FILTERS: {
      query: '',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      value: 1,
      threshold: 1.3,
      complaintNumbers: ["NA"]
    }
  };