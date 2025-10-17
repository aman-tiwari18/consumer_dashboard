import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import  {useSearchHistory}from '../hooks/useSearchHistory';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableSortLabel,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button
} from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hrs

const AlertTable = (props) => {
  const navigate = useNavigate();

  const {searchHistory} = useSearchHistory();

  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('');

  const [cachedData, setCachedData] = useLocalStorage('categoryAlertData', {
    data: null,
    timestamp: null
  });

  const isCacheValid = () => {
    if (!cachedData.timestamp) return false;
    const now = Date.now();
    return (now - cachedData.timestamp) < CACHE_EXPIRATION;
  };

  // Determine what data type we have (alerts, state-wise, or company-wise)
  const detectDataType = (data) => {
    if (!data || data.length === 0) return null;
    const first = data[0];
    if (first.stateName) return 'state';
    if (first.companyName) return 'company';
    if (first.alertTitle) return 'alert';
    if(first.categoryName) return 'category';
    return 'unknown';
  };

  const getValueKey = (type) => {
    switch (type) {
      case 'state': return 'counts';
      case 'company': return 'counts';
      case 'alert': return 'increasePercentage';
      case 'category': return 'counts';
      default: return '';
    }
  };

  const getLabelKey = (type) => {
    switch (type) {
      case 'state': return 'stateName';
      case 'company': return 'companyName';
      case 'alert': return 'alertTitle';
      case 'category': return 'categoryName';
      default: return '';
    }
  };

  const getColumnTitle = (type) => {
    switch (type) {
      case 'state': return 'Counts';
      case 'company': return 'Counts';
      case 'alert': return 'Increase %';
      case 'category': return 'Counts';
      default: return 'Value';
    }
  };


  // Sorting
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = [...displayData].sort((a, b) => {
    if (!orderBy) return 0;
    if (typeof a[orderBy] === 'string') {
      return order === 'asc'
        ? a[orderBy].localeCompare(b[orderBy])
        : b[orderBy].localeCompare(a[orderBy]);
    } else {
      return order === 'asc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    }
  });

  const getAlertColor = (val) => {
    if (val > 20) return 'error.main';
    if (val > 10) return 'warning.main';
    return 'success.main';
  };


  useEffect(() => {
    if (props.data) {
      setDisplayData(props.data);
      const type = detectDataType(props.data);
      setOrderBy(getValueKey(type));
    }
  }, [props.data]);

  const type = detectDataType(displayData);
  const labelKey = getLabelKey(type);
  const valueKey = getValueKey(type);
  const valueTitle = getColumnTitle(type);

  return (
    <Box sx={{ p: 0 }}>
      <TableContainer
        component={Paper}
        sx={{
          position: 'relative',
          minHeight: '100px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
            }}
          >
            <CircularProgress size={20} />
          </Box>
        )}

        <Table size="small" sx={{ fontSize: '0.8rem' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontSize: '0.8rem', fontWeight: 600 }}
                sortDirection={orderBy === labelKey ? order : false}
              >
                {props.title}
              </TableCell>

              <TableCell
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textAlign: 'right',        // ✅ align header text to right
                  paddingRight: 2,
                }}
                sortDirection={orderBy === valueKey ? order : false}
              >
                <TableSortLabel
                  active={orderBy === valueKey}
                  direction={orderBy === valueKey ? order : 'asc'}
                  onClick={() => handleSort(valueKey)}
                >
                  {valueTitle}
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.slice(0, 5).map((row, idx) => (
              <TableRow
                key={idx}
                sx={{
                  '&:hover': { backgroundColor: '#f9f9f9' },
                }}
              >
                <TableCell
                  sx={{
                    fontSize: '0.8rem',
                    py: 2,
                    maxWidth: 160,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {row[labelKey]}
                </TableCell>

                <TableCell
                  sx={{
                    fontSize: '0.8rem',
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',     
                    justifyContent: 'flex-end', 
                    gap: 1,
                    color: type === 'alert' ? getAlertColor(row[valueKey]) : 'text.primary',
                  }}
                >
                  {type === 'alert' && <TrendingUpIcon sx={{ fontSize: 14, flexShrink: 0 }} />}
                  <span>{row[valueKey]}{type === 'alert' && '%'}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>


        {sortedData.length > 5 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              pr: 2,
              pb: 1,
            }}
          >
          <Button
            variant="text"
            size="small"
            sx={{ fontSize: '0.8rem', textTransform: 'none', paddingRight: 0 }}
            onClick={() => {
              if (props.title === 'High Alerts') {
                navigate('/alert');
              } else if (props.title === 'Categories') {
                navigate('/category-explorer');
              } else if (props.title === 'States') {
                navigate("/semantic-search")
              }
              else if(props.title==='Companies'){
                    navigate("/companies")
              }
               else {
                console.warn('Unhandled table title:', props.title);
              }
            }}
          >
            See more...
          </Button>

          </Box>
        )}
      </TableContainer>
    </Box>
  );
};

export default AlertTable;
