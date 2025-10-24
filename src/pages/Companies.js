// pages/CategoryAlert.js
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import SearchHistory from '../components/SearchHistory';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useApiData } from '../hooks/useApiData';
import { useHistoryHandler } from '../hooks/useHistoryHandler';
import { useFilters } from '../hooks/useFilters';
import companiesData from "../resources/companies_with_complaints.json"
import {
  Box,
  CircularProgress,
  Alert,
  Chip,
  Fade,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Toolbar as MuiToolbar,
  Stack,
  TableSortLabel,
  TablePagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

const Companies = () => {
  const [companyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('companyName');
  const [orderBy, setOrderBy] = useState('companyName');
  const [order, setOrder] = useState('asc');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Load more functionality
  const [totalAvailableCompanies, setTotalAvailableCompanies] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

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

  const { searchHistory, saveToHistory, clearHistory, deleteHistoryItem } = useSearchHistory();
  const { filters } = useFilters();
  
  // Get company data from Redux store (used when search history exists)
  const { 
    companyData: reduxCompanyData, 
    loading: reduxLoading 
  } = useSelector((state) => state.companyDetails);
  const { handleHistoryClick } = useHistoryHandler({
    fetchSemanticRCA,
    fetchSpatialData,
    fetchUserData,
    setTotalCounts,
    setIsLoading
  });

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "https://cdis.iitk.ac.in/consumer_api/get_company_details?sectorname=All&companyname=All&categoryname=All",
        {},
        { headers: { Accept: "application/json" } }
      );

      const companies = res.data || [];
      setTotalAvailableCompanies(companies.length);

      // Limit companies for better performance - can be increased with "Load More" functionality
      const maxCompanies = 100; // Reasonable limit for initial load
      const companiesToProcess = companies.slice(0, maxCompanies);
      
      console.log(`Fetching data for ${companiesToProcess.length} companies (limited from ${companies.length} total) - all sectors`);
      
      // Process in batches to prevent timeouts
      const batchSize = 8;
      const results = [];
      
      for (let i = 0; i < companiesToProcess.length; i += batchSize) {
        const batch = companiesToProcess.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(companiesToProcess.length / batchSize)} (${batch.length} companies)`);
        
        const batchResults = await Promise.all(
          batch.map(async (company, batchIndex) => {
            const payload = {
              query: filters.query || '', // Use current query from filters
              skip: 0,
              size: 0,
              start_date: "2025-01-01",
              end_date: "2025-03-30",
              value: 2,
              CityName: "All",
              stateName: "All",
              complaintType: "All",
              complaintMode: "All",
              companyName: company.companyname,
              complaintStatus: "All",
              threshold: 1.5,
              complaint_numbers: ["NA"],
            };

            try {
              const response = await axios.post(
                "https://cdis.iitk.ac.in/consumer_api/search",
                payload,
                {
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  timeout: 15000, // Reduced to 15 seconds per request
                }
              );

              return {
                companyName: company.companyname,
                sectorName: company.sectorname,
                catName: company.catname,
                counts: response.data?.total_count || 0,
              };
            } catch (err) {
              const errorType = err.code === 'ECONNABORTED' ? 'timeout' : 'network';
              console.error(`Error fetching count for ${company.companyname} (${errorType}):`, err.message);
              return {
                companyName: company.companyname,
                sectorName: company.sectorname,
                catName: company.catname,
                counts: 0,
                error: errorType,
              };
            }
          })
        );
        
        // Add batch results to main results array
        results.push(...batchResults);
        
        // Add delay between batches to prevent overwhelming the server
        if (i + batchSize < companiesToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay between batches
        }
      }

      setCompanyData(results);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching company details:", error);
      setError("Failed to fetch company details");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch local company data when search history is empty
    // When search history exists, we use Redux company data from AlertComponent
    if (!searchHistory || searchHistory.length === 0) {
      fetchCompanyDetails();
    }
  }, [searchHistory]); // Re-fetch when search history changes

  // Determine which data source to use
  const currentCompanyData = useMemo(() => {
    // If search history exists, use Redux company data (filtered by current query)
    // Otherwise, use local company data (all companies from all sectors)
    if (searchHistory && searchHistory.length > 0) {
      return reduxCompanyData || [];
    }
    return companyData;
  }, [searchHistory, reduxCompanyData, companyData]);

  // Determine loading state
  const isCurrentlyLoading = useMemo(() => {
    if (searchHistory && searchHistory.length > 0) {
      return reduxLoading;
    }
    return loading;
  }, [searchHistory, reduxLoading, loading]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return currentCompanyData;
    return currentCompanyData.filter(row =>
      row[filterField]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentCompanyData, searchTerm, filterField]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0); // Reset pagination when clearing search
  };

  // Reset pagination when search term changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm, currentCompanyData]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort filtered data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle numeric values
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

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, page, rowsPerPage]);

  const handleRefresh = () => {
    // If search history exists, the data will be refreshed by AlertComponent
    // If no search history, refresh local company data
    if (!searchHistory || searchHistory.length === 0) {
      fetchCompanyDetails();
    }
    // Reset pagination when refreshing
    setPage(0);
    // Note: When search history exists, the Redux data is managed by AlertComponent
    // and will be automatically updated when the user interacts with categories
  };

  const handleExport = () => {
    const csv = [
      ['Company Name', 'Sector', 'Category Name', 'Complaints Count'],
      ...sortedData.map(row => [
        row.companyName,
        row.sectorName,
        row.catName,
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

        {/* Status Indicator */}
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          {searchHistory && searchHistory.length > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label="Category Filter Active" 
                color="primary" 
                size="small" 
              />
              <Typography variant="body2" color="text.secondary">
                Showing top 50 companies for the selected category query. Data is synchronized with AlertComponent.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label="All Companies" 
                color="default" 
                size="small" 
              />
              <Typography variant="body2" color="text.secondary">
                Showing {currentCompanyData.length} of {totalAvailableCompanies} companies from all sectors.
              </Typography>
              {totalAvailableCompanies > currentCompanyData.length && (
                <Chip 
                  label={`${totalAvailableCompanies - currentCompanyData.length} more available`} 
                  color="info" 
                  size="small" 
                />
              )}
            </Box>
          )}
        </Box>

        {/* Custom Toolbar */}
        <Paper sx={{ mb: 3 }}>
          <MuiToolbar sx={{ gap: 2, flexWrap: 'wrap', display: 'flex', alignItems: 'center' }}>
            {/* Search Section */}
            <TextField
              size="small"
              placeholder="Search companies..."
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
                disabled={isCurrentlyLoading}
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
              {sortedData.length > 0 ? (
                <>
                  Showing {Math.min((page * rowsPerPage) + 1, sortedData.length)}-{Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} companies
                  {searchTerm && ` (filtered from ${currentCompanyData.length} total)`}
                </>
              ) : (
                `No companies found${searchTerm ? ' matching search' : ''}`
              )}
            </Box>
          </MuiToolbar>
        </Paper>

        {/* Table */}
        <TableContainer component={Paper} sx={{ position: 'relative' }}>
          {isCurrentlyLoading && (
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
                    // active={orderBy === 'companyName'}
                    active = {true}
                    direction={orderBy === 'companyName' ? order : 'asc'}
                    onClick={() => handleSort('companyName')}
                  >
                    Company Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>
                  <TableSortLabel
                    // active={orderBy === 'sectorName'}
                    active = {true}
                    direction={orderBy === 'sectorName' ? order : 'asc'}
                    onClick={() => handleSort('sectorName')}
                  >
                    Sector
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>
                  <TableSortLabel
                    // active={orderBy === 'catName'}
                    active = {true}
                    direction={orderBy === 'catName' ? order : 'asc'}
                    onClick={() => handleSort('catName')}
                  >
                    Category Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>
                  <TableSortLabel
                    // active={orderBy === 'counts'}
                    active = {true}
                    direction={orderBy === 'counts' ? order : 'asc'}
                    onClick={() => handleSort('counts')}
                  >
                    Complaints Count
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }
                    }}
                  >
                    <TableCell sx={{ textAlign: 'left' }}>
                      {row.companyName}
                      {row.error && (
                        <Chip 
                          label={row.error} 
                          size="small" 
                          color="error" 
                          sx={{ ml: 1, fontSize: '0.7rem', height: '16px' }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.sectorName}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.catName}</TableCell>
                    <TableCell sx={{ 
                      textAlign: 'right', 
                      fontWeight: 'bold',
                      color: row.error ? 'error.main' : 'inherit'
                    }}>
                      {row.counts}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
                    No companies found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Paper sx={{ mt: 2 }}>
          <TablePagination
            component="div"
            count={sortedData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            showFirstButton
            showLastButton
            sx={{
              '& .MuiTablePagination-toolbar': {
                paddingLeft: 2,
                paddingRight: 2,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Paper>
      </Box>
    </Fade>
  );
};

export default Companies;