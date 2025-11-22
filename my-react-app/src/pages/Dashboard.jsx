import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  RefreshCw,
  Eye,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

const fetchDashboardData = async () => {
  const [profileRes, attemptsRes, progressRes] = await Promise.all([
    api.get('/auth/me'),
    api.get('/quiz/attempts'),
    api.get('/progress/')
  ]);

  return {
    profile: profileRes.data,
    attempts: attemptsRes.data,
    progress: progressRes.data
  };
};

const fetchRoadmap = async (domain) => {
  const res = await api.get(`/content/roadmaps?domain=${domain}`);
  return res.data;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: dataLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardData", user?.id],
    queryFn: fetchDashboardData,
    enabled: !authLoading && !!user,
  });

  const latestAttempt = data?.attempts?.[data.attempts.length - 1];
  const recommendedDomain = latestAttempt?.recommended_domain;

  const {
    data: roadmap,
    isLoading: roadmapLoading
  } = useQuery({
    queryKey: ["roadmap", recommendedDomain],
    queryFn: () => fetchRoadmap(recommendedDomain),
    enabled: !!recommendedDomain,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ stepId, isCompleted }) => {
      if (isCompleted) {
        await api.post('/progress/', { roadmap_step_id: stepId, is_completed: true });
      } else {
        await api.delete(`/progress/${stepId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["dashboardData", user?.id]);
    },
  });

  const handleProgressToggle = (stepId, currentStatus) => {
    updateProgressMutation.mutate({ stepId, isCompleted: !currentStatus });
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/auth", { replace: true });
    return null;
  }

  // Show a loader while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show a loader while data is loading
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Error loading dashboard: {error.message}</p>
      </div>
    );
  }

  // Handle case where user has no attempts yet
  if (!data || !data.profile || !data.attempts || data.attempts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome, {data?.profile?.full_name || user?.email}!</h1>
          <p className="text-muted-foreground mb-8">You haven't taken an assessment yet. Take one to see your dashboard.</p>
          <Button onClick={() => navigate("/quiz")} size="lg" className="bg-accent hover:bg-accent/90">
            Take Your First Assessment
          </Button>
        </div>
      </div>
    );
  }

  // Data is loaded! Let's format it for the components.
  const { profile, attempts, progress } = data;

  // Format for "Progress Over Time" chart
  const progressData = attempts.map((att) => ({
    date: new Date(att.completed_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    score: att.total_score,
  }));

  // Format for "Skill Affinity" chart
  const skillAffinityData = attempts.map((att, index) => ({
    attempt: `Attempt ${index + 1}`,
    Programming: att.programmer_score,
    Analytics: att.analytics_score,
    Testing: att.tester_score,
  }));

  // Format for "Past Attempts" list (latest first)
  const pastAttempts = [...attempts].reverse();

  // Calculate Roadmap Progress
  const completedStepIds = new Set(progress.map(p => p.roadmap_step_id));
  const totalSteps = roadmap?.length || 0;
  const completedSteps = roadmap?.filter(step => completedStepIds.has(step.id)).length || 0;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground mt-2">Track your progress and career journey</p>
          </div>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90"
            onClick={() => navigate("/quiz")}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retake Assessment
          </Button>
        </div>

        {/* Profile Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>My Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                  <p className="text-sm text-muted-foreground">Tech Student</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>{attempts.length} Assessments Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Skill Affinity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Affinity Across Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillAffinityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="attempt"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="Programming" fill="hsl(var(--chart-1))" />
                <Bar dataKey="Analytics" fill="hsl(var(--chart-2))" />
                <Bar dataKey="Testing" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Learning Roadmap Section */}
        {roadmap && roadmap.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  My Learning Roadmap ({recommendedDomain})
                </CardTitle>
                <Badge variant="outline">{progressPercentage}% Completed</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roadmap.map((step) => {
                  const isCompleted = completedStepIds.has(step.id);
                  return (
                    <div key={step.id} className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${isCompleted ? 'bg-muted/30' : ''}`}>
                      <Checkbox
                        id={`step-${step.id}`}
                        checked={isCompleted}
                        onCheckedChange={() => handleProgressToggle(step.id, isCompleted)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={`step-${step.id}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {step.title}
                        </label>
                        <p className={`text-sm text-muted-foreground ${isCompleted ? 'line-through' : ''}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Past Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAttempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">
                        {pastAttempts.length - index}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold capitalize">
                        {attempt.recommended_domain}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(attempt.completed_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{attempt.total_score} / 30</p>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate("/results", { state: { attemptId: attempt.id } })
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}