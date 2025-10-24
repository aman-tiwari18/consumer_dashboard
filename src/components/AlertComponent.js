import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategoryAlerts } from '../features/alerts/categoryAlertSlice';
import { fetchCompanyDetails } from '../features/company/companyDetailsSlice';
import AlertData from "../resources/alerts_with_percentage.json";

import {
  Box,
  Typography,
  Alert,
  Card,
  Grid,
  Fade,
} from '@mui/material';
import AlertTable from './AlertTable';

const AlertComponent = (props) => {
  const dispatch = useDispatch();

  // Redux selectors
  const { 
    alertData, 
    loading: alertLoading, 
    error: alertError,
    stats: categoryStats 
  } = useSelector((state) => state.categoryAlerts);

  const { 
    companyData, 
    loading: companyLoading, 
    error: companyError 
  } = useSelector((state) => state.companyDetails);

  // Local state
  const [stats, setStats] = useState({
    totalCategories: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0
  });

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('category');

  const loading = alertLoading || companyLoading;
  const error = alertError || companyError;


  useEffect(() => {
    dispatch(fetchCategoryAlerts({ forceRefresh: false }));
    dispatch(fetchCompanyDetails({ limit: 10, forceRefresh: false }));
  }, [dispatch]);

  useEffect(() => {
    if (alertData && alertData.length > 0) {
      updateStats(alertData);
    }
  }, [alertData]);

  const updateStats = (data) => {
    const totalCategories = data.length;
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

  const getAlertLevel = (percentage) => {
    if (percentage > 20) return 'high';
    if (percentage > 10) return 'medium';
    return 'low';
  };

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
              valueKey: 'totalCount',
              bg: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)',
              shadow: 'rgba(33, 150, 243, 0.1)',
              hoverShadow: 'rgba(33, 150, 243, 0.2)',
              color: 'rgba(2, 39, 73, 0.6)',
              textColor: 'text.primary',
            },
            {
              title: 'Total Categories',
              valueKey: 'categoriesCount',
              bg: 'linear-gradient(135deg, #FFF8E1 0%, #FFE082 100%)',
              shadow: 'rgba(255, 193, 7, 0.1)',
              hoverShadow: 'rgba(255, 193, 7, 0.2)',
              color: 'rgba(121, 109, 0, 0.6)',
              textColor: 'warning.dark',
            },
            {
              title: 'High Alerts',
              valueKey: 'highAlerts',
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
            <AlertTable title="High Alerts" data={alertData} />
          </Grid>

          <Grid size={6}>
            <AlertTable title="Categories" data={props.categoryData} />
          </Grid>

          <Grid size={6}>
            <AlertTable title="Companies" data={companyData} loading={companyLoading} />
          </Grid>

          <Grid size={6}>
            <AlertTable title="States" data={props.stateData} />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default AlertComponent;