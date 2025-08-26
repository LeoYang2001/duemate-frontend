import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCombinedAssignmentsList, selectCurrentCourseList } from '../store/selectors';
import { updateAssignmentFinishedStatus } from '../store/slices/assignmentsSlice';
import { updateAssignmentFinished } from '../api/assignmentService';
import { LoadingSkeleton } from '../components/LoadingComponents';
import type { CombinedAssignment } from '../store/slices/assignmentsSlice';
import { useState, useMemo, useEffect } from 'react';

function DueTable() {
  const dispatch = useAppDispatch();
  const { isLoading: coursesLoading } = useAppSelector((state: any) => state.courses);
  const { isGlobalLoading } = useAppSelector((state: any) => state.ui);
  const { isLoading: assignmentsLoading, isLoadingDetails } = useAppSelector((state: any) => state.assignments);
  
  // Get selectedSemester from Redux global state instead of localStorage
  const selectedSemester = useAppSelector((state: any) => state.ui.selectedSemester);
  
  // Get user email from auth state
  const userEmail = useAppSelector((state: any) => state.auth.user?.email || '');
  
  // Get combined assignments and course list
  const combinedAssignmentsList = useAppSelector(selectCombinedAssignmentsList);
  const currentCourseList = useAppSelector(selectCurrentCourseList);

  // Sorting state
  const [sortBy, setSortBy] = useState<'name' | 'dueDate' | 'points' | 'course' | 'grade'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [dueDateFilter, setDueDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    let filtered = [...combinedAssignmentsList];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(assignment => {
        try {
          return assignment.name.toLowerCase().includes(query) ||
            getCourseCode(assignment.course_id).toLowerCase().includes(query);
        } catch (error) {
          console.error('Error in search filter:', error);
          return assignment.name.toLowerCase().includes(query);
        }
      });
    }

    // Apply course filter
    if (selectedCourse) {
      console.log('Filtering by course:', selectedCourse);
      console.log('Available assignments:', filtered.map(a => ({ id: a.id, course_id: a.course_id, name: a.name })));
      filtered = filtered.filter(assignment => {
        console.log(`Comparing assignment.course_id (${assignment.course_id}) === selectedCourse (${selectedCourse})`);
        return String(assignment.course_id) === String(selectedCourse);
      });
      console.log('Filtered assignments:', filtered.length);
    }

    // Apply due date filter
    if (dueDateFilter) {
      const now = new Date();
      filtered = filtered.filter(assignment => {
        if (!assignment.due_at && dueDateFilter !== 'no-date') return false;
        
        switch (dueDateFilter) {
          case 'overdue':
            return assignment.missing === true;
          case 'today': {
            if (!assignment.due_at) return false;
            const dueDate = new Date(assignment.due_at);
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const assignmentDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            return assignmentDate.getTime() === today.getTime();
          }
          case 'week': {
            if (!assignment.due_at) return false;
            const dueDate = new Date(assignment.due_at);
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return dueDate >= now && dueDate <= weekFromNow;
          }
          case 'month': {
            if (!assignment.due_at) return false;
            const dueDate = new Date(assignment.due_at);
            const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            return dueDate >= now && dueDate <= monthFromNow;
          }
          case 'no-date':
            return !assignment.due_at;
          default:
            return true;
        }
      });
    }

    // Sort the filtered results
    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'dueDate':
          // Handle due date sorting: earliest first, then no due date assignments at the end
          if (!a.due_at && !b.due_at) return 0; // Both have no due date
          if (!a.due_at) return 1; // a has no due date, put it after b
          if (!b.due_at) return -1; // b has no due date, put it after a
          aValue = new Date(a.due_at).getTime();
          bValue = new Date(b.due_at).getTime();
          break;
        case 'points':
          aValue = a.points_possible || 0;
          bValue = b.points_possible || 0;
          break;
        case 'course':
          aValue = getCourseCode(a.course_id).toLowerCase();
          bValue = getCourseCode(b.course_id).toLowerCase();
          break;
        case 'grade':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [combinedAssignmentsList, searchQuery, selectedCourse, dueDateFilter, sortBy, sortOrder, currentCourseList]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageAssignments = filteredAndSortedAssignments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const resetPage = () => setCurrentPage(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse, dueDateFilter]);

  // Function to toggle assignment finished status
  const toggleAssignmentFinished = async (assignment: CombinedAssignment) => {
    const newFinishedStatus = !assignment.ifFinished;
    
    console.log(`Toggling assignment ${assignment.id} from ${assignment.ifFinished} to ${newFinishedStatus}`);
    
    try {
      // First, update locally for immediate UI feedback
      dispatch(updateAssignmentFinishedStatus({
        assignmentId: assignment.id,
        isFinished: newFinishedStatus
      }));

      // Then, update the database
      await updateAssignmentFinished({
        assignmentId: String(assignment.assignment_id),
        term: selectedSemester,
        email: userEmail,
        ifFinished: newFinishedStatus
      });

      console.log(`Assignment ${assignment.id} marked as ${newFinishedStatus ? 'finished' : 'unfinished'}`);
    } catch (error) {
      // If API call fails, revert the local change
      console.log(`API call failed, reverting assignment ${assignment.id} to ${assignment.ifFinished}`);
      dispatch(updateAssignmentFinishedStatus({
        assignmentId: assignment.id,
        isFinished: assignment.ifFinished || false
      }));
      console.error('Failed to update assignment status:', error);
      // You could add a toast notification here to inform the user
    }
  };

  const handleSort = (column: 'name' | 'dueDate' | 'points' | 'course' | 'grade') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Helper function to get course code by course_id
  const getCourseCode = (courseId: string): string => {
    const course = currentCourseList.find(c => c.id === courseId);
    return course?.course_code || `Course ${courseId}`;
  };

  // Helper function to format due date
  const formatDueDate = (dueAt: string | null): string => {
    if (!dueAt) return 'No due date';
    const date = new Date(dueAt);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Helper function to get due date status styling
  const getDueDateStyle = (dueAt: string | null, missing: boolean): string => {
    if (missing) return 'text-red-600 font-medium';
    if (!dueAt) return 'text-gray-500';
    
    const now = new Date();
    const dueDate = new Date(dueAt);
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'text-red-600'; // Past due
    if (daysDiff <= 1) return 'text-orange-600'; // Due today or tomorrow
    if (daysDiff <= 7) return 'text-yellow-600'; // Due this week
    return 'text-gray-700'; // Future
  };

  // Helper function to format grade display
  const formatGrade = (assignment: CombinedAssignment): string => {
    if (assignment.grade && assignment.grade !== 'null') {
      return assignment.grade;
    }
    if (assignment.score !== null && assignment.score !== undefined) {
      return `${assignment.score}/${assignment.points_possible || 'N/A'}`;
    }
    if (assignment.workflow_state === 'graded') {
      return 'Graded';
    }
    if (assignment.workflow_state === 'submitted') {
      return 'Submitted';
    }
    return 'Not Submitted';
  };

  // Helper function to get course border color based on course name
  const getCourseBorderColor = (courseId: string): string => {
    // Generate consistent color based on course name hash
    const colors = [
      'border-l-blue-500',
      'border-l-green-500', 
      'border-l-purple-500',
      'border-l-red-500',
      'border-l-yellow-500',
      'border-l-indigo-500',
      'border-l-pink-500',
      'border-l-teal-500',
      'border-l-orange-500',
      'border-l-cyan-500'
    ];
    
    // Get course name for better hash distribution
    const courseName = getCourseCode(courseId);
    
    // Better hash function using DJB2 algorithm for better distribution
    let hash = 5381;
    for (let i = 0; i < courseName.length; i++) {
      hash = (hash * 33) ^ courseName.charCodeAt(i);
    }
    
    // Ensure positive number and get index
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Check if we're still loading
  const isLoadingAssignments = assignmentsLoading || isLoadingDetails;

  // Show skeleton while courses are loading for new users
  if (coursesLoading || isGlobalLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton type="table" count={8} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Due Table
        </h2>
        <p className="text-gray-600 text-base sm:text-lg mb-3">
          View and manage all your upcoming assignments
        </p>
        {selectedSemester && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {selectedSemester}
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Assignments
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by assignment..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Course
            </label>
            <select 
              value={selectedCourse}
              onChange={(e) => {
                console.log('Selected course value:', e.target.value, 'type:', typeof e.target.value);
                setSelectedCourse(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Courses</option>
              {currentCourseList.map(course => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Due Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date Filter
            </label>
            <select 
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
              <option value="month">Due This Month</option>
              <option value="no-date">No Due Date</option>
            </select>
          </div>
        </div>
        
        {/* Clear Filters Button */}
        {(searchQuery || selectedCourse || dueDateFilter) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCourse('');
                setDueDateFilter('');
                resetPage();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Assignments</h3>
              <p className="text-sm text-gray-500 mt-1">Click on any row to mark assignment as completed/incomplete</p>
            </div>
            <div className="text-sm text-gray-500">
              {isLoadingAssignments ? (
                <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
              ) : (
                <>
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedAssignments.length)} of {filteredAndSortedAssignments.length} assignment{filteredAndSortedAssignments.length !== 1 ? 's' : ''}
                  {(searchQuery || selectedCourse || dueDateFilter) && (
                    <span className="text-xs text-gray-400 ml-1">(filtered from {combinedAssignmentsList.length})</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Table Header - Hidden on mobile, shows on tablet+ */}
        <div className="hidden md:grid md:grid-cols-5 gap-4 px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
          <button 
            onClick={() => handleSort('name')}
            className="text-left hover:text-gray-700 flex items-center"
          >
            Name (Click to Complete)
            {sortBy === 'name' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button 
            onClick={() => handleSort('course')}
            className="text-left hover:text-gray-700 flex items-center"
          >
            Course
            {sortBy === 'course' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button 
            onClick={() => handleSort('dueDate')}
            className="text-left hover:text-gray-700 flex items-center"
          >
            Due Date
            {sortBy === 'dueDate' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button 
            onClick={() => handleSort('grade')}
            className="text-left hover:text-gray-700 flex items-center"
          >
            Grade
            {sortBy === 'grade' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button 
            onClick={() => handleSort('points')}
            className="text-left hover:text-gray-700 flex items-center"
          >
            Total Points
            {sortBy === 'points' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
        </div>
        
        {/* Table Content */}
        {isLoadingAssignments ? (
          <div className="p-6">
            <LoadingSkeleton type="table" count={5} />
          </div>
        ) : currentPageAssignments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentPageAssignments.map((assignment: CombinedAssignment, index: number) => (
              <div 
                key={`${assignment.id}-${index}`} 
                onClick={() => toggleAssignmentFinished(assignment)}
                className={`grid grid-cols-1 md:grid-cols-5 gap-4 px-4 sm:px-6 py-4 transition-colors border-l-4 cursor-pointer ${getCourseBorderColor(assignment.course_id)} ${
                  assignment.ifFinished 
                    ? 'bg-green-50 hover:bg-green-100 opacity-75' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Name - Full width on mobile */}
                <div className="md:col-span-1">
                  <div className="md:hidden text-xs font-medium text-gray-500 mb-1">Assignment Name</div>
                  <div className="flex items-center space-x-2">
                    {/* Completion Status Icon */}
                    <div className="flex-shrink-0">
                      {assignment.ifFinished ? (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                    <div className={`font-medium truncate flex-1 min-w-0 ${assignment.ifFinished ? 'text-gray-500 line-through' : 'text-gray-900'}`} title={assignment.name}>
                      {assignment.name}
                    </div>
                    {assignment.missing && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 flex-shrink-0">
                        Missing
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Course */}
                <div className="md:col-span-1">
                  <div className="md:hidden text-xs font-medium text-gray-500 mb-1">Course</div>
                  <div className="text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getCourseCode(assignment.course_id)}
                    </span>
                  </div>
                </div>
                
                {/* Due Date */}
                <div className="md:col-span-1">
                  <div className="md:hidden text-xs font-medium text-gray-500 mb-1">Due Date</div>
                  <div className={getDueDateStyle(assignment.due_at, assignment.missing)}>
                    {formatDueDate(assignment.due_at)}
                  </div>
                </div>
                
                {/* Grade */}
                <div className="md:col-span-1">
                  <div className="md:hidden text-xs font-medium text-gray-500 mb-1">Grade</div>
                  <div className="text-gray-900 font-medium">
                    {formatGrade(assignment)}
                  </div>
                </div>
                
                {/* Total Points */}
                <div className="md:col-span-1">
                  <div className="md:hidden text-xs font-medium text-gray-500 mb-1">Total Points</div>
                  <div className="text-gray-900 font-medium">
                    {assignment.points_possible || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 px-4">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h4>
            <p className="text-gray-500 text-sm mb-4">
              {selectedSemester 
                ? `No assignments found for ${selectedSemester}. Try selecting a different semester.`
                : 'Connect your Canvas account to sync your assignments and see them here.'
              }
            </p>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!isLoadingAssignments && filteredAndSortedAssignments.length > itemsPerPage && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DueTable;
