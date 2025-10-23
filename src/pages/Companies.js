// pages/CategoryAlert.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import SearchHistory from '../components/SearchHistory';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useApiData } from '../hooks/useApiData';
import { useHistoryHandler } from '../hooks/useHistoryHandler';
import companiesData from "../resources/companies_with_complaints.json"
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
  InputAdornment,
  Button,
  Toolbar as MuiToolbar,
  Stack,
  TableSortLabel
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

      const results = await Promise.all(
        companies.slice(0, 50).map(async (company) => {
          const payload = {
            query: company.companyname,
            skip: 0,
            size: 0,
            start_date: "2025-01-01",
            end_date: "2025-03-30",
            value: 2,
            CityName: "All",
            stateName: "All",
            complaintType: "All",
            complaintMode: "All",
            companyName: "All",
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
              }
            );

            return {
              companyName: company.companyname,
              sectorName: company.sectorname,
              catName: company.catname,
              counts: response.data?.total_count || 0,
            };
          } catch (err) {
            console.error(`Error fetching count for ${company.companyname}:`, err);
            return {
              companyName: company.companyname,
              sectorName: company.sectorname,
              catName: company.catname,
              counts: 0,
            };
          }
        })
      );

      setCompanyData(results);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching company details:", error);
      setError("Failed to fetch company details");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return companyData;
    return companyData.filter(row =>
      row[filterField]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companyData, searchTerm, filterField]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

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

  const handleRefresh = () => {
    fetchCompanyDetails();
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
              Showing {sortedData.length} of {companyData.length} companies
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
              {sortedData.length > 0 ? (
                sortedData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }
                    }}
                  >
                    <TableCell sx={{ textAlign: 'left' }}>{row.companyName}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.sectorName}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.catName}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        label={row.counts}
                        // color={row.counts > 50 ? 'error' : row.counts > 20 ? 'warning' : 'success'}
                        size="small"
                      />
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
      </Box>
    </Fade>
  );
};

export default Companies;