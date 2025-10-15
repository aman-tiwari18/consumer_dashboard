// Updated App.js - Main Router Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate , useLocation} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Layout
import Layout from './components/Layout';

// Pages
// import Dashboard from './pages/Dashboard';
import CategoryExplorer from './pages/CategoryExplorer';
import CategoryAlert from './pages/CategoryAlert';
import SemanticSearch from './pages/SemanticSearch'
// import PlaceholderPage from './pages/PlaceholderPage';

// Global CSS
import './App.css';
import Dashboard from './pages/Dashboard';
import AlertPage from './pages/AlertPage';

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

function App() {
         const location = useLocation();
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Layout>
                <Routes>
                    {/* Redirect root to dashboard */}
                    {/* <Route path="/" element={<Navigate to="/category-alert" replace />} /> */}

                    {/* Main Pages */}
                    <Route path="/" element={<CategoryExplorer />} />
                    <Route path="/category-explorer" element={<CategoryExplorer />} />
                    <Route path="/category-alert" element={<CategoryAlert />} />
                    <Route path="/semantic-search"  element={<SemanticSearch key={location.key} /> } />
                    <Route path="/dashboard" element={<Dashboard/>} />
                    <Route path= "/alert" element = {<AlertPage/>}/>

                    {/* Placeholder Pages */}
                    {/* <Route
                            path="/semantic-search"
                            element={
                                <PlaceholderPage
                                    title="Semantic Search"
                                    description="Advanced AI-powered semantic search through complaint data."
                                />
                            }
                        />
                        <Route
                            path="/analytics"
                            element={
                                <PlaceholderPage
                                    title="Analytics"
                                    description="Comprehensive analytics and insights from complaint data patterns."
                                />
                            }
                        />
                        <Route
                            path="/trends"
                            element={
                                <PlaceholderPage
                                    title="Trends Analysis"
                                    description="Analyze trends and patterns in consumer complaints over time."
                                />
                            }
                        />
                        <Route
                            path="/reports"
                            element={
                                <PlaceholderPage
                                    title="Reports"
                                    description="Generate and view detailed reports on complaint data."
                                />
                            }
                        />
                        <Route
                            path="/history"
                            element={
                                <PlaceholderPage
                                    title="Search History"
                                    description="View and manage your search history and saved queries."
                                />
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <PlaceholderPage
                                    title="Settings"
                                    description="Configure application settings and preferences."
                                />
                            }
                        />
                        <Route
                            path="/help"
                            element={
                                <PlaceholderPage
                                    title="Help & Support"
                                    description="Get help and support for using the Consumer Complaint Analysis Portal."
                                />
                            }
                        /> */}

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Layout>

        </ThemeProvider>
    );
}

export default App;