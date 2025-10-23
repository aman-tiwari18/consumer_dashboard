// pages/CategoryAlert.js
import React, { useState, useEffect , useMemo} from 'react';
import axios from 'axios';
import SearchHistory from '../components/SearchHistory';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useApiData } from '../hooks/useApiData';
import { useHistoryHandler } from '../hooks/useHistoryHandler';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Alert,
  Chip,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Button,
  Toolbar as MuiToolbar,
  Stack,
  TableSortLabel
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const AlertPage = () => {
  const [alertData, setAlertData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('category')
  const [orderBy, setOrderBy] = useState('category');
  const [order, setOrder] = useState('desc');
  const [stats, setStats] = useState({
    totalCategories: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0
  });
  const {
          totalCounts,
          setTotalCounts,
          userData,
          isLoading,
          setIsLoading,
          fetchCategories: fetchCategoriesApi,
          fetchSemanticRCA,
          fetchUserData,
          fetchSpatialData,
          stateData,
          setStateData,
      } = useApiData();

  const handleClearSearch = () => {
    setSearchTerm('');
  };
  const { searchHistory, saveToHistory, clearHistory, deleteHistoryItem } = useSearchHistory();
  const { handleHistoryClick } = useHistoryHandler({
        // filters,
        // updateFilters,
        fetchSemanticRCA,
        fetchSpatialData,
        fetchUserData,
        // fetchCategories,
        setTotalCounts,
        setIsLoading
  });

    const filteredData = useMemo(() => {
      if (!searchTerm) return alertData;
      return alertData.filter(row =>
        row[filterField]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [alertData, searchTerm, filterField]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const rows = useMemo(() => (
    alertData.map((row, index) => ({ id: index, ...row }))
  ), [alertData]);

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



    const sortedData = useMemo(() => {
      const sorted = [...filteredData].sort((a, b) => {
        let aValue = a[orderBy];
        let bValue = b[orderBy];
  
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return order === 'asc' ? aValue - bValue : bValue - aValue;
        }
  
        // Handle string values
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
  
        if (order === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      return sorted;
    }, [filteredData, orderBy, order]);

  const handleRefresh = () => {
    fetchCategoryAlerts();
  };

  const handleExport = () => {
    const csv = [
      ['Company Name', 'Sector', 'Category Name', 'Complaints Count'],
      ...sortedData.map(row => [
        row.category,
        row.previous_count_per_day,
        row.current_count_per_day,
        row.counts
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'companies.csv';
    a.click();
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
          given_date: "2025-09-01",
          value: 1,
          CityName: "All",
          stateName: "All",
          complaintType: "All",
          complaintMode: "All",
          category: "All",
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

  const columns = useMemo(() => [
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      sortable: true,
    },
    {
      field: 'previous_count_per_day',
      headerName: 'Last 12 Weeks Grievance Counts/Day',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value?.toFixed(2)
    },
    {
      field: 'current_count_per_day',
      headerName: 'Last 1 Week Grievance Counts/Day',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value?.toFixed(2)
    },
    {
      field: 'increase_percentage',
      headerName: 'Increase %',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const alertLevel = getAlertLevel(params.value);
        const color = getAlertColor(alertLevel);
        return (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: `${color}.main`
          }}>
            <TrendingUpIcon fontSize="small" />
            {params.value?.toFixed(1)}%
          </Box>
        );
      },
    },
    {
      field: 'alert_level',
      headerName: 'Alert Level',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const alertLevel = getAlertLevel(params.row.increase_percentage);
        const color = getAlertColor(alertLevel);
        return (
          <Chip
            label={alertLevel.toUpperCase()}
            color={color}
            variant={alertLevel === 'high' ? 'filled' : 'outlined'}
            size="small"
          />
        );
      },
    },
  ], [getAlertLevel, getAlertColor]);

  useEffect(() => {
    fetchCategoryAlerts();
  }, []);




  return (
    <Fade in timeout={500}>
      <Box sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <SearchHistory
                    searchHistory={searchHistory}
                    onHistoryClick={handleHistoryClick}
                    onClearHistory={clearHistory}
                    onDeleteHistoryItem={deleteHistoryItem}
        />

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


        <Box sx={{ p: 2 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
        
                <SearchHistory
                  searchHistory={searchHistory}
                  onHistoryClick={handleHistoryClick}
                  onClearHistory={clearHistory}
                  onDeleteHistoryItem={deleteHistoryItem}
                />
        
                {/* Custom Toolbar */}
                <Paper sx={{ mb: 3 }}>
                  <MuiToolbar sx={{ gap: 2, flexWrap: 'wrap', display: 'flex', alignItems: 'center' }}>
                    {/* Search Section */}
                    <TextField
                      size="small"
                      placeholder="Search Alerts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1, minWidth: '250px' }}
                    />
        
                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ClearAllIcon />}
                        onClick={handleClearSearch}
                        disabled={!searchTerm}
                      >
                        Clear
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={loading}
                      >
                        Refresh
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExport}
                      >
                        Export
                      </Button>
                    </Stack>
        
                    {/* Results Count */}
                    <Box sx={{ ml: 'auto', fontSize: '0.9rem', color: 'text.secondary' }}>
                      Showing {sortedData.length} of {alertData.length} companies
                    </Box>
                  </MuiToolbar>
                </Paper>
        
                {/* Table */}
                <TableContainer component={Paper} sx={{ position: 'relative' }}>
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
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      zIndex: 10,
                    }}>
                      <CircularProgress />
                    </Box>
                  )}
        
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'left' }}>
                          <TableSortLabel
                            // active={orderBy === 'category'}
                            active = {true}
                            direction={orderBy === 'category' ? order : 'asc'}
                            onClick={() => handleSort('category')}
                          >
                            Alerts Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>
                          <TableSortLabel
                            // active={orderBy === 'previous_count_per_day'}
                            active = {true}
                            direction={orderBy === 'previous_count_per_day' ? order : 'asc'}
                            onClick={() => handleSort('previous_count_per_day')}
                          >
                           previous_count_per_day
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>
                          <TableSortLabel
                            // active={orderBy === 'current_count_per_day'}
                            active = {true}
                            direction={orderBy === 'current_count_per_day' ? order : 'asc'}
                            onClick={() => handleSort('current_count_per_day')}
                          >
                            current_count_per_day
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>
                          <TableSortLabel
                            // active={orderBy === 'counts'}
                            active = {true}
                            direction={orderBy === 'counts' ? order : 'asc'}
                            onClick={() => handleSort('counts')}
                          >
                            Increase %
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          Alert level
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedData.length > 0 ? (
                        sortedData.map((row, index) => {
                          const alertLevel = getAlertLevel(row.increase_percentage);
                          
                          return (
                            <TableRow
                              key={index}
                              sx={{
                                '&:hover': { backgroundColor: '#f5f5f5' },
                                '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }
                              }}
                            >
                              <TableCell sx={{ textAlign: 'left' }}>{row.category}</TableCell>
                              <TableCell sx={{ textAlign: 'center' }}>{row.previous_count_per_day}</TableCell>
                              <TableCell sx={{ textAlign: 'center' }}>{row.current_count_per_day}</TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  color: `${getAlertColor(alertLevel)}.main`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 1
                                }}
                              >
                                <TrendingUpIcon />
                                {row.increase_percentage.toFixed(1)}%
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={alertLevel.toUpperCase()}
                                  color={getAlertColor(alertLevel)}
                                  variant={alertLevel === 'high' ? 'filled' : 'outlined'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                            No Alerts found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
      </Box>
    </Fade>
  );
};

export default AlertPage;