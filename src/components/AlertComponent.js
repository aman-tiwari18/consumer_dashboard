import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  Box,
  Typography,
  Alert,
  Card,
  Grid,
  Fade,
} from '@mui/material'
import { useLocalStorage } from '../hooks/useLocalStorage';
import AlertTable from './AlertTable';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; 



const AlertComponent = (props) => {
  const [alertData, setAlertData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCategories: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0
  });



  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('category');

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
      <Fade in timeout={500}>
        <Box sx={{ p: 2 }}>
        
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
        <Grid
          container
          spacing={2}
          sx={{
            mb: 2,
          }}
        >
          {[
            {
              title: 'Total Complaints',
              valueKey: 'totalCount', // comes from props
              bg: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)',
              shadow: 'rgba(33, 150, 243, 0.1)',
              hoverShadow: 'rgba(33, 150, 243, 0.2)',
              color: 'rgba(2, 39, 73, 0.6)',
              textColor: 'text.primary',
            },
            {
              title: 'Total Categories',
              valueKey: 'categoriesCount', // comes from props
              bg: 'linear-gradient(135deg, #FFF8E1 0%, #FFE082 100%)',
              shadow: 'rgba(255, 193, 7, 0.1)',
              hoverShadow: 'rgba(255, 193, 7, 0.2)',
              color: 'rgba(121, 109, 0, 0.6)',
              textColor: 'warning.dark',
            },
            {
              title: 'High Alerts',
              valueKey: 'highAlerts', // comes from stats
              bg: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
              shadow: 'rgba(244, 67, 54, 0.1)',
              hoverShadow: 'rgba(244, 67, 54, 0.2)',
              color: 'rgba(83, 0, 0, 0.6)',
              textColor: 'error.dark',
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={3} md={2.5} key={index}>
              <Card
                sx={{
                  height: 70,
                  width: '100%',
                  background: item.bg,
                  borderRadius: 2,
                  paddingInline: 2,
                  gap: 1,
                  boxShadow: `0 2px 16px 0 ${item.shadow}`,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 4px 20px 0 ${item.hoverShadow}`,
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: item.color, fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: item.textColor }}
                >
                  {item.valueKey === 'totalCount'
                    ? props.totalCount
                    : item.valueKey === 'categoriesCount'
                    ? props.categoriesCount
                    : stats[item.valueKey]}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>



        <Grid container rowSpacing={1} padding={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid size={6}>
          <AlertTable title= "High Alerts"/>
          </Grid>
          <Grid size={6}>
          <AlertTable title= "Categories"/>
          
          </Grid>
          <Grid size={6}>
          <AlertTable title= "Companies"/>
          </Grid>
          <Grid size={6}>
          <AlertTable title= "States"/>
          </Grid>
      </Grid>
        </Box>
      </Fade>
    );
}

export default AlertComponent