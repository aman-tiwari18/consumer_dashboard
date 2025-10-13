import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Paper, Grid,
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
import 'leaflet/dist/leaflet.css';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import IndiaMap from './IndiaMap';


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

const Heatmap = (props) => {
        const [filters, setFilters] = useState(INITIAL_FILTERS);
        const [searchResults, setSearchResults] = useState(null);
        const [heatmapData, setHeatmapData] = useState(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

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
            console.log("Heatmap Data:", heatmapResponse.data);

        } catch (err) {
            setError('Failed to fetch data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFilterChange('query', props.query);
        fetchData();
    }, [props.query]);

return (
    <Fade in timeout={500}>
            <Box sx={{ p: 3 }}>
            

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
                                width: '100%',
                                // p: 2,
                                // mb: 3,
                                // borderRadius: 2,
                                // overflow: 'scroll',
                                // position: 'relative'
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
                </Box>
            </Box>
        </Fade>
)
}

export default Heatmap
