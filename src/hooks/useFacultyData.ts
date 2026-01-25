import { useState, useEffect, useMemo } from 'react';
import { FacultyData, FacultyMember, OfficeData } from '@/types/faculty';

export interface ProcessedFaculty extends FacultyMember {
  id: string;
  department: string;
  departmentCode: string;
  school: string;
  isHOD: boolean;
}

export function useFacultyData() {
  const [data, setData] = useState<FacultyData | null>(null);
  const [officeData, setOfficeData] = useState<OfficeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/faculty.json').then((res) => res.json()),
      fetch('/data/facultyOffices.json').then((res) => res.json()),
    ])
      .then(([facultyJson, officeJson]) => {
        setData(facultyJson);
        setOfficeData(officeJson);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const { faculty, departments, schools } = useMemo(() => {
    if (!data) return { faculty: [], departments: [], schools: [] };

    // Create email -> office lookup map
    const officeMap = new Map<string, string>();
    if (officeData) {
      Object.values(officeData).forEach((entries) => {
        entries.forEach((entry) => {
          officeMap.set(entry.Email.toLowerCase(), entry.Office);
        });
      });
    }

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
          const hodEmail = dept.head_of_department.email.toLowerCase();
          allFaculty.push({
            ...dept.head_of_department,
            office: officeMap.get(hodEmail),
            id: `${deptCode}-hod-${dept.head_of_department.email}`,
            department: deptName,
            departmentCode: deptCode,
            school: schoolName,
            isHOD: true,
          });
        }

        // Add faculty members
        dept.faculty.forEach((member) => {
          const memberEmail = member.email.toLowerCase();
          allFaculty.push({
            ...member,
            office: officeMap.get(memberEmail),
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
  }, [data, officeData]);

  return { data, faculty, departments, schools, loading, error };
}
