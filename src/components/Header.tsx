import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, LogIn, LogOut, Shield, Trophy, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { AdminPanel } from './AdminPanel';
import { RecentReviewsDialog } from './RecentReviewsDialog';
import { ProcessedFaculty } from '@/hooks/useFacultyData';

interface HeaderProps {
  totalFaculty: number;
  totalDepartments: number;
  faculty: ProcessedFaculty[];
  onFacultyClick: (faculty: ProcessedFaculty) => void;
}

export function Header({ totalFaculty, totalDepartments, faculty, onFacultyClick }: HeaderProps) {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className="border-b border-border/60 bg-gradient-to-br from-background via-card to-primary/8 dark:to-primary/12 shadow-sm">
        <div className="container py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link to="/" className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity">
                <div className="p-2 rounded-lg border border-primary/20 bg-primary text-primary-foreground shadow-md">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  FAST-NUCES Islamabad
                </h1>
              </Link>
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

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="shrink-0"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to="/leaderboard">
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowReviews(true)}
                aria-label="View recent reviews"
                className="shrink-0"
              >
                <Bell className="w-4 h-4" />
              </Button>
              {user ? (
                <>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdmin(true)}
                      className="gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogin(true)}
                  className="gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} />
      <RecentReviewsDialog
        open={showReviews}
        onClose={() => setShowReviews(false)}
        faculty={faculty}
        onFacultyClick={onFacultyClick}
      />
    </>
  );
}
