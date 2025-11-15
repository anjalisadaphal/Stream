import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Sparkles } from "lucide-react";

export default function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/results");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md px-6">
        <div className="relative">
          <div className="w-24 h-24 mx-auto">
            <Brain className="w-24 h-24 text-primary animate-pulse" />
            <div className="absolute inset-0 w-24 h-24 mx-auto">
              <Sparkles className="w-6 h-6 text-accent absolute top-0 right-0 animate-ping" />
              <Sparkles className="w-6 h-6 text-accent absolute bottom-0 left-0 animate-ping" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">
            Analyzing Your Responses
          </h2>
          <div className="space-y-2 text-muted-foreground">
            <p className="animate-fade-in">Evaluating your skills and aptitudes...</p>
            <p className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
              Matching with career profiles...
            </p>
            <p className="animate-fade-in" style={{ animationDelay: '1s' }}>
              Calibrating your personalized roadmap...
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-bounce" />
            <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}