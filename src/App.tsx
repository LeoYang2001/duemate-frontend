import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Onboarding, Dashboard, DueTable } from './pages';
import { MainLayout, ProtectedRoute, PublicRoute, SetupHandler, GlobalLoading } from './components';
import { useAppSelector } from './store/hooks';

function App() {
  const { isGlobalLoading, loadingMessage } = useAppSelector((state: any) => state.ui);

  return (
    <Router>
      <SetupHandler>
        {isGlobalLoading && <GlobalLoading message={loadingMessage} />}
        <Routes>
          {/* Public route - Onboarding/Login */}
          <Route path="/" element={
            <PublicRoute>
              <Onboarding />
            </PublicRoute>
          } />
          
          {/* Protected routes - Main application */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard route */}
            <Route path="main" element={<Dashboard />} />
            
            {/* Due Table route */}
            <Route path="due" element={<DueTable />} />
            
            {/* Redirect any other authenticated routes to dashboard */}
            <Route path="*" element={<Navigate to="/main" replace />} />
          </Route>
        </Routes>
      </SetupHandler>
    </Router>
  );
}

export default App
