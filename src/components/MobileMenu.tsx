import { Link } from 'react-router-dom';
import { Trophy, Bell, LogIn, LogOut, Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileMenuProps {
  user: any;
  isAdmin: boolean;
  onShowLogin: () => void;
  onShowAdmin: () => void;
  onShowReviews: () => void;
  onSignOut: () => void;
}

export function MobileMenu({
  user,
  isAdmin,
  onShowLogin,
  onShowAdmin,
  onShowReviews,
  onSignOut,
}: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-6">
          <Button variant="ghost" size="lg" asChild className="justify-start gap-3 h-12">
            <Link to="/leaderboard">
              <Trophy className="w-5 h-5" />
              Leaderboard
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={onShowReviews}
            className="justify-start gap-3 h-12"
          >
            <Bell className="w-5 h-5" />
            Recent Reviews
          </Button>

          <div className="my-2 border-t border-border" />

          {user ? (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onShowAdmin}
                  className="justify-start gap-3 h-12"
                >
                  <Shield className="w-5 h-5" />
                  Admin Panel
                </Button>
              )}
              <Button
                variant="ghost"
                size="lg"
                onClick={onSignOut}
                className="justify-start gap-3 h-12 text-muted-foreground"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              onClick={onShowLogin}
              className="justify-start gap-3 h-12"
            >
              <LogIn className="w-5 h-5" />
              Admin Login
            </Button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
