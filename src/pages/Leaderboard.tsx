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

      <main className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold">{overallStats.totalReviews}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold">
                  {overallStats.avgRating.toFixed(1)}<span className="text-sm sm:text-base font-normal text-muted-foreground"> / 5</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Reviewed</CardTitle>
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold">
                  {overallStats.facultyWithReviews}<span className="text-sm sm:text-base font-normal text-muted-foreground"> / {faculty.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Departments</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold">{departments.length}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Top Rated Faculty */}
          <Card className="border-2">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Top 10 Faculty
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {isLoading ? (
                <div className="space-y-2 sm:space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 sm:h-16 w-full" />
                  ))}
                </div>
              ) : topRated.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm">
                  No reviews yet. Be the first to rate!
                </p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {topRated.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-border bg-card rounded-sm"
                    >
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 border border-border bg-muted font-bold text-xs sm:text-sm shrink-0">
                        {index + 1}
                      </div>
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-cover border border-border rounded-sm shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {member.department}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <StarRating rating={Math.round(member.avgRating)} size="sm" />
                          <span className="font-bold text-xs sm:text-sm ml-0.5 sm:ml-1">
                            {member.avgRating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {member.totalReviews} reviews
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Rankings */}
          <Card className="border-2">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Department Rankings</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {isLoading ? (
                <Skeleton className="h-[250px] sm:h-[300px] w-full" />
              ) : departmentStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm">
                  No department data available yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={departmentStats} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 5]} className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '0',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [value.toFixed(2), 'Avg Rating']}
                    />
                    <Bar dataKey="avgRating" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card className="border-2 lg:col-span-2">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {isLoading ? (
                <Skeleton className="h-[180px] sm:h-[200px] w-full" />
              ) : ratingDistribution.every((d) => d.count === 0) ? (
                <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm">
                  No rating data available yet.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                  <div className="w-full sm:w-auto">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={ratingDistribution.filter((d) => d.count > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
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
                            border: '2px solid hsl(var(--border))',
                            borderRadius: '0',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                    {ratingDistribution.map((entry, index) => (
                      <div key={entry.rating} className="flex items-center gap-1.5 sm:gap-2">
                        <div
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs sm:text-sm">
                          {entry.rating}: {entry.count}
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
