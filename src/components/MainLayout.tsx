import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { generateSemesterTerms } from '../utils';
import { logout, getCurrentUser } from '../api/authService';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setLoggedOut } from '../store/slices/authSlice';
import { clearCourses } from '../store/slices/coursesSlice';
import { setSelectedSemester } from '../store/slices/uiSlice';
import { selectCurrentCourseList, selectCurrentAssignments, selectAssignmentsState, selectDetailedAssignments, selectAssignmentLoadingStates, selectCombinedAssignmentsList } from '../store/selectors';
import { useAssignmentFetcher } from '../hooks/useAssignmentFetcher';

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use assignment fetcher hook
  useAssignmentFetcher();
  
  // Get global Redux state
  const authState = useAppSelector(state => state.auth);
  const coursesState = useAppSelector(state => state.courses);
  const uiState = useAppSelector(state => state.ui);
  const assignmentsState = useAppSelector(selectAssignmentsState);
  const currentCourseList = useAppSelector(selectCurrentCourseList);
  const currentAssignments = useAppSelector(selectCurrentAssignments);
  const detailedAssignments = useAppSelector(selectDetailedAssignments);
  const loadingStates = useAppSelector(selectAssignmentLoadingStates);
  const combinedAssignmentsList = useAppSelector(selectCombinedAssignmentsList);
  
  // Get selected semester from Redux instead of local state
  const selectedSemester = uiState.selectedSemester;
  
  const semesterTerms = generateSemesterTerms();
  const currentUser = getCurrentUser();
  
  const handleLogout = () => {
    // Clear Redux state
    dispatch(setLoggedOut());
    dispatch(clearCourses());
    
    // Clear authentication data using auth service (localStorage)
    logout();
    
    // Navigate to login
    navigate('/');
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSemester = e.target.value;
    // Update Redux state (which also updates localStorage)
    dispatch(setSelectedSemester(newSemester));
    console.log('Semester changed to:', newSemester);
    console.log('Current course list will be automatically updated via selector');
  };

  // Test function to log global Redux state
  const handleTestGlobalState = () => {
    console.log('=== GLOBAL REDUX STATE ===');
    console.log('Auth State:', authState);
    console.log('  - isAuthenticated:', authState.isAuthenticated);
    console.log('  - isNewUser:', authState.isNewUser);
    console.log('  - hasCompletedSetup:', authState.hasCompletedSetup);
    console.log('  - schoolUrlKey:', authState.schoolUrlKey);
    console.log('Courses State:', coursesState);
    console.log('  - all courses count:', coursesState.courses?.length || 0);
    console.log('  - current course list count:', currentCourseList.length);
    console.log('  - isLoading:', coursesState.isLoading);
    console.log('  - hasFetched:', coursesState.hasFetched);
    console.log('  - error:', coursesState.error);
    console.log('Assignments State:', assignmentsState);
    console.log('  - all assignments count:', assignmentsState.assignments?.length || 0);
    console.log('  - current assignments count:', currentAssignments.length);
    console.log('  - detailed assignments count:', detailedAssignments.length);
    console.log('  - combined assignments count:', combinedAssignmentsList.length);
    console.log('  - combinedAssignmentsList:', combinedAssignmentsList);
    console.log('  - isLoading assignments:', assignmentsState.isLoading);
    console.log('  - isLoading details:', loadingStates.isLoadingDetails);
    console.log('  - hasFetched:', assignmentsState.hasFetched);
    console.log('  - hasDetailsFetched:', loadingStates.hasDetailsFetched);
    console.log('  - lastFetchedTerm:', assignmentsState.lastFetchedTerm);
    console.log('  - error:', assignmentsState.error);
    console.log('UI State:', uiState);
    console.log('  - selectedSemester:', uiState.selectedSemester);
    console.log('  - isGlobalLoading:', uiState.isGlobalLoading);
    console.log('  - loadingMessage:', uiState.loadingMessage);
    console.log('========================');
    console.log('=== COMPUTED VALUES ===');
    console.log('Current Course List (filtered):', currentCourseList);
    console.log('Current Assignments (filtered):', currentAssignments);
    console.log('Detailed Assignments:', detailedAssignments);
    console.log('All Courses:', coursesState.courses);
    console.log('All Assignments:', assignmentsState.assignments);
    console.log('Selected Semester:', selectedSemester);
    console.log('Loading States:', loadingStates);
    console.log('========================');
    
    // Also log localStorage for comparison
    console.log('=== LOCALSTORAGE ===');
    console.log('isAuthenticated:', localStorage.getItem('isAuthenticated'));
    console.log('userData:', localStorage.getItem('userData'));
    console.log('schoolUrlKey:', localStorage.getItem('schoolUrlKey'));
    console.log('selectedSemester:', localStorage.getItem('selectedSemester'));
    console.log('==================');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Welcome */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                DueMate
              </h1>
              {currentUser?.fullName && (
                <span className="hidden sm:block text-sm text-gray-300">
                  Welcome, {currentUser.fullName}
                </span>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Semester Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-300">
                  Semester:
                </label>
                <select 
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                  className="px-3 py-1.5 border border-gray-600 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {semesterTerms.map(term => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation Links */}
              <nav className="flex items-center space-x-4">
                <Link 
                  to="/main" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/main' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/due" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/due' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Due Table
                </Link>
                
                {/* Test Button for Global State */}
                <button 
                  onClick={handleTestGlobalState}
                  className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Console log global Redux state"
                >
                  🧪 Test
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </nav>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700">
              {/* Welcome message on mobile */}
              {currentUser?.fullName && (
                <div className="px-2 py-2 text-sm text-gray-300 border-b border-gray-700 mb-4">
                  Welcome, {currentUser.fullName}
                </div>
              )}
              
              {/* Semester Dropdown - Mobile */}
              <div className="px-2 py-2 mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Semester:
                </label>
                <select 
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {semesterTerms.map(term => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link 
                  to="/main"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-2 py-2 text-base font-medium rounded-md transition-colors ${
                    location.pathname === '/main' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/due"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-2 py-2 text-base font-medium rounded-md transition-colors ${
                    location.pathname === '/due' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Due Table
                </Link>
                
                {/* Test Button for Global State - Mobile */}
                <button 
                  onClick={() => {
                    handleTestGlobalState();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-2 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700 transition-colors mt-2"
                >
                  🧪 Test Global State
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-2 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 transition-colors mt-4"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
