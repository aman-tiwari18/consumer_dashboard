// Updated App.js - Main Router Component
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Layout
import Layout from './components/Layout';

// Pages
import CategoryExplorer from './pages/CategoryExplorer';
import CategoryAlert from './pages/CategoryAlert';
import SemanticSearch from './pages/SemanticSearch';
import Dashboard from './pages/Dashboard';
import AlertPage from './pages/AlertPage';
import Companies from './pages/Companies';
import Login from './pages/Login';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                },
            },
        },
    },
});

function AppContent() {
    const location = useLocation();

    // Check if current route is login page (no layout needed)
    const isLoginPage = location.pathname === '/';

    if (isLoginPage) {
        return <Login />;
    }

    return (
        <Layout>
            <Routes>
                {/* Main Pages */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/category-explorer" element={<CategoryExplorer />} />
                <Route path="/category-alert" element={<CategoryAlert />} />
                <Route path="/semantic-search" element={<SemanticSearch key={location.key} />} />
                <Route path="/alert" element={<AlertPage />} />
                <Route path="/companies" element={<Companies />} />

                {/* Catch all route - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Layout>
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/*" element={<AppContent />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;