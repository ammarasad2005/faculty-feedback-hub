import { useState, useEffect, useMemo } from 'react';
import { FacultyData, FacultyMember, Department } from '@/types/faculty';

export interface ProcessedFaculty extends FacultyMember {
  id: string;
  department: string;
  departmentCode: string;
  school: string;
  isHOD: boolean;
}

export function useFacultyData() {
  const [data, setData] = useState<FacultyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/faculty.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const { faculty, departments, schools } = useMemo(() => {
    if (!data) return { faculty: [], departments: [], schools: [] };

    const allFaculty: ProcessedFaculty[] = [];
    const allDepartments: string[] = [];
    const allSchools: string[] = [];

    Object.entries(data.schools).forEach(([schoolName, school]) => {
      if (!allSchools.includes(schoolName)) {
        allSchools.push(schoolName);
      }

      Object.entries(school.departments).forEach(([deptCode, dept]) => {
        const deptName = dept.name;
        if (!allDepartments.includes(deptName)) {
          allDepartments.push(deptName);
        }

        // Add HOD
        if (dept.head_of_department) {
          allFaculty.push({
            ...dept.head_of_department,
            id: `${deptCode}-hod-${dept.head_of_department.email}`,
            department: deptName,
            departmentCode: deptCode,
            school: schoolName,
            isHOD: true,
          });
        }

        // Add faculty members
        dept.faculty.forEach((member) => {
          allFaculty.push({
            ...member,
            id: `${deptCode}-${member.email}`,
            department: deptName,
            departmentCode: deptCode,
            school: schoolName,
            isHOD: false,
          });
        });
      });
    });

    return {
      faculty: allFaculty,
      departments: allDepartments.sort(),
      schools: allSchools.sort(),
    };
  }, [data]);

  return { data, faculty, departments, schools, loading, error };
}
