// TreemapChart.js
import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import ReactApexChart from 'react-apexcharts';

const TreemapChart = ({
    categories,
    totalCounts,
    onDataPointClick,
    isLoading
}) => {

    console.log('Rendering TreemapChart with categories:', categories);
    const chartOptions = {
        chart: {
            height: 350,
            type: 'treemap',
            events: { dataPointSelection: onDataPointClick }
        },
        series: [{
            data: categories ? Object.entries(categories).map(([key, value]) => ({
                x: key.replace(/_/g, ' '),
                y: value.prompt.length
            })) : []
        }],
        plotOptions: {
            treemap: {
                dataLabels: {
                    style: {
                        fontSize: '24px', // Increased font size
                        fontWeight: 600,  // Make text bolder
                        colors: ['#fff']  // White text for better contrast
                    }
                }
            }
        },
        title: {
            text: categories && Object.keys(categories).length > 0
                ? `Consumer Grievance Categories${totalCounts ? ` (Total Complaints: ${totalCounts})` : ''}`
                : 'No Categories Found',
            align: 'center'
        },
        tooltip: {
            y: {
                formatter: () => ''
            }
        }
    };

    return (
        <Box sx={{ position: 'relative', minHeight: '400px' }}>
            {isLoading && (
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
                options={chartOptions}
                series={chartOptions.series}
                type="treemap"
                height={400}
            />
        </Box>
    );
};

export default TreemapChart;