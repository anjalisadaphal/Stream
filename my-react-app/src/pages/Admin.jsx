import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  BookOpen,
  Users,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const initialNewQuestionState = {
  question_text: "",
  option_1: "",
  option_2: "",
  option_3: "",
  option_4: "",
  correct_answer: 1,
  domain: "programmer",
  difficulty: "medium",
};

// [c-m] This function will be called by useQuery
const fetchAdminData = async () => {
  // Verify session is still valid before fetching
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Session expired. Please sign in again.");
  }

  const [questionsCount, usersCount, attemptsCount, questionsData] = await Promise.all([
    supabase.from("questions").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("quiz_attempts").select("id", { count: "exact", head: true }),
    supabase.from("questions").select("*").order("created_at", { ascending: false }),
  ]);

  // Handle auth errors
  if (questionsData.error) {
    if (questionsData.error.code === 'PGRST301' || questionsData.error.message?.includes('JWT')) {
      throw new Error("Session expired. Please sign in again.");
    }
    throw questionsData.error;
  }

  const stats = {
    totalQuestions: questionsCount.count ?? 0,
    totalUsers: usersCount.count ?? 0,
    assessmentsTaken: attemptsCount.count ?? 0,
  };
  const questions = questionsData.data || [];

  return { stats, questions };
};

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState(initialNewQuestionState);

  // [c-m] 1. Security: Redirect if not admin
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish
    if (!user || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  // [c-m] 2. Data Fetching: useQuery handles all data and loading
  const {
    data,
    isLoading: dataLoading,
    error: dataError,
    refetch, // We'll use this to refresh data after changes
  } = useQuery({
    queryKey: ["adminData"],
    queryFn: fetchAdminData,
    enabled: !authLoading && !!isAdmin, // IMPORTANT: Only run this query if auth is loaded and user is an admin
    retry: 1,
  });

  // [c-m] Handlers are now simpler, just call refetch() on success
  const handleFormChange = (field, value) => {
    setNewQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveQuestion = async () => {
    setIsSubmitting(true);
    try {
      if (
        !newQuestion.question_text ||
        !newQuestion.option_1 ||
        !newQuestion.option_2 ||
        !newQuestion.option_3 ||
        !newQuestion.option_4
      ) {
        throw new Error("Please fill out all fields.");
      }
      const { error } = await supabase.from("questions").insert(newQuestion);
      if (error) throw error;
      toast({
        title: "Success!",
        description: "New question has been added.",
      });
      setIsAddDialogOpen(false);
      setNewQuestion(initialNewQuestionState);
      refetch(); // [c-m] Refresh the data
    } catch (error) {
      toast({
        title: "Error saving question",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Question Deleted",
        description: "The question has been successfully deleted.",
      });
      refetch(); // [c-m] Refresh the data
    } catch (error) {
      toast({
        title: "Error deleting question",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // [c-m] Get stats and questions from useQuery's data
  const stats = data?.stats || { totalQuestions: 0, totalUsers: 0, assessmentsTaken: 0 };
  const allQuestions = data?.questions || [];

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain = domainFilter === "all" || q.domain === domainFilter;
      const matchesLevel = levelFilter === "all" || q.difficulty === levelFilter;
      return matchesSearch && matchesDomain && matchesLevel;
    });
  }, [allQuestions, searchQuery, domainFilter, levelFilter]);

  // [c-m] 3. Simplified Loading: Show one loader if auth is checking OR data is fetching
  // Handle session expiration errors
  useEffect(() => {
    if (dataError) {
      if (dataError.message?.includes("Session expired")) {
        toast({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    }
  }, [dataError, navigate, toast]);

  if (authLoading || (isAdmin && dataLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // [c-m] 4. If user is not admin, they are being redirected, so we render nothing.
  if (!isAdmin) {
    return null;
  }

  // [c-m] 5. If we get here, user is Admin and data is loaded. Render the page.
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">Manage quiz questions and content</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                  <p className="text-3xl font-bold">{stats.totalQuestions}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assessments Taken</p>
                  <p className="text-3xl font-bold">{stats.assessmentsTaken}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question Management</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>
                      Create a new question for the assessment
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="question-text">Question Text</Label>
                      <Textarea
                        id="question-text"
                        placeholder="Enter the question..."
                        className="min-h-[100px]"
                        value={newQuestion.question_text}
                        onChange={(e) => handleFormChange("question_text", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Select
                          value={newQuestion.domain}
                          onValueChange={(value) => handleFormChange("domain", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="programmer">Programmer</SelectItem>
                            <SelectItem value="analytics">Analytics</SelectItem>
                            <SelectItem value="tester">Tester</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="level">Difficulty Level</Label>
                        <Select
                          value={newQuestion.difficulty}
                          onValueChange={(value) => handleFormChange("difficulty", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      <Input
                        placeholder="Option 1"
                        value={newQuestion.option_1}
                        onChange={(e) => handleFormChange("option_1", e.target.value)}
                      />
                      <Input
                        placeholder="Option 2"
                        value={newQuestion.option_2}
                        onChange={(e) => handleFormChange("option_2", e.target.value)}
                      />
                      <Input
                        placeholder="Option 3"
                        value={newQuestion.option_3}
                        onChange={(e) => handleFormChange("option_3", e.target.value)}
                      />
                      <Input
                        placeholder="Option 4"
                        value={newQuestion.option_4}
                        onChange={(e) => handleFormChange("option_4", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <RadioGroup
                        value={String(newQuestion.correct_answer)}
                        onValueChange={(value) =>
                          handleFormChange("correct_answer", Number(value))
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="opt1" />
                          <Label htmlFor="opt1">Option 1</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="opt2" />
                          <Label htmlFor="opt2">Option 2</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id="opt3" />
                          <Label htmlFor="opt3">Option 3</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4" id="opt4" />
                          <Label htmlFor="opt4">Option 4</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        className="flex-1 bg-accent hover:bg-accent/90"
                        onClick={handleSaveQuestion}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Question
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Select value={domainFilter} onValueChange={(v) => setDomainFilter(v)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="programmer">Programmer</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="tester">Tester</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Questions Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Question</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Domain</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Level</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredQuestions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center p-8 text-muted-foreground">
                          No questions found.
                        </td>
                      </tr>
                    ) : (
                      filteredQuestions.map((question) => (
                        <tr key={question.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="max-w-md truncate">{question.question_text}</div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="outline">{question.domain}</Badge>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant={
                                question.difficulty === "easy"
                                  ? "default"
                                  : question.difficulty === "medium"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {question.difficulty}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="sm" disabled>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}