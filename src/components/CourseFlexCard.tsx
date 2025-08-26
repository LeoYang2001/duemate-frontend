import type { Course } from '../store/slices/coursesSlice';

interface CourseFlexCardProps {
  course: Course;
  onClick?: (course: Course) => void;
}

export const CourseFlexCard = ({ course, onClick }: CourseFlexCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(course);
    }
  };

  // Extract semester from course name (e.g., "(Fall 2024)")
  const extractSemester = (courseName: string): string => {
    const match = courseName.match(/\((.*?)\)/);
    return match ? match[1] : '';
  };

  // Generate a color based on course code for consistency
  const getCourseColor = (courseCode: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < courseCode.length; i++) {
      hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const semester = extractSemester(course.name);
  const courseColor = getCourseColor(course.course_code);

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${
        onClick ? 'cursor-pointer hover:border-gray-300' : ''
      }`}
      onClick={handleClick}
    >
      {/* Course Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full ${courseColor} mr-2 flex-shrink-0`}></div>
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {course.course_code}
            </h3>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {course.name.replace(/\(.*?\)/, '').trim()}
          </p>
        </div>
        
        {semester && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 ml-2 flex-shrink-0">
            {semester}
          </span>
        )}
      </div>

      {/* Course Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Course ID</span>
          <span className="font-medium text-gray-900">#{course.id}</span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Assignments
        </button>
      </div>
    </div>
  );
};
