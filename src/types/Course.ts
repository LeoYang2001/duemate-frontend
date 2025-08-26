export type Course = {
  account_id: number;
  course_code: string;
  course_format: string;
  enrollment_term_id: number;
  id: number;
  name: string;
  color?: string;
  assignments: any[];
};
