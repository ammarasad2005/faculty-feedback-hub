export interface FacultyMember {
  name: string;
  email: string;
  profile: string;
  image: string;
  office?: string;
}

export interface OfficeEntry {
  Name: string;
  Email: string;
  Office: string;
}

export type OfficeData = Record<string, OfficeEntry[]>;

export interface Department {
  code: string;
  name: string;
  school: string;
  url: string;
  head_of_department: FacultyMember;
  faculty: FacultyMember[];
}

export interface School {
  departments: Record<string, Department>;
}

export interface FacultyData {
  metadata: {
    institution: string;
    campus: string;
    website: string;
    scraped_at: string;
    statistics: {
      total_departments: number;
      total_faculty: number;
      profiles_scraped: number;
      duration_seconds: number;
      errors: number;
    };
  };
  schools: Record<string, School>;
}

export interface Review {
  id: string;
  faculty_id: string;
  rating: number;
  comment: string;
  created_at: string;
}
