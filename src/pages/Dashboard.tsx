import { getCurrentUser } from '../api/authService';

import { useAppSelector } from '../store/hooks';
import { selectCurrentCourseList } from '../store/selectors';
import { LoadingSkeleton } from '../components/LoadingComponents';
import { CourseFlexCard } from '../components/CourseFlexCard';
import type { Course } from '../store/slices/coursesSlice';

function Dashboard() {
  const { isLoading: coursesLoading } = useAppSelector((state: any) => state.courses);
  const { isGlobalLoading } = useAppSelector((state: any) => state.ui);
  const currentCourseList = useAppSelector(selectCurrentCourseList);

  // Show skeleton while courses are loading for new users
  if (coursesLoading || isGlobalLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }
  
  const currentUser = getCurrentUser();
  const selectedSemester = localStorage.getItem('selectedSemester') || '';

  const handleCourseClick = (course: Course) => {
    console.log('Course clicked:', course);
    // TODO: Navigate to course detail page or assignments
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h2>
        <p className="text-gray-600 text-base sm:text-lg mb-3">
          Welcome to your assignment dashboard, {currentUser?.fullName || 'Student'}!
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

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">0</div>
          <p className="text-sm text-gray-600">Overdue Assignments</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">0</div>
          <p className="text-sm text-gray-600">Due This Week</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">0</div>
          <p className="text-sm text-gray-600">Completed This Week</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-2">0</div>
          <p className="text-sm text-gray-600">Total Assignments</p>
        </div>
      </div>

      {/* Courses Grid Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Courses
            {selectedSemester && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({selectedSemester})
              </span>
            )}
          </h3>
          <div className="text-sm text-gray-500">
            {currentCourseList.length} course{currentCourseList.length !== 1 ? 's' : ''}
          </div>
        </div>

        {currentCourseList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentCourseList.map((course) => (
              <CourseFlexCard
                key={course.id}
                course={course}
                onClick={handleCourseClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500 text-sm mb-2">
              {selectedSemester 
                ? `No courses found for ${selectedSemester}`
                : 'No courses available'
              }
            </p>
            <p className="text-gray-400 text-xs">
              {selectedSemester 
                ? 'Try selecting a different semester or sync your courses'
                : 'Connect your Canvas account to see your courses'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
