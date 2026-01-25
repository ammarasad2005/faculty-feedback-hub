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
        <div className="container py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 border-2 border-border bg-primary text-primary-foreground">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Faculty Leaderboard
                </h1>
                <p className="text-muted-foreground">
                  Top-rated professors based on student reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{overallStats.totalReviews}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {overallStats.avgRating.toFixed(1)} / 5.0
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewed Faculty</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {overallStats.facultyWithReviews} / {faculty.length}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{departments.length}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Rated Faculty */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top 10 Faculty
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : topRated.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No reviews yet. Be the first to rate!
                </p>
              ) : (
                <div className="space-y-3">
                  {topRated.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 border-2 border-border bg-card"
                    >
                      <div className="flex items-center justify-center w-8 h-8 border-2 border-border bg-muted font-bold text-sm">
                        {index + 1}
                      </div>
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-10 h-10 object-cover border-2 border-border"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.department}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1">
                          <StarRating rating={Math.round(member.avgRating)} size="sm" />
                          <span className="font-bold text-sm ml-1">
                            {member.avgRating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
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
            <CardHeader>
              <CardTitle>Department Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : departmentStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No department data available yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentStats} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 5]} className="text-xs" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '0',
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
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : ratingDistribution.every((d) => d.count === 0) ? (
                <p className="text-muted-foreground text-center py-8">
                  No rating data available yet.
                </p>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={ratingDistribution.filter((d) => d.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
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
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {ratingDistribution.map((entry, index) => (
                      <div key={entry.rating} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">
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
