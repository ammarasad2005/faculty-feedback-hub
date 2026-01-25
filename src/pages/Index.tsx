import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { SearchFilter } from '@/components/SearchFilter';
import { FacultyCard } from '@/components/FacultyCard';
import { FacultyModal } from '@/components/FacultyModal';
import { useFacultyData, ProcessedFaculty } from '@/hooks/useFacultyData';
import { useAllReviewStats } from '@/hooks/useReviews';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { faculty, departments, loading, error } = useFacultyData();
  const { data: reviewStats } = useAllReviewStats();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState<ProcessedFaculty | null>(null);

  const filteredFaculty = useMemo(() => {
    return faculty.filter((member) => {
      const matchesSearch = member.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesDepartment =
        selectedDepartment === 'all' || member.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [faculty, searchQuery, selectedDepartment]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center border-2 border-destructive p-8">
          <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        totalFaculty={faculty.length}
        totalDepartments={departments.length}
      />

      <main className="container py-6">
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          departments={departments}
        />

        {loading ? (
          <div className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border-2 border-border p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mt-4 mb-4">
              Showing {filteredFaculty.length} of {faculty.length} faculty members
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFaculty.map((member) => (
                <FacultyCard
                  key={member.id}
                  faculty={member}
                  stats={reviewStats?.[member.id]}
                  onClick={() => setSelectedFaculty(member)}
                />
              ))}
            </div>

            {filteredFaculty.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-border mt-6">
                <p className="text-muted-foreground">
                  No faculty members found matching your criteria.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <FacultyModal
        faculty={selectedFaculty}
        onClose={() => setSelectedFaculty(null)}
      />

      <footer className="border-t-2 border-border py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Anonymous Faculty Review System • FAST-NUCES Islamabad</p>
          <p className="mt-1">Reviews are completely anonymous and cannot be traced back to users.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
