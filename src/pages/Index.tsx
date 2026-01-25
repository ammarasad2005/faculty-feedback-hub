import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { SearchFilter } from '@/components/SearchFilter';
import { FacultyCard } from '@/components/FacultyCard';
import { FacultyModal } from '@/components/FacultyModal';
import { GlobalReviews } from '@/components/GlobalReviews';
import { useFacultyData, ProcessedFaculty } from '@/hooks/useFacultyData';
import { useAllReviewStats } from '@/hooks/useReviews';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [12, 24, 48];

const Index = () => {
  const { faculty, departments, loading, error } = useFacultyData();
  const { data: reviewStats } = useAllReviewStats();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState<ProcessedFaculty | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

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

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDepartment]);

  const totalPages = Math.ceil(filteredFaculty.length / pageSize);
  
  const paginatedFaculty = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFaculty.slice(start, start + pageSize);
  }, [filteredFaculty, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push('ellipsis');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      
      pages.push(totalPages);
    }
    
    return pages;
  };

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
        <GlobalReviews
          faculty={faculty}
          onFacultyClick={setSelectedFaculty}
        />

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
            <div className="flex items-center justify-between gap-4 mt-4 mb-4 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Showing {paginatedFaculty.length} of {filteredFaculty.length} faculty members
                {filteredFaculty.length !== faculty.length && ` (filtered from ${faculty.length})`}
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Per page:</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[70px] h-8 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-border">
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedFaculty.map((member) => (
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

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 border-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {getPageNumbers().map((page, idx) =>
                  page === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="h-8 w-8 border-2"
                    >
                      {page}
                    </Button>
                  )
                )}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 border-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
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
