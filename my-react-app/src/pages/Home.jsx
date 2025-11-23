import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, BarChart3, TestTube2, ArrowRight, Sparkles, CheckCircle2, Clock, Award, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Chatbot, ChatbotButton } from "@/components/Chatbot";
import ThreeDBackground from "@/components/ThreeDBackground";

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
    <div className="min-h-screen bg-background relative">
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

      {/* Hero Section - Glassmorphism Upgrade */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Subtle ambient gradients - very transparent */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.03),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--accent)/0.03),transparent_50%)]" />

        <div className="container relative py-16 md:py-24 lg:py-32">
          {/* Glassmorphism Hero Container */}
          <div className="max-w-5xl mx-auto px-4">
            <div
              className="glass-card rounded-3xl p-8 md:p-12 lg:p-16 border border-white/10 backdrop-blur-xl animate-fade-in"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.15), inset 0 1px 0 0 rgba(255,255,255,0.1)'
              }}
            >
              <div className="flex flex-col items-center text-center space-y-8">
                {/* Badge with float animation */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-cyan-400/30 text-cyan-400 text-sm font-medium backdrop-blur-sm animate-fade-in float">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Smart Career Guidance System
                </div>

                {/* Enhanced Heading with larger size and gradient Tech */}
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight animate-fade-in">
                  <span className="block mb-3">Find Your Future in</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient shimmer">
                    Tech
                  </span>
                </h1>

                {/* Subtext with fade-in delay */}
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed fade-in-delay-1">
                  Discover your perfect career path through our <span className="text-cyan-400 font-semibold">AI-powered</span> assessment.
                  <br className="hidden md:block" />
                  Get personalized recommendations for Programming, Analytics, or Testing careers.
                </p>

                {/* Modern Gradient Buttons */}
                <div className="flex flex-col sm:flex-row gap-5 pt-4 fade-in-delay-2">
                  <Button
                    size="lg"
                    onClick={() => navigate(user ? "/quiz" : "/auth")}
                    className="group relative text-lg h-16 px-10 rounded-full overflow-hidden border-0 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)',
                    }}
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                    <span className="relative z-10 flex items-center gap-2 font-bold text-white">
                      Start Your Free Assessment
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      const element = document.getElementById("domains");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group text-lg h-16 px-10 rounded-full border-2 border-cyan-400/50 bg-transparent hover:bg-cyan-400/10 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 text-cyan-400"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      Explore Careers
                    </span>
                  </Button>
                </div>

                {/* Stats with pulsing animations */}
                <div className="flex flex-wrap items-center justify-center gap-8 pt-6 text-base fade-in-delay-3">
                  <div className="flex items-center gap-2.5 text-gray-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    <span>30 questions</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{ animationDelay: '0.5s' }} />
                    <span>30 minutes</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ animationDelay: '1s' }} />
                    <span>Instant results</span>
                  </div>
                </div>
              </div>

              {/* Bottom glow effect */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-t from-cyan-500/20 to-transparent blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-sm text-gray-400">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-cyan-400/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.05),transparent_50%)]" />
        <div className="container px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const delays = ['fade-in', 'fade-in-delay-1', 'fade-in-delay-2', 'fade-in-delay-3'];
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center text-center p-4 md:p-6 rounded-xl glass-card glass-hover hover-lift ${delays[index]}`}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3 md:mb-4 pulse-glow">
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
                className="group relative overflow-hidden glass-card glass-hover hover-lift neon-border-hover shimmer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-chart-3/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-chart-3 rounded-lg opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

                <CardContent className="relative pt-8 pb-6 px-6 md:px-8 text-center">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl ${domain.bgColor} flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mx-auto float`}>
                    <Icon className={`h-7 w-7 md:h-8 md:w-8 ${domain.color}`} />
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:gradient-text transition-all duration-300">
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
                          className="text-xs px-3 py-1.5 rounded-full glass border border-primary/20 group-hover:border-primary/40 transition-all duration-300 hover:scale-105"
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
        <Card className="relative overflow-hidden glass-card border-2 neon-border hover-glow max-w-4xl mx-auto">
          <div className="absolute inset-0 animated-gradient opacity-30" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/30 rounded-full filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/30 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-chart-3/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <CardContent className="relative py-8 md:py-12 px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 md:mb-6 gradient-text shimmer">
              Ready to Start Your Tech Journey?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students who've discovered their perfect tech career path with STREAM.
              Your future in tech starts here.
            </p>
            <Button
              size="lg"
              className="text-lg md:text-xl h-14 md:h-16 px-10 md:px-12 rounded-full shadow-2xl hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all duration-300 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 group mb-4 hover-lift neon-border-hover"
              onClick={() => navigate(user ? "/quiz" : "/auth")}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-2 transition-transform duration-300" />
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
