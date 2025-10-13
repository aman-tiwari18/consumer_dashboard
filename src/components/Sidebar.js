// components/Sidebar.js
import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Divider,
    Tooltip,
    Typography,
    Avatar,
    IconButton
} from '@mui/material';

import {
    Dashboard as DashboardIcon,
    Category as CategoryIcon,
    History as HistoryIcon,
    Analytics as AnalyticsIcon,
    Settings as SettingsIcon,
    Help as HelpIcon,
    AccountCircle as AccountIcon,
    Notifications as NotificationsIcon,
    Search as SearchIcon,
    TrendingUp as TrendingUpIcon,
    Assessment as AssessmentIcon,
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const SIDEBAR_WIDTH_EXPANDED = 280;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const navigationItems = [
    // {
    //     id: 'dashboard',
    //     label: 'Dashboard',
    //     icon: <DashboardIcon />,
    //     path: '/dashboard',
    //     group: 'main'
    // },
    {
        id: 'category-explorer',
        label: 'Category Explorer',
        icon: <DashboardIcon />,
        path: '/category-explorer',
        group: 'main'
    },
    {
        id: 'category-alert',
        label: 'Category Alerts',
        icon: <NotificationsIcon />,
        path: '/category-alert',
        group: 'main'
    },
    {
        id: 'semantic-search',
        label: 'Semantic Search',
        icon: <SearchIcon />,
        path: '/semantic-search',
        group: 'main'
    }
];

const Sidebar = ({ open, onToggle }) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isExpanded = open || isHovered;

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    const renderNavigationItem = (item) => {
        if (item.type === 'divider') {
            return <Divider key={item.id} sx={{ my: 1 }} />;
        }

        const isActive = isActiveRoute(item.path);

        return (
            <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                <Tooltip
                    title={!isExpanded ? item.label : ''}
                    placement="right"
                    arrow
                >
                    <ListItemButton
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                            minHeight: 48,
                            justifyContent: isExpanded ? 'initial' : 'center',
                            px: 2.5,
                            backgroundColor: isActive ? 'action.selected' : 'transparent',
                            borderRight: isActive ? 3 : 0,
                            borderColor: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                                '& .MuiListItemIcon-root': {
                                    color: 'primary.main',
                                },
                                '& .MuiListItemText-primary': {
                                    fontWeight: 500,
                                }
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: isExpanded ? 3 : 'auto',
                                justifyContent: 'center',
                                color: isActive ? 'primary.main' : 'text.primary',
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            sx={{
                                opacity: isExpanded ? 1 : 0,
                                transition: 'opacity 0.2s ease-in-out',
                                '& .MuiListItemText-primary': {
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? 'primary.main' : 'text.primary'
                                }
                            }}
                        />
                    </ListItemButton>
                </Tooltip>
            </ListItem>
        );
    };

    const renderUserProfile = () => (
        <Box
            sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                minHeight: 80
            }}
        >
            <Avatar
                sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main'
                }}
            >
                <AccountIcon />
            </Avatar>
            {isExpanded && (
                <Box sx={{
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                    overflow: 'hidden'
                }}>
                    <Typography variant="subtitle2" noWrap>
                        John Doe
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                        Administrator
                    </Typography>
                </Box>
            )}
        </Box>
    );

    return (
        <Drawer
            variant="permanent"
            open={isExpanded}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
                width: isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                transition: 'width 0.3s ease-in-out',
                '& .MuiDrawer-paper': {
                    width: isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
                    transition: 'width 0.3s ease-in-out',
                    overflowX: 'hidden',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: '#F8FAFC'
                },
            }}
        >
            {/* Header with toggle button */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'space-between' : 'center',
                    p: 2,
                    minHeight: 64,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                {isExpanded && (
                    <img
                        src="/doca_logo.png"
                        alt="Logo"
                        style={{
                            height: 65,
                            width: 'auto',
                            opacity: isExpanded ? 1 : 0,
                            transition: 'opacity 0.2s ease-in-out'
                        }}
                    />
                )}
                <IconButton
                    onClick={onToggle}
                    // onMouseLeave={handleMouseLeave}
                    sx={{
                        transition: 'transform 0.2s ease-in-out',
                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)'
                    }}
                >
                    {isExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
                </IconButton>
            </Box>

            {/* User Profile */}
            {/* {renderUserProfile()} */}

            {/* Navigation Items */}
            <List sx={{ flexGrow: 1, py: 1 }}>
                {navigationItems.map(renderNavigationItem)}
            </List>

            {/* Footer */}
            {/* <Box
                sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center'
                }}
            >
                {isExpanded && (
                    <Typography variant="caption" color="text.secondary" sx={{
                        opacity: isExpanded ? 1 : 0,
                        transition: 'opacity 0.2s ease-in-out'
                    }}>
                        v2.1.0
                    </Typography>
                )}
            </Box> */}
        </Drawer>
    );
};

export default Sidebar;