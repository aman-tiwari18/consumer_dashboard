// UserDataTable.js
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tooltip,
    Typography
} from '@mui/material';

const UserDataTable = ({ userData }) => {
    if (userData.length === 0) return null;

    return (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Complaint Number</TableCell>
                        <TableCell>Full Name</TableCell>
                        <TableCell>City</TableCell>
                        <TableCell>State</TableCell>
                        <TableCell>Complaint Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Registration Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {userData.map((row) => (
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
                                            color: 'rgba(16, 107, 182, 0.97)'
                                        },
                                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                                        maxWidth: 'none'
                                    }
                                }
                            }}
                        >
                            <TableRow
                                hover
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: '#f5f5f5' }
                                }}
                            >
                                <TableCell>{row.complaintNumber}</TableCell>
                                <TableCell>{row.fullName}</TableCell>
                                <TableCell>{row.CityName}</TableCell>
                                <TableCell>{row.stateName}</TableCell>
                                <TableCell>{row.complaintType}</TableCell>
                                <TableCell>{row.complaintStatus}</TableCell>
                                <TableCell>
                                    {new Date(row.complaintRegDate).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        </Tooltip>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UserDataTable;