import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import {
Box,
Paper,
Table,
TableBody,
TableCell,
TableSortLabel,
TableContainer,
TableHead,
TableRow,
CircularProgress,
Button
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useLocalStorage } from '../hooks/useLocalStorage';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; 


const AlertTable = (props) => {
      const [alertData, setAlertData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCategories: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0
  });

    const navigate = useNavigate();


  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('increase_percentage');

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = [...alertData].sort((a, b) => {
    if (orderBy === 'category') {
      return order === 'asc'
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    } else if (orderBy === 'increase_percentage') {
      return order === 'asc'
        ? a.increase_percentage - b.increase_percentage
        : b.increase_percentage - a.increase_percentage;
    }
    return 0;
  });

  
    const sortAlertData = (data) => {
      return [...data].sort((a, b) => {
        const alertLevelA = getAlertLevel(a.increase_percentage);
        const alertLevelB = getAlertLevel(b.increase_percentage);
  
        // Define priority order for alert levels
        const priority = {
          'high': 1,
          'medium': 2,
          'low': 3
        };
  
        // Sort by priority first
        if (priority[alertLevelA] !== priority[alertLevelB]) {
          return priority[alertLevelA] - priority[alertLevelB];
        }
  
        // If same priority, sort by percentage (descending)
        return b.increase_percentage - a.increase_percentage;
      });
    };
  
    const [cachedData, setCachedData] = useLocalStorage('categoryAlertData', {
      data: null,
      timestamp: null
    });
  
    const isCacheValid = () => {
      if (!cachedData.timestamp) return false;
      const now = Date.now();
      return (now - cachedData.timestamp) < CACHE_EXPIRATION;
    };
  
    const fetchCategoryAlerts = async (forceRefresh = false) => {
      if (!forceRefresh && isCacheValid() && cachedData.data) {
        const sortedData = sortAlertData(cachedData.data);
        setAlertData(sortedData);
        updateStats(sortedData);
        // setAlertData(cachedData.data);
        // updateStats(cachedData.data);
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        const response = await axios.post(
          'https://cdis.iitk.ac.in/consumer_api/get_category_alert',
          {
            last_days: 84,
            given_date: "2017-06-01",
            value: 1,
            CityName: "All",
            stateName: "All",
            complaintType: "All",
            complaintMode: "All",
            companyName: "All",
            complaintStatus: "All",
            threshold: 1.3,
            complaint_numbers: ["NA"]
          }
        );
  
        const data = response.data;
        const sortedData = sortAlertData(data);
        setAlertData(sortedData);
        updateStats(sortedData);
  
        setCachedData({
          data: data,
          timestamp: Date.now()
        });
      } catch (err) {
        setError('Failed to fetch category alerts. ' + (err.response?.data?.message || err.message));
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
  
    const updateStats = (data) => {
      const totalCategories = data.length;
      console.log('Updating stats with data:', data);
      const highAlerts = data.filter(item => item.increase_percentage > 20).length;
      const mediumAlerts = data.filter(item => item.increase_percentage > 10 && item.increase_percentage <= 20).length;
      const lowAlerts = data.filter(item => item.increase_percentage <= 10).length;
  
      setStats({
        totalCategories,
        highAlerts,
        mediumAlerts,
        lowAlerts
      });
    };
  
    useEffect(() => {
      fetchCategoryAlerts();
    }, []);
  
    const getAlertLevel = (percentage) => {
      if (percentage > 20) return 'high';
      if (percentage > 10) return 'medium';
      return 'low';
    };
  
    const getAlertColor = (level) => {
      switch (level) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        default: return 'success';
      }
    };


  return (
    <Box sx={{ p: 0 }}>
  <TableContainer
    component={Paper}
    sx={{
    position: 'relative',
    minHeight: '100px',
    maxHeight: '400px',
    overflowY: 'auto',
    }}
>
    {loading && (
        <Box
            sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
            }}
        >
            <CircularProgress size={20} />
        </Box>
    )}

    <Table size="small" sx={{ fontSize: '0.8rem' }}> 
      <TableHead>
        <TableRow>
          <TableCell
            sx={{ fontSize: '0.8rem', fontWeight: 600 }}
            sortDirection={orderBy === 'category' ? order : false}
          >
            {/* <TableSortLabel
            active={orderBy === 'category'}
            direction={orderBy === 'category' ? order : 'asc'}
            onClick={() => handleSort('category')}
            > */}
            {props.title}
            {/* </TableSortLabel>/ */}
        </TableCell>

        <TableCell
            sx={{ fontSize: '0.8rem', fontWeight: 600 }}
            sortDirection={orderBy === 'increase_percentage' ? order : false}
          >
            <TableSortLabel
              active={orderBy === 'increase_percentage'}
              direction={orderBy === 'increase_percentage' ? order : 'asc'}
              onClick={() => handleSort('increase_percentage')}
            >
              Increase %
            </TableSortLabel>
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {sortedData.slice(0, 5).map((row) => {
          const alertLevel = getAlertLevel(row.increase_percentage);
          return (
            <TableRow
              key={row.category}
              sx={{
                '&:hover': { backgroundColor: '#f9f9f9' },
              }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ fontSize: '0.8rem', py: 2 }}
              >
                {row.category}
              </TableCell>

              <TableCell
                sx={{
                  fontSize: '0.8rem',
                  py: 2,
                  color: `${getAlertColor(alertLevel)}.main`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 14 }} />
                {row.increase_percentage.toFixed(1)}%
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>

    {sortedData.length > 5 && (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          pr: 2,
          pb: 1,
        }}
      >
        <Button
          variant="text"
          size="small"
          sx={{ fontSize: '0.7rem', textTransform: 'none', paddingRight: 4 }}
          onClick={() => {
            if(props.title === "High Alerts"){
              navigate('/category-alert');
            } else if (props.title === "Categories"){
              navigate('/category-explorer');
            }
          }}
        >
          See more...
        </Button>
      </Box>
    )}
  </TableContainer>
</Box>


)
}

export default AlertTable
