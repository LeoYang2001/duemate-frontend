/**
 * Generate semester terms based on current year
 * Returns an array of semester terms including current year and 3 previous years
 * Format: ["2025 Fall", "2025 Summer", "2025 Spring", "2024 Fall", ...]
 */
export const generateSemesterTerms = (): string[] => {
  const currentYear = new Date().getFullYear();
  const terms: string[] = [];
  
  // Generate terms for current year and 3 previous years
  for (let year = currentYear; year >= currentYear - 3; year--) {
    terms.push(`${year} Fall`);
    terms.push(`${year} Summer`);
    terms.push(`${year} Spring`);
  }
  
  return terms;
};

/**
 * Get the current semester based on the current date
 * Returns format: "2025 Fall"
 */
export const getCurrentSemester = (): string => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
  
  // Determine semester based on month
  // Spring: January - May (1-5)
  // Summer: June - July (6-7)  
  // Fall: August - December (8-12)
  let semester: string;
  if (currentMonth >= 1 && currentMonth <= 5) {
    semester = 'Spring';
  } else if (currentMonth >= 6 && currentMonth <= 7) {
    semester = 'Summer';
  } else {
    semester = 'Fall';
  }
  
  return `${currentYear} ${semester}`;
};

/**
 * Parse semester string to get year and term
 * Example: "2025 Fall" -> { year: 2025, term: "Fall" }
 */
export const parseSemester = (semester: string): { year: number; term: string } => {
  const [yearStr, term] = semester.split(' ');
  return {
    year: parseInt(yearStr, 10),
    term: term
  };
};
