import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, BarChart3, TestTube2, ArrowRight, Sparkles, CheckCircle2, Clock, Award, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Chatbot, ChatbotButton } from "@/components/Chatbot";

const domains = [
  {
    icon: Code2,
    title: "Programmer",
    description: "Build innovative software solutions, create applications, and bring ideas to life through code.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: ["Full-Stack Development", "Backend Systems", "Mobile Apps", "DevOps"],
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Transform data into insights, make data-driven decisions, and uncover hidden patterns.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    features: ["Data Analysis", "Business Intelligence", "Data Science", "Reporting"],
  },
  {
    icon: TestTube2,
    title: "Tester",
    description: "Ensure software quality, find bugs before users do, and maintain excellence in every release.",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    features: ["QA Engineering", "Test Automation", "Performance Testing", "Security Testing"],
  },
];

const features = [
  {
    icon: Clock,
    title: "30 Minutes",
    description: "Quick assessment that fits into your schedule",
  },
  {
    icon: Award,
    title: "Personalized Results",
    description: "Get tailored career recommendations based on your skills",
  },
  {
    icon: CheckCircle2,
    title: "Instant Feedback",
    description: "Receive your results immediately after completion",
  },
  {
    icon: Users,
    title: "Track Progress",
    description: "Monitor your growth with detailed analytics dashboard",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Chatbot */}
      {isChatbotOpen ? (
        <Chatbot
          isMinimized={isChatbotMinimized}
          onToggle={() => setIsChatbotMinimized(!isChatbotMinimized)}
          onClose={() => setIsChatbotOpen(false)}
        />
      ) : (
        <ChatbotButton onClick={() => setIsChatbotOpen(true)} />
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
        
        <div className="container relative py-16 md:py-24 lg:py-32">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Smart Career Guidance System
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Find Your Future in{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
                Tech
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Discover your perfect career path through our AI-powered assessment. 
              Get personalized recommendations for Programming, Analytics, or Testing careers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="text-base md:text-lg h-14 md:h-16 px-8 md:px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 group"
                onClick={() => navigate(user ? "/quiz" : "/auth")}
              >
                Start Your Free Assessment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-base md:text-lg h-14 md:h-16 px-8 md:px-10 rounded-full border-2 hover:bg-primary/5 hover:border-primary transition-all duration-300"
                onClick={() => {
                  const element = document.getElementById("domains");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore Careers
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                30 questions
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                30 minutes
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-3" />
                Instant results
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4 md:p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                    <Icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Domain Cards Section */}
      <section id="domains" className="container py-16 md:py-24 px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            Explore Career Domains
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover which tech path aligns with your unique skills and interests
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {domains.map((domain, index) => {
            const Icon = domain.icon;
            return (
              <Card
                key={domain.title}
                className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-chart-3/0 group-hover:from-primary/5 group-hover:via-accent/5 group-hover:to-chart-3/5 transition-all duration-500" />

                <CardContent className="relative pt-8 pb-6 px-6 md:px-8 text-center">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl ${domain.bgColor} flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                    <Icon className={`h-7 w-7 md:h-8 md:w-8 ${domain.color}`} />
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {domain.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-4 text-sm md:text-base">
                    {domain.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key Areas:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {domain.features.map((feature, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-md bg-muted border border-border"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24 px-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-chart-3/10 border-2 border-primary/20">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/20 rounded-full filter blur-3xl" />
          </div>

          <CardContent className="relative py-12 md:py-16 px-6 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 md:mb-6 bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
              Ready to Start Your Tech Journey?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students who've discovered their perfect tech career path with STREAM. 
              Your future in tech starts here.
            </p>
            <Button
              size="lg"
              className="text-lg md:text-xl h-14 md:h-16 px-10 md:px-12 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 group mb-4"
              onClick={() => navigate(user ? "/quiz" : "/auth")}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-sm text-muted-foreground">
              No credit card required • Free forever • Instant results
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
