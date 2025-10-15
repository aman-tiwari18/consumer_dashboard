// pages/CategoryAlert.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Fade
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const AlertPage = () => {
  const [alertData, setAlertData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCategories: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0
  });

  // Add this sorting function after the getAlertLevel function
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
          complaintType: "Consumer good & Retail",
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

  const getAlertIcon = (level) => {
    switch (level) {
      case 'high': return <WarningIcon />;
      case 'medium': return <InfoIcon />;
      default: return <CheckCircleIcon />;
    }
  };

  const getBarChartOptions = () => {
    return {
      chart: {
        type: 'bar',
        height: 400,
        stacked: false,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }],
      colors: ['#ffd858', '#fa6b84'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 3,
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: alertData.map(item => item.category),
        labels: {
          rotate: -45,
          trim: true,
          maxHeight: 120
        }
      },
      yaxis: {
        // title: {
        //   text: 'Complaints per Hour'
        // }
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " complaints/hour"
          }
        }
      }
    };
  };

  const getBarChartSeries = () => {
    return [
      {
        name: 'Last 12 Weeks Average',
        data: alertData.map(item => item.previous_count_per_day)
      },
      {
        name: 'Last Week Average',
        data: alertData.map(item => item.current_count_per_day)
      }
    ];
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ p: 3 }}>
        {/* <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h4" component="h1">
            Category Alert Dashboard
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => fetchCategoryAlerts(true)}
            disabled={loading}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box> */}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100px',
                width: '390px',
                background: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)',
                borderRadius: 2,
                boxShadow: '0 2px 16px 0 rgba(33, 150, 243, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px 0 rgba(33, 150, 243, 0.2)'
                }
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(2, 39, 73, 0.6)', mb: 1, fontWeight: 500, fontSize: "1.8rem" }}>
                  Total Categories
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, ml: "20px", mt: "0px" }}>
                  {stats.totalCategories}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100px',
                width: '390px',
                background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                borderRadius: 2,
                boxShadow: '0 2px 16px 0 rgba(244, 67, 54, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px 0 rgba(244, 67, 54, 0.2)'
                }
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(83, 0, 0, 0.6)', mb: 1, fontWeight: 500, fontSize: "1.8rem" }}>
                  High Alerts
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.dark', ml: "20px", mt: "0px" }}>
                  {stats.highAlerts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100px',
                width: '390px',
                background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE082 100%)',
                borderRadius: 2,
                boxShadow: '0 2px 16px 0 rgba(255, 193, 7, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px 0 rgba(255, 193, 7, 0.2)'
                }
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(121, 109, 0, 0.6)', mb: 1, fontWeight: 500, fontSize: "1.8rem" }}>
                  Medium Alerts
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.dark', ml: "20px", mt: "0px" }}>
                  {stats.mediumAlerts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100px',
                width: '390px',
                background: 'linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)',
                borderRadius: 2,
                boxShadow: '0 2px 16px 0 rgba(76, 175, 80, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px 0 rgba(76, 175, 80, 0.2)'
                }
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(3, 27, 1, 0.6)', mb: 1, fontWeight: 500, fontSize: "1.8rem" }}>
                  Normal Alerts
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.dark', ml: "20px", mt: "0px" }}>
                  {stats.lowAlerts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer
          component={Paper}
          sx={{
            position: 'relative',
            minHeight: '200px'
          }}
        >
          {loading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1
            }}>
              <CircularProgress />
            </Box>
          )}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell align="right">Last 12 Weeks Grievance Counts/Day</TableCell>
                <TableCell align="right">Last 1 Week Grievance Counts/Day</TableCell>
                <TableCell align="right">Increase %</TableCell>
                <TableCell align="center">Alert Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alertData.map((row) => {
                const alertLevel = getAlertLevel(row.increase_percentage);
                return (
                  <TableRow
                    key={row.category}
                    sx={{
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      // backgroundColor: alertLevel === 'high' ? '#fff8e1' : 'inherit'
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {row.category}
                    </TableCell>
                    <TableCell align="center">
                      {row.previous_count_per_day.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      {row.current_count_per_day.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: `${getAlertColor(alertLevel)}.main`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 1
                      }}
                    >
                      <TrendingUpIcon />
                      {row.increase_percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        // icon={getAlertIcon(alertLevel)}
                        label={alertLevel.toUpperCase()}
                        color={getAlertColor(alertLevel)}
                        variant={alertLevel === 'high' ? 'filled' : 'outlined'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
          <Typography variant="h6" gutterBottom>
            Per Hour Complaints Comparison
          </Typography>
          {loading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1
            }}>
              <CircularProgress />
            </Box>
          )}
          <ReactApexChart
            options={getBarChartOptions()}
            series={getBarChartSeries()}
            type="bar"
            height={400}
          />
        </Paper>
      </Box>
    </Fade>
  );
};

export default AlertPage;