import React, { useState, useEffect , useRef} from 'react';
import axios from 'axios';
import {
    Box,
    Grid,
    Paper,
    TextField,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Fade,
    Tooltip,
    IconButton,
    Slider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {useSearchHistory } from '../hooks/useSearchHistory';
import 'leaflet/dist/leaflet.css';
import IndiaMap from '../components/IndiaMap';
import { useSearchParams , useLocation ,useNavigate, useLoaderData } from 'react-router-dom';
import { id } from 'date-fns/locale';
// import MapLegend from '../components/MapLegend';

const INITIAL_FILTERS = {
    query: '',
    startDate: new Date('2017-01-01'),
    endDate: new Date('2017-12-30'),
    value: 1,
    CityName: 'All',
    stateName: 'All',
    complaintType: 'All',
    complaintMode: 'All',
    companyName: 'All',
    complaintStatus: 'All',
    threshold: 1.3,
    complaint_numbers: ['NA']
};

const SemanticSearch = () => {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [searchResults, setSearchResults] = useState(null);
    const [heatmapData, setHeatmapData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {searchHistory} = useSearchHistory();

    const location = useLocation();

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        console.log({filters})

        const requestBody = {
            query: filters.query,
            start_date: filters.startDate.toISOString().split('T')[0],
            end_date: filters.endDate.toISOString().split('T')[0],
            value: filters.value,
            CityName: filters.CityName,
            stateName: filters.stateName,
            complaintType: filters.complaintType,
            complaintMode: filters.complaintMode,
            companyName: filters.companyName,
            complaintStatus: filters.complaintStatus,
            threshold: filters.threshold,
            complaint_numbers: filters.complaint_numbers
        };

        try {
            const [searchResponse, heatmapResponse] = await Promise.all([
                axios.post('https://cdis.iitk.ac.in/consumer_api/search', {
                    ...requestBody,
                    skip: 0,
                    size: 100
                }),
                axios.post('https://cdis.iitk.ac.in/consumer_api/get_spatial_analysis_data',
                    requestBody
                )
            ]);

            console.log("Search Response:", heatmapResponse.data);

            setSearchResults(searchResponse.data);

            // // Process spatial data to match expected format
            // const processedSpatialData = {};
            // if (Array.isArray(heatmapResponse.data)) {
            //     heatmapResponse.data.forEach(item => {
            //         if (item && item.state && typeof item.count === 'number') {
            //             processedSpatialData[item.state] = item.count;
            //         }
            //     });
            // }
            // console.log("Processed Spatial Data:", processedSpatialData);
            setHeatmapData(heatmapResponse.data);

        } catch (err) {
            setError('Failed to fetch data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
    if (searchHistory?.length > 0) {
        const lastQuery = searchHistory[searchHistory.length - 1];
        const queryParams = lastQuery?.params;

        if (queryParams) {
        setFilters((prev) => ({
            ...prev,
            query: queryParams?.query,
            startDate: new Date(queryParams?.start_date),
            endDate: new Date(queryParams?.end_date),
            threshold: queryParams?.threshold,
            value : queryParams?.value
        }));
        }
    }
    }, [searchHistory]);

    useEffect(() => {
    if (filters.query) {
        fetchData();
    }
    }, [filters.query]);



    return (
        <Fade in timeout={500}>
            <Box sx={{ p: 3 }}>
                {/* <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                    Semantic Search
                </Typography> */}

                {/* Filters */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        mb: 3,
                        background: 'linear-gradient(to right, #ffffff, #f8f9fa)',
                        borderRadius: 2
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Search Query"
                                value={filters.query}
                                onChange={(e) => handleFilterChange('query', e.target.value)}
                                variant="outlined"
                                placeholder="Enter keywords to search..."
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={fetchData}
                                            disabled={loading}
                                            size="small"
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Start Date"
                                    value={filters.startDate}
                                    onChange={(value) => handleFilterChange('startDate', value)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="End Date"
                                    value={filters.endDate}
                                    onChange={(value) => handleFilterChange('endDate', value)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Search Type</InputLabel>
                                <Select
                                    value={filters.value}
                                    label="Search Type"
                                    onChange={(e) => handleFilterChange('value', e.target.value)}
                                >
                                    <MenuItem value={1}>Semantic Search</MenuItem>
                                    <MenuItem value={2}>Keyword Search</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3} ml={4} mr={4}>
                            <Typography gutterBottom>Relevance</Typography>
                            <Slider
                                value={filters.threshold}
                                onChange={(_, value) => handleFilterChange('threshold', value)}
                                valueLabelDisplay="auto"
                                step={0.1}
                                marks={[
                                    {
                                        value: 1,
                                        label: 'Low',
                                    },
                                    {
                                        value: 2,
                                        label: 'High',
                                    },
                                ]}
                                min={1}
                                max={2}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1, mr: 10 }}>
                                <Button
                                    variant="contained"
                                    onClick={fetchData}
                                    disabled={loading}
                                    startIcon={<SearchIcon />}
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </Button>
                                {/* <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setFilters(INITIAL_FILTERS);
                                        fetchData();
                                    }}
                                    startIcon={<RefreshIcon />}
                                >
                                    Reset
                                </Button> */}
                            </Box>
                        </Grid>
                        <Grid>
                            {/* Results Stats */}
                            {searchResults && (
                                <Typography variant="h6" mr={2} sx={{ mt: 1 }}>
                                    {searchResults.total_count.toLocaleString()} complaints
                                </Typography>

                            )}
                        </Grid>
                    </Grid>
                </Paper>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            borderRadius: 2
                        }}
                    >
                        {error}
                    </Alert>
                )}

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        // gap: 2,
                        width: '100%'
                    }}
                >

                    {console.log("heatmapData:", heatmapData)}
                    {/* Map Section */}
                    {heatmapData && (
                        <Paper
                            elevation={3}
                            sx={{
                                width: '45%',
                                // p: 2,
                                mb: 3,
                                height: '700px',
                                borderRadius: 2,
                                overflow: 'scroll',
                                position: 'relative'
                            }}
                        >
                            {/* <Typography variant="h6" gutterBottom>
                                Spatial Distribution of Complaints
                            </Typography> */}
                            <IndiaMap data={heatmapData} />
                            {/* <MapLegend /> */}
                        </Paper>
                    )}

                    {/* Results Table with improved styling */}
                    {searchResults && (
                        <TableContainer
                            component={Paper}
                            elevation={3}
                            sx={{
                                borderRadius: 2,
                                overflow: 'auto',
                                maxHeight: '700px',
                                maxWidth: '100%',
                                minHeight: '700px',
                                width: '54%',
                                '& .MuiTableHead-root': {
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 1,
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell>ID</TableCell>
                                        {/* <TableCell>Details</TableCell> */}
                                        <TableCell>Name</TableCell>
                                        <TableCell>City</TableCell>
                                        <TableCell>State</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {searchResults.grievanceData.map((row) => (

                                        <Tooltip
                                            key={row.complaintNumber}
                                            title={
                                                <Typography sx={{
                                                    p: 3,
                                                    fontSize: '1.1rem',
                                                    maxWidth: 800,
                                                    minWidth: 600,
                                                    whiteSpace: 'pre-wrap',
                                                    lineHeight: 1.5
                                                }}>
                                                    {row.complaintDetails || 'No details available'}
                                                </Typography>
                                            }
                                            placement="top"
                                            arrow
                                            componentsProps={{
                                                tooltip: {
                                                    sx: {
                                                        bgcolor: 'rgba(16, 107, 182, 0.97)',
                                                        '& .MuiTooltip-arrow': {
                                                            color: 'rgba(226, 232, 238, 0.97)'
                                                        },
                                                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                                                        maxWidth: 'none'
                                                    }
                                                }
                                            }}
                                        >

                                            <TableRow
                                                key={row.id}
                                                hover
                                                sx={{
                                                    '&:nth-of-type(odd)': {
                                                        backgroundColor: '#fafafa',
                                                        color: '#fafafa'
                                                    },
                                                    cursor: 'pointer' // Add pointer cursor to indicate hoverable
                                                }}
                                            >
                                                <TableCell>{row.id}</TableCell>
                                                {/* <TableCell>{row.complaintDetails}</TableCell> */}
                                                <TableCell>{row.fullName}</TableCell>
                                                <TableCell>{row.CityName}</TableCell>
                                                <TableCell>{row.stateName}</TableCell>
                                                <TableCell>{row.complaintType}</TableCell>
                                                <TableCell>{row.complaintStatus || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {new Date(row.complaintRegDate).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        </Tooltip>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
                {loading && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: 3,
                            p: 3
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
            </Box>
        </Fade>
    );
};

export default SemanticSearch;