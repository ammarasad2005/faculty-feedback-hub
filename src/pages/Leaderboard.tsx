import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFacultyData } from '@/hooks/useFacultyData';
import { useAllReviewStats } from '@/hooks/useReviews';
import { StarRating } from '@/components/StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Star, MessageSquare, TrendingUp, Users } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Leaderboard() {
  const { faculty, departments, loading } = useFacultyData();
  const { data: reviewStats, isLoading: statsLoading } = useAllReviewStats();

  const leaderboardData = useMemo(() => {
    if (!reviewStats || !faculty.length) return [];

    return faculty
      .map((member) => {
        const stats = reviewStats[member.id];
        return {
          ...member,
          avgRating: stats?.avg || 0,
          totalReviews: stats?.total || 0,
        };
      })
      .filter((m) => m.totalReviews > 0)
      .sort((a, b) => b.avgRating - a.avgRating || b.totalReviews - a.totalReviews);
  }, [faculty, reviewStats]);

  const topRated = leaderboardData.slice(0, 10);

  const overallStats = useMemo(() => {
    if (!reviewStats) return { totalReviews: 0, avgRating: 0, facultyWithReviews: 0 };

    const entries = Object.values(reviewStats);
    const totalReviews = entries.reduce((sum, s) => sum + s.total, 0);
    const totalSum = entries.reduce((sum, s) => sum + s.sum, 0);

    return {
      totalReviews,
      avgRating: totalReviews > 0 ? totalSum / totalReviews : 0,
      facultyWithReviews: entries.length,
    };
  }, [reviewStats]);

  const ratingDistribution = useMemo(() => {
    if (!reviewStats) return [];

    const distribution = [
      { rating: '5 Stars', count: 0, fill: 'hsl(var(--chart-1))' },
      { rating: '4 Stars', count: 0, fill: 'hsl(var(--chart-2))' },
      { rating: '3 Stars', count: 0, fill: 'hsl(var(--chart-3))' },
      { rating: '2 Stars', count: 0, fill: 'hsl(var(--chart-4))' },
      { rating: '1 Star', count: 0, fill: 'hsl(var(--chart-5))' },
    ];

    // Estimate distribution based on average (simplified)
    Object.values(reviewStats).forEach((stats) => {
      const avgRounded = Math.round(stats.avg);
      if (avgRounded >= 1 && avgRounded <= 5) {
        distribution[5 - avgRounded].count += stats.total;
      }
    });

    return distribution;
  }, [reviewStats]);

  const departmentStats = useMemo(() => {
    if (!reviewStats || !faculty.length) return [];

    const deptMap: Record<string, { total: number; sum: number; count: number }> = {};

    faculty.forEach((member) => {
      const stats = reviewStats[member.id];
      if (stats) {
        if (!deptMap[member.department]) {
          deptMap[member.department] = { total: 0, sum: 0, count: 0 };
        }
        deptMap[member.department].total += stats.total;
        deptMap[member.department].sum += stats.sum;
        deptMap[member.department].count++;
      }
    });

    return Object.entries(deptMap)
      .map(([name, data]) => ({
        name: name.length > 20 ? name.slice(0, 20) + '...' : name,
        fullName: name,
        avgRating: data.total > 0 ? data.sum / data.total : 0,
        reviews: data.total,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  }, [faculty, reviewStats]);

  const isLoading = loading || statsLoading;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-border bg-card">
        <div className="container py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="p-2 border-2 border-border bg-primary text-primary-foreground shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                Faculty Leaderboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Top-rated professors based on student reviews
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Stats Overview - 2x2 grid on mobile */}
        <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-4">
          <Card className="border">
            <CardHeader className="p-2.5 sm:p-4 pb-1">
              <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                Reviews
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-5 sm:h-7 w-12" />
              ) : (
                <div className="text-lg sm:text-2xl font-bold">{overallStats.totalReviews}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="p-2.5 sm:p-4 pb-1">
              <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                Avg
                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-5 sm:h-7 w-12" />
              ) : (
                <div className="text-lg sm:text-2xl font-bold">
                  {overallStats.avgRating.toFixed(1)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="p-2.5 sm:p-4 pb-1">
              <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                Rated
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-5 sm:h-7 w-12" />
              ) : (
                <div className="text-lg sm:text-2xl font-bold">
                  {overallStats.facultyWithReviews}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="p-2.5 sm:p-4 pb-1">
              <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                Depts
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-5 sm:h-7 w-12" />
              ) : (
                <div className="text-lg sm:text-2xl font-bold">{departments.length}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content sections - stack on mobile */}
        <div className="space-y-4 sm:space-y-6">
          {/* Top Rated Faculty */}
          <Card className="border">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Trophy className="h-4 w-4 text-primary" />
                Top 10 Faculty
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : topRated.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 text-sm">
                  No reviews yet. Be the first to rate!
                </p>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {topRated.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 p-2 border border-border bg-background/50 rounded-sm"
                    >
                      <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-muted text-[10px] sm:text-xs font-bold shrink-0 rounded-sm">
                        {index + 1}
                      </div>
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 object-cover border border-border rounded-sm shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {member.department}
                        </p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-1">
                        <StarRating rating={Math.round(member.avgRating)} size="sm" />
                        <span className="font-bold text-xs">
                          {member.avgRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Rankings */}
          <Card className="border">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base">Department Rankings</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : departmentStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 text-sm">
                  No department data available yet.
                </p>
              ) : (
                <div className="h-[200px] sm:h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentStats} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={70}
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '4px',
                          fontSize: '11px',
                        }}
                        formatter={(value: number) => [value.toFixed(2), 'Avg']}
                      />
                      <Bar dataKey="avgRating" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card className="border">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-[140px] w-full" />
              ) : ratingDistribution.every((d) => d.count === 0) ? (
                <p className="text-muted-foreground text-center py-6 text-sm">
                  No rating data available yet.
                </p>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ratingDistribution.filter((d) => d.count > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          {ratingDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '4px',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {ratingDistribution.map((entry, index) => (
                      <div key={entry.rating} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-[11px] sm:text-xs text-muted-foreground">
                          {entry.rating}: <span className="font-medium text-foreground">{entry.count}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
