import type { Course } from '../store/slices/coursesSlice';

/**
 * Utility function to filter courses by semester term
 * @param allCourses - Array of all courses
 * @param term - Semester term to filter by (e.g., "2024 Fall", "2025 Spring")
 * @returns Filtered array of courses matching the semester term
 */
export const filterCoursesBySemester = (allCourses: Course[], term: string): Course[] => {
  if (!term || !allCourses.length) {
    return allCourses;
  }

  // Convert "2024 Fall" to "(Fall 2024)" format to match course names
  const reversedTerm = convertToCanvasFormat(term);

  return allCourses.filter(course => {
    // Check if course name includes the reversed term format
    if (course.name && course.name.includes(reversedTerm)) {
      return true;
    }
    
    // Also check course code if available
    if (course.course_code && course.course_code.includes(reversedTerm)) {
      return true;
    }
    
    return false;
  });
};

/**
 * Convert semester format from "2024 Fall" to "(Fall 2024)" for Canvas course matching
 * @param term - Semester term in format "YYYY Semester"
 * @returns Converted term in format "(Semester YYYY)"
 */
export const convertToCanvasFormat = (term: string): string => {
  if (!term) return '';
  
  const [year, semester] = term.split(' ');
  return `(${semester} ${year})`;
};

/**
 * Extract semester from course name or code
 * This helps identify which semester a course belongs to
 * @param course - Course object
 * @returns Semester string or null if not found
 */
export const extractSemesterFromCourse = (course: Course): string | null => {
  const text = `${course.name || ''} ${course.course_code || ''}`.toLowerCase();
  
  // Common semester patterns
  const semesterPatterns = [
    /fall\s*202[0-9]/i,
    /spring\s*202[0-9]/i,
    /summer\s*202[0-9]/i,
    /winter\s*202[0-9]/i,
  ];
  
  for (const pattern of semesterPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/\s+/g, ' ').trim();
    }
  }
  
  return null;
};

/**
 * Get unique semesters from all courses
 * @param allCourses - Array of all courses
 * @returns Array of unique semester strings
 */
export const getUniqueSemestersFromCourses = (allCourses: Course[]): string[] => {
  const semesters = new Set<string>();
  
  allCourses.forEach(course => {
    const semester = extractSemesterFromCourse(course);
    if (semester) {
      semesters.add(semester);
    }
  });
  
  return Array.from(semesters).sort();
};
