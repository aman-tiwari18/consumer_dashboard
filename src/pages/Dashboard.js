import React, { useState, useEffect, useRef, useCallback} from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllCategoriesThunk } from '../features/categories/categoriesThunk';

import FilterPanel from '../components/FilterPanel';
import SearchHistory from '../components/SearchHistory';
import { fetchCategoryAlerts } from '../features/alerts/categoryAlertSlice';

import { useFilters } from '../hooks/useFilters';
import { useApiData } from '../hooks/useApiData';
import { useStateData } from '../hooks/useStateData';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useDataPointHandler } from '../hooks/useDataPointHandler';
import { useHistoryHandler } from '../hooks/useHistoryHandler';
import { useApplyFilters } from '../hooks/useApplyFilters';
import AlertComponent from '../components/AlertComponent';
import ProportionalBlocks from '../components/ProprotionalBlocks';

const Dashboard = () => {

    const [categories, setCategories] = useState({});
    const dispatch = useDispatch();
    const { alertData, loading, error, stats } = useSelector(state => state.categoryAlerts);
//   const { data: categories, totalComplaints, totalCategories, isLoading } = useSelector(
//     (state) => state.categories
//   );
  const [totalComplaintsCount, setTotalComplaintsCounts] = useState(0);

  const { defaultStateData } = useStateData();
  const { filters, handleFilterChange, updateFilters } = useFilters();
  const { searchHistory, saveToHistory, clearHistory, deleteHistoryItem } = useSearchHistory();
  const {
    totalCounts,
    setTotalCounts,
    userData,
    isLoading,
    setIsLoading,
    fetchCategories: fetchCategoriesApi,
    // fetchCategoryWithCount: fetchcategoryWithCount,
    fetchSemanticRCA,
    fetchUserData,
    fetchSpatialData,
    stateData,
    setStateData,
  } = useApiData(defaultStateData);

   const [dividerPos, setDividerPos] = useState(50); 
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, []);
  
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPos = ((e.clientX - rect.left) / rect.width) * 100;
    // Constrain between 20% and 80% for better usability
    const constrainedPos = Math.max(20, Math.min(80, newPos));
    setDividerPos(constrainedPos);
  }, []);

  // Cleanup effect for mouse events
  useEffect(() => {
    const cleanup = () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      isDragging.current = false;
    };

    // Add global mouse up listener to handle cases where mouse is released outside the container
    const globalMouseUp = () => {
      if (isDragging.current) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', globalMouseUp);
    window.addEventListener('beforeunload', cleanup);

    return () => {
      document.removeEventListener('mouseup', globalMouseUp);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [handleMouseUp]);

  const fetchCategories = async (prompt) => {
    const { updatedData, totalCount } = await fetchCategoriesApi(prompt, setCategories);
    setCategories(updatedData);
    setTotalCounts(totalCount);
  };

//     const fetchCategoryWithCount = async (prompt) => {
//     const { updatedData, totalCount } = await fetchcategoryWithCount(prompt, setCategories);
//     setCategories(updatedData);
//     setTotalCounts(totalCount);
//   };

  const { handleDataPointClick } = useDataPointHandler({
    categories,
    filters,
    handleFilterChange,
    fetchSemanticRCA,
    fetchSpatialData,
    fetchUserData,
    fetchCategories,
    // fetchCategoryWithCount,
    saveToHistory,
    setIsLoading,
  });

  const { handleHistoryClick } = useHistoryHandler({
    filters,
    updateFilters,
    fetchSemanticRCA,
    fetchSpatialData,
    fetchUserData,
    fetchCategories,
    // fetchCategoryWithCount,
    setTotalCounts,
    setIsLoading,
  });

  const { handleApplyFilters } = useApplyFilters({
    filters,
    updateFilters,
    fetchSemanticRCA,
    fetchUserData,
    fetchSpatialData,
    fetchCategories,
    // fetchCategoryWithCount,
    saveToHistory,
    totalCounts,
    stateData,
    setIsLoading,
  });

  const formatCategories = (categoriesObj) => {
    if (!categoriesObj || typeof categoriesObj !== 'object') return [];
    return Object.entries(categoriesObj).map(([key, value]) => ({
      categoryName: key,
      counts: value.count || 0,
    }));
  };

  const categoriesData = formatCategories(categories);

useEffect(() => {
  let cancelled = false;

  const CATEGORY_COUNT = "categoryDataCache";
  const CACHE_EXPIRY_HOURS = 24;

  const isCacheValid = (cacheTimestamp) => {
    if (!cacheTimestamp) return false;
    const now = Date.now();
    const age = (now - cacheTimestamp) / (1000 * 60 * 60);
    return age < CACHE_EXPIRY_HOURS;
  };

  const fetchAllCategories = async () => {
    if (setIsLoading) setIsLoading(true);

    try {
      const cached = JSON.parse(localStorage.getItem(CATEGORY_COUNT) || "{}");
      if (cached?.timestamp && isCacheValid(cached.timestamp)) {
        console.log("⚡ Using cached category data");
        setCategories(cached.data.categories || {});
        setTotalComplaintsCounts(cached.data.totalComplaints || 0);
        if (setTotalCounts) setTotalCounts(cached.data.totalComplaints || 0);
        if (setIsLoading) setIsLoading(false);
        return;
      }

      const res = await axios.get("https://cdis.iitk.ac.in/consumer_api/get_all_categories", {
        headers: { accept: "application/json" },
      });

      const data = res?.data || [];
      if (cancelled) return;

      const baseCategories = data.reduce((acc, item) => {
        acc[item.category] = {
          prompt: item.categoryPrompt || "",
          count: 0,
        };
        return acc;
      }, {});

      const categoryNames = Object.keys(baseCategories);
      setCategories(baseCategories);

      let totalComplaints = 0;
      const updatedCats = { ...baseCategories };

      const CHUNK_SIZE = 5;
      for (let i = 0; i < categoryNames.length; i += CHUNK_SIZE) {
        const chunk = categoryNames.slice(i, i + CHUNK_SIZE);

        const promises = chunk.map(async (categoryName) => {
          try {
            const response = await fetchSemanticRCA({
              query: categoryName,
              startDate: null,
              endDate: null,
              threshold: 1.3,
              value: 1,
              CityName: "All",
              stateName: "All",
              complaintType: "All",
              complaintMode: "All",
              companyName: "All",
              complaintStatus: "All",
              complaintNumbers: ["NA"],
            });

            let count = 0;
            if (Array.isArray(response)) {
              count = response.length;
            } else if (Array.isArray(response?.data)) {
              count = response.data.length;
            } else {
              const r = response?.data;
              count = r?.totalCount ?? r?.total_counts ?? r?.count ?? r?.totalcount ?? r?.total ?? 0;
            }

            updatedCats[categoryName].count = count;
            totalComplaints += count;
          } catch {
            updatedCats[categoryName].count = 0;
          }
        });

        await Promise.all(promises);
        if (cancelled) break;

        setCategories({ ...updatedCats });
        setTotalComplaintsCounts(totalComplaints);
        if (setTotalCounts) setTotalCounts(totalComplaints);
      }

      localStorage.setItem(
        CATEGORY_COUNT,
        JSON.stringify({
          timestamp: Date.now(),
          data: {
            categories: updatedCats,
            totalComplaints,
          },
        })
      );
    } catch (err) {
    } finally {
      if (!cancelled && setIsLoading) setIsLoading(false);
    }
  };

  fetchAllCategories();

  return () => {
    cancelled = true;
  };
}, [fetchSemanticRCA, setIsLoading, setTotalCounts]);


  const totalComplaints = categories 
    ? Object.values(categories).reduce((sum, cat) => sum + (cat.count || 0), 0) 
    : 0;

  const totalCategories = Object.keys(categories).length


 useEffect(() => {
    if (searchHistory?.length > 0) {
      const lastQuery = searchHistory[searchHistory.length - 1];
      if (lastQuery?.params) {
        updateFilters(lastQuery.params);
      }
    }
  }, [searchHistory]);




  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: '90vw' }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'background.paper' }}>
        <SearchHistory
          searchHistory={searchHistory}
          onHistoryClick={handleHistoryClick}
          onClearHistory={clearHistory}
          onDeleteHistoryItem={deleteHistoryItem}
        />
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          isLoading={isLoading}
          searchHistory={searchHistory}
          clearHistory={clearHistory}
        />
      </Box>

      <div 
        ref={containerRef}
        style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          padding: '0 2rem', 
          height: 'calc(100vh - 200px)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Left Panel - ProportionalBlocks */}
        <div style={{ 
          width: `${dividerPos}%`, 
          minWidth: '320px',
          maxWidth: '75%',
          overflow: 'hidden',
          paddingRight: '0.5rem',
          transition: isDragging.current ? 'none' : 'width 0.1s ease',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          <ProportionalBlocks
            categories={categories}
            totalCounts={totalCounts || totalComplaints}
            onDataPointClick={handleDataPointClick}
            isLoading={isLoading}
            containerWidth={dividerPos}
          />
        </div>

        {/* Resizable Divider */}
        <div
          style={{
            width: '8px',
            cursor: 'col-resize',
            backgroundColor: isDragging.current ? '#2196F3' : '#e0e0e0',
            borderRadius: '4px',
            margin: '0 4px',
            position: 'relative',
            transition: isDragging.current ? 'none' : 'all 0.2s ease',
            boxShadow: isDragging.current ? '0 0 8px rgba(33, 150, 243, 0.3)' : 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={(e) => {
            if (!isDragging.current) {
              e.target.style.backgroundColor = '#bdbdbd';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging.current) {
              e.target.style.backgroundColor = '#e0e0e0';
            }
          }}
        >
          {/* Drag Handle Visual Indicator */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '40px',
            backgroundColor: '#9e9e9e',
            borderRadius: '2px',
            opacity: 0.7
          }} />
        </div>

        {/* Right Panel - AlertComponent */}
        <div style={{ 
          width: `${100 - dividerPos}%`, 
          minWidth: '320px',
          overflow: 'hidden',
          paddingLeft: '0.5rem',
          transition: isDragging.current ? 'none' : 'width 0.1s ease'
        }}>
          <AlertComponent
            totalCount={totalCounts || totalComplaints}
            categoriesCount={totalCategories}
            categoryData={categoriesData}
            stateData={stateData}
          />
        </div>
      </div>
      
    </Box>
  );
};

export default Dashboard;