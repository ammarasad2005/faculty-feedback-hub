import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, LogIn, LogOut, Shield, Trophy, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { AdminPanel } from './AdminPanel';
import { RecentReviewsDialog } from './RecentReviewsDialog';
import { MobileMenu } from './MobileMenu';
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
      <header className="border-b border-border/40 bg-gradient-to-br from-primary/[0.03] via-primary/[0.08] to-primary/[0.15] dark:from-primary/[0.05] dark:via-primary/[0.12] dark:to-primary/[0.20] shadow-sm">
        <div className="container py-4 sm:py-6">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <Link to="/" className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 hover:opacity-80 transition-opacity">
                <div className="p-1.5 sm:p-2 rounded-lg border border-primary/20 bg-primary text-primary-foreground shadow-md shrink-0">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                  FAST-NUCES Islamabad
                </h1>
              </Link>
              <p className="text-sm sm:text-lg text-muted-foreground">
                Anonymous Faculty Review System
              </p>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm font-mono">
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

            {/* Desktop navigation */}
            <div className="hidden sm:flex items-center gap-2">
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

            {/* Mobile navigation */}
            <div className="flex sm:hidden items-center gap-2 shrink-0">
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
              <MobileMenu
                user={user}
                isAdmin={isAdmin}
                onShowLogin={() => setShowLogin(true)}
                onShowAdmin={() => setShowAdmin(true)}
                onShowReviews={() => setShowReviews(true)}
                onSignOut={() => signOut()}
              />
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
