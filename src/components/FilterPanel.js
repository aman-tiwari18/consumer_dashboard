// FilterPanel.js
import React from 'react';
import {
    Box,
    Grid,
    TextField,
    Slider,
    Button,
    Typography,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const FilterPanel = ({
    filters,
    onFilterChange,
    onApplyFilters,
    isLoading,
    searchHistory
}) => {
    return (
        <Box sx={{ backgroundColor: 'white', borderRadius: 2, paddingInline : 2, paddingTop: 1 }}>
            <Grid container spacing={6} >
                <Grid item xs={12} md={6} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Query"
                        placeholder="Enter your query ..."
                        value={filters.query.replace(/_/g, ' ') || ''}
                        onChange={(e) => onFilterChange('query', e.target.value)}
                    />
                </Grid>

                <Grid item xs={12} md={6} sx={{ mt: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={filters.startDate}
                            onChange={(value) => onFilterChange('startDate', value)}
                            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                        />
                    </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={6} sx={{ mt: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="End Date"
                            value={filters.endDate}
                            onChange={(value) => onFilterChange('endDate', value)}
                            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                        />
                    </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={6} sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Search Type</InputLabel>
                        <Select
                            value={filters.value}
                            label="Search Type"
                            onChange={(e) => onFilterChange('value', e.target.value)}
                        >
                            <MenuItem value={1}>Semantic Search</MenuItem>
                            <MenuItem value={2}>Keyword Search</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6} sx={{mt:0}}>
                    <Typography gutterBottom>Relevance</Typography>
                    <Slider
                        value={filters.threshold}
                        onChange={(_, value) => onFilterChange('threshold', value)}
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

                <Grid item xs={12} >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onApplyFilters}
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{ mt: 2 }}
                    >
                        {isLoading
                            ? 'Loading...'
                            : searchHistory && searchHistory.length > 0
                                ? 'Apply Filters Within Cluster'
                                : 'Apply Filters'
                        }
                    </Button>

                </Grid>
            </Grid>
        </Box>
    );
};

export default FilterPanel;