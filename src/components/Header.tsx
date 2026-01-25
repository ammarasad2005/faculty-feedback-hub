import { useState } from 'react';
import { GraduationCap, LogIn, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { AdminPanel } from './AdminPanel';

interface HeaderProps {
  totalFaculty: number;
  totalDepartments: number;
}

export function Header({ totalFaculty, totalDepartments }: HeaderProps) {
  const { user, isAdmin, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <>
      <header className="border-b-2 border-border bg-card">
        <div className="container py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
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

            <div className="flex items-center gap-2">
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
    </>
  );
}
