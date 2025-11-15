import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  TrendingUp,
  ExternalLink,
  BookOpen,
  Award,
  Target,
  Lightbulb,
  CheckCircle2,
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

const radarData = [
  { domain: "Programming", score: 85 },
  { domain: "Analytics", score: 60 },
  { domain: "Testing", score: 45 },
  { domain: "Problem Solving", score: 78 },
  { domain: "Logic", score: 82 },
];

const salaryData = [
  { level: "Entry", min: 6, max: 10 },
  { level: "Mid", min: 12, max: 20 },
  { level: "Senior", min: 25, max: 40 },
];

const jobProfiles = [
  { title: "Backend Developer", demand: "High", growth: "+15%" },
  { title: "Full-Stack Developer", demand: "Very High", growth: "+18%" },
  { title: "DevOps Engineer", demand: "High", growth: "+20%" },
  { title: "Mobile Developer", demand: "Medium", growth: "+12%" },
];

const skillsToImprove = [
  { skill: "Data Structures & Algorithms", priority: "High" },
  { skill: "Database Management (SQL)", priority: "High" },
  { skill: "System Design", priority: "Medium" },
];

const learningRoadmap = [
  { step: 1, title: "Master the Fundamentals", description: "Learn Python/JavaScript in depth", duration: "2-3 months" },
  { step: 2, title: "Learn a Framework", description: "React/Django/Node.js", duration: "2 months" },
  { step: 3, title: "Understand Databases", description: "SQL, MongoDB basics", duration: "1 month" },
  { step: 4, title: "Build Projects", description: "Create 3-5 portfolio projects", duration: "3 months" },
  { step: 5, title: "Prepare for Interviews", description: "DSA practice & mock interviews", duration: "2 months" },
];

const resources = [
  { title: "Full Stack Web Development", source: "Udemy", link: "#", type: "Course" },
  { title: "Data Structures in Python", source: "Coursera", link: "#", type: "Course" },
  { title: "System Design Primer", source: "GitHub", link: "#", type: "Guide" },
  { title: "LeetCode Practice", source: "LeetCode", link: "#", type: "Practice" },
];

export default function Results() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 space-y-8">
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
                      <Code2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Programmer</h3>
                      <p className="text-sm text-muted-foreground">Best match for your profile</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Your strong logical thinking and problem-solving skills make you an excellent fit for a programming career. You show natural aptitude for understanding complex systems.
                  </p>
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
                  {jobProfiles.map((job) => (
                    <div key={job.title} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <h4 className="font-semibold mb-2">{job.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{job.demand} Demand</Badge>
                        <Badge className="bg-success">{job.growth} Growth</Badge>
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
                <p className="text-muted-foreground leading-relaxed">
                  The programming field continues to show exceptional growth with increasing demand across all sectors.
                  As digital transformation accelerates, skilled programmers are needed for AI/ML, cloud computing,
                  cybersecurity, and web3 technologies. Career progression typically leads to senior developer,
                  tech lead, or solution architect roles with significant earning potential and job security.
                </p>
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
                  {skillsToImprove.map((item) => (
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
                  {learningRoadmap.map((step, index) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        {index < learningRoadmap.length - 1 && (
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
                    <div key={resource.title} className="p-4 border rounded-lg hover:border-primary/50 transition-all hover-lift">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground">{resource.source}</p>
                        </div>
                        <Badge variant="secondary">{resource.type}</Badge>
                      </div>
                      <Button variant="link" className="p-0 h-auto text-primary" asChild>
                        <a href={resource.link}>
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
          <Button size="lg" className="bg-accent hover:bg-accent/90">
            Save Results
          </Button>
          <Button size="lg" variant="outline">
            Retake Assessment
          </Button>
          <Button size="lg" variant="outline">
            Share Results
          </Button>
        </div>
      </div>
    </div>
  );
}