import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, BarChart3, TestTube2, ArrowRight, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

const domains = [
  {
    icon: Code2,
    title: "Programmer",
    description: "Build innovative software solutions, create applications, and bring ideas to life through code.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Transform data into insights, make data-driven decisions, and uncover hidden patterns.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: TestTube2,
    title: "Tester",
    description: "Ensure software quality, find bugs before users do, and maintain excellence in every release.",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth(); // [c-m] We still need this for the buttons

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-chart-3/5 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.15),transparent_50%)]" />

        <div className="container relative py-24 md:py-40">
          <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary text-sm font-semibold backdrop-blur-sm">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Smart Career Guidance System
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-balance leading-tight">
              Find Your Future<br />in <span className="bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">Tech</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl text-balance leading-relaxed">
              Take our AI-powered 30-minute assessment and discover your perfect career path in Programming, Analytics, or Testing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="text-lg h-16 px-10 rounded-full shadow-2xl hover:shadow-accent/50 transition-all duration-300 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 group"
                onClick={() => navigate(user ? "/quiz" : "/auth")}
              >
                Start Your Free Assessment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-lg h-16 px-10 rounded-full border-2 hover:bg-primary/5 hover:border-primary transition-all duration-300"
                onClick={() => {
                  const element = document.getElementById("domains");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore Careers
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                30 questions
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                30 minutes
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-3 animate-pulse" />
                Instant results
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Cards Section */}
      <section id="domains" className="container py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Explore Career Domains
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover which tech path aligns with your unique skills and interests
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {domains.map((domain, index) => {
            const Icon = domain.icon;
            return (
              <Card
                key={domain.title}
                className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-chart-3/0 group-hover:from-primary/5 group-hover:via-accent/5 group-hover:to-chart-3/5 transition-all duration-500" />

                <CardContent className="relative pt-10 pb-8 px-8">
                  <div className={`w-16 h-16 rounded-2xl ${domain.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className={`h-8 w-8 ${domain.color}`} />
                  </div>

                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {domain.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {domain.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full -z-10" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 md:py-32">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-chart-3/10 border-2 border-primary/20">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <CardContent className="relative py-20 px-8 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
              Ready to Start Your Tech Journey?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of students who've discovered their perfect tech career path with STREAM. Your future in tech starts here.
            </p>
            <Button
              size="lg"
              className="text-xl h-16 px-12 rounded-full shadow-2xl hover:shadow-accent/50 transition-all duration-300 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 group"
              onClick={() => navigate(user ? "/quiz" : "/auth")}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="mt-8 text-sm text-muted-foreground">
              No credit card required • Free forever • Instant results
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}