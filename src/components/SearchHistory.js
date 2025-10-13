import React from 'react';
import {
    Box,
    Stack,
    Chip,
    Typography,
    Tooltip,
    IconButton,
    Paper
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import HistoryIcon from '@mui/icons-material/History';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const SearchHistory = ({
    searchHistory,
    onHistoryClick,
    onClearHistory,
    onDeleteHistoryItem
}) => {
    if (searchHistory.length === 0) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                mt: 0,
                mb: 1,
                p: 1,
                backgroundColor: 'rgba(245, 247, 250, 0.85)',
                borderRadius: 2
            }}
        >
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    flexWrap: 'wrap',
                    gap: 1.5,
                    alignItems: 'center'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* <HistoryIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography 
                        variant="subtitle2" 
                        sx={{ 
                            color: 'text.secondary',
                            fontWeight: 500
                        }}
                    >
                        Search Path:
                    </Typography> */}
                    <Tooltip title="Clear History">
                        <IconButton
                            onClick={onClearHistory}
                            color="error"
                            size="small"
                            sx={{
                                ml: 1,
                                '&:hover': {
                                    backgroundColor: 'error.lighter'
                                }
                            }}
                        >
                            <DeleteSweepIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {searchHistory.map((item, index) => (
                    <Stack
                        key={item.id}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        <Chip
                            label={`${item.params.value === 2 ? '"' : ''}${item.params.query.substring(0, 50)}${item.params.query.length > 50 ? '...' : ''}${item.params.value === 2 ? '"' : ''}`}
                            onClick={() => onHistoryClick(item)}
                            sx={{
                                maxWidth: 300,
                                height: 32,
                                backgroundColor: index === searchHistory.length - 1
                                    ? 'primary.light'
                                    : 'background.paper',
                                color: index === searchHistory.length - 1
                                    ? 'primary.contrastText'
                                    : 'text.primary',
                                '&:hover': {
                                    backgroundColor: index === searchHistory.length - 1
                                        ? 'primary.main'
                                        : 'action.hover'
                                },
                                '& .MuiChip-label': {
                                    whiteSpace: 'nowrap',
                                    fontWeight: 500,
                                    fontSize: '0.875rem'
                                }
                            }}
                        />
                        {index < searchHistory.length - 1 && (
                            <ArrowForwardIosIcon
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: 14,
                                    mx: 0.5
                                }}
                            />
                        )}
                    </Stack>
                ))}
            </Stack>
        </Paper>
    );
};

export default SearchHistory;