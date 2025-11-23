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
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Domain-specific data (Static parts)
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
    futureScope: "Quality assurance and testing remain critical as software complexity increases. With the shift towards DevOps and continuous delivery, test automation skills are highly valued. Career progression leads to senior QA engineer, test architect, or QA manager positions with strong job security and growth potential.",
  },
};

const salaryData = [
  { level: "Entry", min: 6, max: 10 },
  { level: "Mid", min: 12, max: 20 },
  { level: "Senior", min: 25, max: 40 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [aiGuidance, setAiGuidance] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [roadmaps, setRoadmaps] = useState([]);
  const [resources, setResources] = useState([]);

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

        // Fetch the specific attempt
        const response = await api.get("/quiz/attempts");
        const attempts = response.data;
        const data = attempts.find(a => a.id === attemptId);

        if (!data) {
          throw new Error("Attempt not found.");
        }

        setAttempt(data);
        const domain = data.recommended_domain;

        // Fetch Roadmaps and Resources
        try {
          const [roadmapsRes, resourcesRes] = await Promise.all([
            api.get(`/content/roadmaps?domain=${domain}`),
            api.get(`/content/resources?domain=${domain}`)
          ]);
          setRoadmaps(roadmapsRes.data);
          setResources(resourcesRes.data);
        } catch (contentError) {
          console.error("Failed to fetch content:", contentError);
        }

        // Fetch AI guidance
        setAiLoading(true);
        try {
          const aiResponse = await api.get(`/quiz/attempts/${attemptId}/ai-guidance`);
          setAiGuidance(aiResponse.data);
        } catch (aiError) {
          console.error("Failed to fetch AI guidance:", aiError);
          // Continue without AI guidance
        } finally {
          setAiLoading(false);
        }

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
  // Use AI guidance if available, otherwise fall back to static data
  const domainData = aiGuidance || domainInfo[domain] || domainInfo.programmer;
  const DomainIcon = domainInfo[domain]?.icon || domainInfo.programmer.icon;

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
      {/* Navigation - Hidden when printing */}
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Print-Only Header - Only visible when printing */}
      <div className="hidden print:block print:text-center print:py-8 print:border-b-2 print:border-black print:mb-8">
        <h1 className="print:text-4xl print:font-bold print:mb-2">STREAM</h1>
        <p className="print:text-lg print:font-semibold">Official Career Guidance Report</p>
        <p className="print:text-sm print:text-gray-600 print:mt-2">
          Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="container py-8 space-y-8 max-w-7xl mx-auto print:max-w-none print:px-8 print:py-0 print:bg-white print:text-black">
        {/* Header */}
        <div className="text-center space-y-4 print:mb-8">
          <div className="flex items-center justify-center gap-2 print:hidden">
            <Badge className="bg-accent text-accent-foreground">Assessment Complete</Badge>
            {aiLoading && <Badge variant="outline">Generating AI Insights...</Badge>}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold print:text-3xl print:text-black">Your Career Path Results</h1>
          <p className="text-muted-foreground text-lg print:text-black print:text-base">
            Based on your assessment, here's your personalized career guidance
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          {/* Tab Selectors - Hidden when printing */}
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 print:hidden">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="career">Career Path</TabsTrigger>
            <TabsTrigger value="roadmap">Action Plan</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 print:block">
            <div className="grid md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
              {/* Recommendation Card */}
              <Card className="border-2 border-primary print:border print:border-black print:shadow-none print:bg-white">
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
                      <h3 className="text-2xl font-bold capitalize print:text-black">{domainData.name}</h3>
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
              <Card className="print:border print:border-black print:shadow-none print:bg-white">
                <CardHeader>
                  <CardTitle>Skills Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={radarData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="score"
                        nameKey="domain"
                      >
                        {radarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
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
                  {domainData.jobProfiles?.map((job) => (
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
                  {domainData.skillsToImprove?.map((item) => (
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
                {roadmaps.length > 0 ? (
                  <div className="space-y-4">
                    {roadmaps.map((step, index) => (
                      <div key={step.id || index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {step.step_number}
                          </div>
                          {index < roadmaps.length - 1 && (
                            <div className="w-0.5 h-full bg-border my-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <h4 className="font-semibold text-lg mb-1">{step.title}</h4>
                          <p className="text-muted-foreground mb-2">{step.description}</p>
                          {/* Duration is not in the new model, removing it or making it optional if added later */}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No roadmap available for this domain yet.
                  </p>
                )}
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
                {resources.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {resources.map((resource, index) => (
                      <div key={resource.id || index} className="p-4 border rounded-lg hover:border-primary/50 transition-all print:border-black print:shadow-none">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{resource.title}</h4>
                            <p className="text-sm text-muted-foreground">{resource.domain}</p>
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
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No resources available for this domain yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons - Hidden when printing */}
        <div className="flex flex-wrap gap-4 justify-center pt-8 print:hidden">
          <Button size="lg" className="bg-accent hover:bg-accent/90" onClick={() => navigate("/dashboard")}>
            View Dashboard
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/quiz")}>
            Retake Assessment
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.print()}>
            Print Results
          </Button>
          <Button size="lg" variant="secondary" onClick={() => {
            const url = `${window.location.origin}/results/${attempt.share_id}`;
            navigator.clipboard.writeText(url);
            toast({
              title: "Link Copied!",
              description: "Share this link with your friends.",
            });
          }}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  );
}
