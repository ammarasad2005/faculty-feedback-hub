import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  totalFaculty: number;
  totalDepartments: number;
}

export function Header({ totalFaculty, totalDepartments }: HeaderProps) {
  return (
    <header className="border-b-2 border-border bg-card">
      <div className="container py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 border-2 border-border bg-primary text-primary-foreground">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            FAST-NUCES Islamabad
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Anonymous Faculty Review System
        </p>
        <div className="flex gap-6 mt-4 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{totalFaculty}</span>
            <span className="text-muted-foreground">Faculty Members</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{totalDepartments}</span>
            <span className="text-muted-foreground">Departments</span>
          </div>
        </div>
      </div>
    </header>
  );
}
