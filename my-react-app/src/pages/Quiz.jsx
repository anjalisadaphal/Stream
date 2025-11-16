import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Flag, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateFallbackQuestions } from "@/services/aiService";

export default function Quiz() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        toast({
          title: "Loading quiz...",
          description: "Preparing your assessment.",
        });

        // Get questions from database
        // Verify session before querying
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Session expired. Please sign in again.");
        }

        const { data: dbQuestions, error: dbError } = await supabase
          .from("questions")
          .select("*")
          .limit(30);

        if (dbError) {
          if (dbError.code === 'PGRST301' || dbError.message?.includes('JWT')) {
            throw new Error("Session expired. Please sign in again.");
          }
          throw dbError;
        }

        if (dbQuestions && dbQuestions.length >= 30) {
          // Shuffle database questions for variety
          const shuffled = [...dbQuestions].sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, 30));
          toast({
            title: "Quiz loaded!",
            description: "Starting your assessment.",
          });
        } else {
          // Last resort: Use fallback questions
          const fallbackQuestions = generateFallbackQuestions();
          if (fallbackQuestions.length > 0) {
            setQuestions(fallbackQuestions);
            toast({
              title: "Using sample questions",
              description: "Limited questions available. Contact admin to add more.",
              variant: "default",
            });
          } else {
            throw new Error("No questions available. Please contact the administrator.");
          }
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        toast({
          title: "Error loading questions",
          description: error.message || "Please try again or contact support.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadQuestions();
    }
  }, [user, toast]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !user || submitRef.current) return;
    submitRef.current = true;
    setIsSubmitting(true);

    try {
      const scores = { programmer: 0, analytics: 0, tester: 0 };
      const responses = [];

      // First, ensure all questions have database IDs
      // If questions were generated dynamically, save them to DB first
      const questionsWithIds = [];
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.id) {
          // Question doesn't have an ID, check if it exists in DB first
          const { data: existingQuestion } = await supabase
            .from("questions")
            .select("id")
            .eq("question_text", question.question_text)
            .single();

          if (existingQuestion?.id) {
            // Question already exists, use its ID
            questionsWithIds.push({ ...question, id: existingQuestion.id });
          } else {
            // Question doesn't exist, insert it
            const { data: savedQuestion, error: saveError } = await supabase
              .from("questions")
              .insert({
                question_text: question.question_text,
                option_1: question.option_1,
                option_2: question.option_2,
                option_3: question.option_3,
                option_4: question.option_4,
                correct_answer: question.correct_answer,
                domain: question.domain,
                difficulty: question.difficulty,
              })
              .select()
              .single();

            if (saveError) {
              console.error("Error saving question to database:", saveError);
              // Skip this question if we can't save it
              continue;
            }
            questionsWithIds.push(savedQuestion);
          }
        } else {
          questionsWithIds.push(question);
        }
      }

      // Now calculate scores and responses with valid question IDs
      questionsWithIds.forEach((question, index) => {
        const originalIndex = questions.findIndex(q => 
          q.question_text === question.question_text
        );
        const selectedAnswer = answers[originalIndex];
        if (selectedAnswer !== undefined && question.id) {
          const isCorrect = selectedAnswer + 1 === question.correct_answer;
          if (isCorrect) {
            scores[question.domain]++;
          }
          responses.push({
            question_id: question.id,
            selected_answer: selectedAnswer + 1,
            is_correct: isCorrect,
          });
        }
      });

      const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
      const recommendedDomain =
        scores.programmer >= scores.analytics && scores.programmer >= scores.tester
          ? "programmer"
          : scores.analytics >= scores.tester
          ? "analytics"
          : "tester";

      // Verify session before submitting
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session expired. Please sign in again and retake the quiz.");
      }

      const { data: attemptData, error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: user.id,
          recommended_domain: recommendedDomain,
          programmer_score: scores.programmer,
          analytics_score: scores.analytics,
          tester_score: scores.tester,
          total_score: totalScore,
        })
        .select()
        .single();

      if (attemptError) {
        if (attemptError.code === 'PGRST301' || attemptError.message?.includes('JWT')) {
          throw new Error("Session expired. Please sign in again.");
        }
        throw attemptError;
      }

      const responsesWithAttemptId = responses.map((r) => ({
        ...r,
        attempt_id: attemptData.id,
      }));

      const { error: responsesError } = await supabase
        .from("quiz_responses")
        .insert(responsesWithAttemptId);

      if (responsesError) throw responsesError;

      navigate("/results", { state: { attemptId: attemptData.id } });
    } catch (error) {
      toast({
        title: "Error submitting quiz",
        description: error.message,
        variant: "destructive",
      });
      submitRef.current = false;
      setIsSubmitting(false);
    }
  }, [user, questions, answers, navigate, toast, isSubmitting]);

  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use a ref or call handleSubmit directly
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  // Separate effect to handle auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitting && questions.length > 0 && user && !submitRef.current) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitting, questions.length, user, handleSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getQuestionStatus = (index) => {
    if (answers[index] !== undefined) return "answered";
    if (markedForReview.has(index)) return "marked";
    return "not-answered";
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleMarkForReview = () => {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentQuestion)) {
      newMarked.delete(currentQuestion);
    } else {
      newMarked.add(currentQuestion);
    }
    setMarkedForReview(newMarked);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">No Questions Available</h1>
          <p className="text-muted-foreground mb-8">Please contact the administrator.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border bg-card sticky top-16 z-40">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Clock className={`h-4 w-4 ${timeLeft < 300 ? "text-destructive" : "text-muted-foreground"}`} />
              <span className={`font-mono font-semibold ${timeLeft < 300 ? "text-destructive" : ""}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Question <span className="font-semibold text-foreground">{currentQuestion + 1}</span> of {questions.length}
            </div>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="w-48 h-2" />
        </div>
      </div>

      <div className="container py-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-8 pb-6 px-6 md:px-8">
                <h2 className="text-xl font-semibold mb-6 leading-relaxed">
                  {currentQ.question_text}
                </h2>

                <div className="space-y-3">
                  {[currentQ.option_1, currentQ.option_2, currentQ.option_3, currentQ.option_4].map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50 ${
                        answers[currentQuestion] === index
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            answers[currentQuestion] === index
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {answers[currentQuestion] === index && (
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <span className="text-base">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleMarkForReview}
                  className={markedForReview.has(currentQuestion) ? "border-purple-500 text-purple-500" : ""}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  {markedForReview.has(currentQuestion) ? "Marked" : "Mark for Review"}
                </Button>

                {isLastQuestion ? (
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Test
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-32 h-fit">
            <Card>
              <CardContent className="pt-6 pb-4 px-4">
                <h3 className="font-semibold mb-4">Test Status</h3>

                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span className="text-muted-foreground">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-muted-foreground">Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <span className="text-muted-foreground">Not Answered</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all hover:border-primary/50 ${
                          currentQuestion === index
                            ? "border-primary bg-primary text-primary-foreground"
                            : status === "answered"
                            ? "border-accent/50 bg-accent text-accent-foreground"
                            : status === "marked"
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-700"
                            : "border-border bg-background"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}