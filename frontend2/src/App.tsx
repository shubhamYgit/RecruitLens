import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumesPage from './pages/ResumesPage';
import JobsPage from './pages/JobsPage';
import ScreeningsPage from './pages/ScreeningsPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Protected routes */}
                        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/resumes" element={<ResumesPage />} />
                            <Route path="/jobs" element={<JobsPage />} />
                            <Route path="/screenings" element={<ScreeningsPage />} />
                        </Route>

                        {/* Redirect root to dashboard */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        background: '#1e293b',
                        color: '#e2e8f0',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                    },
                }}
            />
        </QueryClientProvider>
    );
}
