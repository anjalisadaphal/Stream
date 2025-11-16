import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  BarChart3,
  TestTube2,
  TrendingUp,
  ExternalLink,
  BookOpen,
  Award,
  Target,
  Lightbulb,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Domain-specific data
const domainInfo = {
  programmer: {
    name: "Programmer",
    icon: Code2,
    description: "Your strong logical thinking and problem-solving skills make you an excellent fit for a programming career. You show natural aptitude for understanding complex systems.",
    jobProfiles: [
      { title: "Backend Developer", demand: "High", growth: "+15%" },
      { title: "Full-Stack Developer", demand: "Very High", growth: "+18%" },
      { title: "DevOps Engineer", demand: "High", growth: "+20%" },
      { title: "Mobile Developer", demand: "Medium", growth: "+12%" },
    ],
    skillsToImprove: [
      { skill: "Data Structures & Algorithms", priority: "High" },
      { skill: "Database Management (SQL)", priority: "High" },
      { skill: "System Design", priority: "Medium" },
    ],
    learningRoadmap: [
      { step: 1, title: "Master the Fundamentals", description: "Learn Python/JavaScript in depth", duration: "2-3 months" },
      { step: 2, title: "Learn a Framework", description: "React/Django/Node.js", duration: "2 months" },
      { step: 3, title: "Understand Databases", description: "SQL, MongoDB basics", duration: "1 month" },
      { step: 4, title: "Build Projects", description: "Create 3-5 portfolio projects", duration: "3 months" },
      { step: 5, title: "Prepare for Interviews", description: "DSA practice & mock interviews", duration: "2 months" },
    ],
    futureScope: "The programming field continues to show exceptional growth with increasing demand across all sectors. As digital transformation accelerates, skilled programmers are needed for AI/ML, cloud computing, cybersecurity, and web3 technologies. Career progression typically leads to senior developer, tech lead, or solution architect roles with significant earning potential and job security.",
  },
  analytics: {
    name: "Analytics",
    icon: BarChart3,
    description: "Your analytical mindset and data-driven approach make you well-suited for analytics roles. You excel at finding patterns and insights in complex data.",
    jobProfiles: [
      { title: "Data Analyst", demand: "Very High", growth: "+22%" },
      { title: "Business Analyst", demand: "High", growth: "+18%" },
      { title: "Data Scientist", demand: "High", growth: "+25%" },
      { title: "BI Developer", demand: "Medium", growth: "+15%" },
    ],
    skillsToImprove: [
      { skill: "SQL & Database Querying", priority: "High" },
      { skill: "Data Visualization Tools", priority: "High" },
      { skill: "Statistical Analysis", priority: "Medium" },
    ],
    learningRoadmap: [
      { step: 1, title: "Learn SQL Fundamentals", description: "Master database queries and joins", duration: "1-2 months" },
      { step: 2, title: "Data Visualization", description: "Excel, Tableau, Power BI", duration: "2 months" },
      { step: 3, title: "Python for Analytics", description: "Pandas, NumPy, Matplotlib", duration: "2 months" },
      { step: 4, title: "Build Analytics Projects", description: "Create portfolio with real datasets", duration: "3 months" },
      { step: 5, title: "Advanced Analytics", description: "Machine Learning basics", duration: "2 months" },
    ],
    futureScope: "The analytics field is experiencing explosive growth as organizations increasingly rely on data-driven decision making. With the rise of big data, AI, and business intelligence tools, analytics professionals are in high demand across all industries. Career paths lead to senior analyst, data scientist, or analytics manager roles.",
  },
  tester: {
    name: "Tester",
    icon: TestTube2,
    description: "Your attention to detail and systematic approach make you an ideal candidate for quality assurance and testing roles. You have a natural ability to identify issues and ensure quality.",
    jobProfiles: [
      { title: "QA Engineer", demand: "High", growth: "+16%" },
      { title: "Test Automation Engineer", demand: "Very High", growth: "+20%" },
      { title: "Performance Tester", demand: "Medium", growth: "+14%" },
      { title: "Security Tester", demand: "High", growth: "+18%" },
    ],
    skillsToImprove: [
      { skill: "Test Automation Tools", priority: "High" },
      { skill: "API Testing", priority: "High" },
      { skill: "Performance Testing", priority: "Medium" },
    ],
    learningRoadmap: [
      { step: 1, title: "Testing Fundamentals", description: "Manual testing concepts and methodologies", duration: "1-2 months" },
      { step: 2, title: "Test Automation", description: "Selenium, Cypress, or Playwright", duration: "2-3 months" },
      { step: 3, title: "API Testing", description: "Postman, REST Assured", duration: "1-2 months" },
      { step: 4, title: "Build Test Projects", description: "Create comprehensive test suites", duration: "2-3 months" },
      { step: 5, title: "Advanced Testing", description: "Performance, security, and CI/CD integration", duration: "2 months" },
    ],
    futureScope: "Quality assurance and testing remain critical as software complexity increases. With the shift towards DevOps and continuous delivery, test automation skills are highly valued. Career progression leads to senior QA engineer, test architect, or QA manager positions with strong job security and growth potential.",
  },
};

const salaryData = [
  { level: "Entry", min: 6, max: 10 },
  { level: "Mid", min: 12, max: 20 },
  { level: "Senior", min: 25, max: 40 },
];

const resources = [
  { title: "Full Stack Web Development", source: "Udemy", link: "#", type: "Course" },
  { title: "Data Structures in Python", source: "Coursera", link: "#", type: "Course" },
  { title: "System Design Primer", source: "GitHub", link: "#", type: "Guide" },
  { title: "LeetCode Practice", source: "LeetCode", link: "#", type: "Practice" },
];

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const attemptId = location.state?.attemptId;
        
        if (!attemptId) {
          toast({
            title: "No results found",
            description: "Please take the assessment first.",
            variant: "destructive",
          });
          navigate("/quiz");
          return;
        }

        // Verify session is still valid
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Session expired",
            description: "Please sign in again to view your results.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("id", attemptId)
          .single();

        if (error) {
          if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
            toast({
              title: "Session expired",
              description: "Please sign in again.",
              variant: "destructive",
            });
            navigate("/auth");
            return;
          }
          throw error;
        }

        if (data.user_id !== user?.id) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view these results.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setAttempt(data);
      } catch (error) {
        toast({
          title: "Error loading results",
          description: error.message,
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAttempt();
    }
  }, [location.state, user, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!attempt) {
    return null;
  }

  const domain = attempt.recommended_domain;
  const domainData = domainInfo[domain] || domainInfo.programmer;
  const DomainIcon = domainData.icon;

  // Calculate radar chart data from scores
  const maxScore = Math.max(
    attempt.programmer_score,
    attempt.analytics_score,
    attempt.tester_score,
    1
  );
  const radarData = [
    { domain: "Programming", score: Math.round((attempt.programmer_score / maxScore) * 100) },
    { domain: "Analytics", score: Math.round((attempt.analytics_score / maxScore) * 100) },
    { domain: "Testing", score: Math.round((attempt.tester_score / maxScore) * 100) },
    { domain: "Problem Solving", score: Math.round((attempt.total_score / 30) * 100) },
    { domain: "Logic", score: Math.round((attempt.total_score / 30) * 100) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-accent text-accent-foreground">Assessment Complete</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Your Career Path Results</h1>
          <p className="text-muted-foreground text-lg">
            Based on your assessment, here's your personalized career guidance
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="career">Career Path</TabsTrigger>
            <TabsTrigger value="roadmap">Action Plan</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recommendation Card */}
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    Your Recommended Path
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <DomainIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold capitalize">{domainData.name}</h3>
                      <p className="text-sm text-muted-foreground">Best match for your profile</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Score:</span>
                      <span className="font-semibold">{attempt.total_score} / 30</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Programming:</span>
                      <span className="font-semibold">{attempt.programmer_score}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Analytics:</span>
                      <span className="font-semibold">{attempt.analytics_score}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Testing:</span>
                      <span className="font-semibold">{attempt.tester_score}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{domainData.description}</p>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="domain"
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                      />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Career Path Tab */}
          <TabsContent value="career" className="space-y-6">
            {/* Job Profiles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommended Job Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {domainData.jobProfiles.map((job) => (
                    <div key={job.title} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <h4 className="font-semibold mb-2">{job.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{job.demand} Demand</Badge>
                        <Badge className="bg-green-500">{job.growth} Growth</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Salary Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Salary Insights (LPA)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="level" tick={{ fill: "hsl(var(--foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="min" fill="hsl(var(--primary))" name="Minimum" />
                    <Bar dataKey="max" fill="hsl(var(--accent))" name="Maximum" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Future Scope */}
            <Card>
              <CardHeader>
                <CardTitle>Future Scope</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">{domainData.futureScope}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Plan Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            {/* Skills to Improve */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Skills to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {domainData.skillsToImprove.map((item) => (
                    <div key={item.skill} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{item.skill}</span>
                      <Badge variant={item.priority === "High" ? "default" : "secondary"}>
                        {item.priority} Priority
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Roadmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Your Personalized Learning Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {domainData.learningRoadmap.map((step, index) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        {index < domainData.learningRoadmap.length - 1 && (
                          <div className="w-0.5 h-full bg-border my-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <h4 className="font-semibold text-lg mb-1">{step.title}</h4>
                        <p className="text-muted-foreground mb-2">{step.description}</p>
                        <Badge variant="outline">{step.duration}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recommended Learning Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <div key={resource.title} className="p-4 border rounded-lg hover:border-primary/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground">{resource.source}</p>
                        </div>
                        <Badge variant="secondary">{resource.type}</Badge>
                      </div>
                      <Button variant="link" className="p-0 h-auto text-primary" asChild>
                        <a href={resource.link} target="_blank" rel="noopener noreferrer">
                          Start Learning <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center pt-8">
          <Button size="lg" className="bg-accent hover:bg-accent/90" onClick={() => navigate("/dashboard")}>
            View Dashboard
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/quiz")}>
            Retake Assessment
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.print()}>
            Print Results
          </Button>
        </div>
      </div>
    </div>
  );
}
