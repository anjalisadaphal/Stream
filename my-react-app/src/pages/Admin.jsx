import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Map,
  Link as LinkIcon,
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
import api from "@/lib/api";
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

const initialNewRoadmapState = {
  domain: "programmer",
  step_number: 1,
  title: "",
  description: ""
};

const initialNewResourceState = {
  domain: "programmer",
  title: "",
  link: "",
  type: "Course"
};

const fetchAdminData = async () => {
  const [statsRes, questionsRes, roadmapsRes, resourcesRes] = await Promise.all([
    api.get('/admin/stats'),
    api.get('/quiz/questions'),
    api.get('/content/roadmaps'),
    api.get('/content/resources')
  ]);

  return {
    stats: statsRes.data,
    questions: questionsRes.data,
    roadmaps: roadmapsRes.data,
    resources: resourcesRes.data
  };
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

  const [isAddRoadmapOpen, setIsAddRoadmapOpen] = useState(false);
  const [newRoadmap, setNewRoadmap] = useState(initialNewRoadmapState);

  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [newResource, setNewResource] = useState(initialNewResourceState);

  // Security: Redirect if not admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  // Data Fetching
  const {
    data,
    isLoading: dataLoading,
    error: dataError,
    refetch,
  } = useQuery({
    queryKey: ["adminData"],
    queryFn: fetchAdminData,
    enabled: !authLoading && !!isAdmin,
    retry: 1,
  });

  const handleFormChange = (setter, field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  // Question Handlers
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

      await api.post('/admin/questions', newQuestion);

      toast({
        title: "Success!",
        description: "New question has been added.",
      });
      setIsAddDialogOpen(false);
      setNewQuestion(initialNewQuestionState);
      refetch();
    } catch (error) {
      toast({
        title: "Error saving question",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      toast({ title: "Question Deleted", description: "Successfully deleted." });
      refetch();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Roadmap Handlers
  const handleSaveRoadmap = async () => {
    setIsSubmitting(true);
    try {
      if (!newRoadmap.title || !newRoadmap.description) {
        throw new Error("Please fill out all fields.");
      }
      await api.post('/content/roadmaps', newRoadmap);
      toast({ title: "Success!", description: "Roadmap step added." });
      setIsAddRoadmapOpen(false);
      setNewRoadmap(initialNewRoadmapState);
      refetch();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoadmap = async (id) => {
    if (!window.confirm("Delete this roadmap step?")) return;
    try {
      await api.delete(`/content/roadmaps/${id}`);
      toast({ title: "Deleted", description: "Roadmap step deleted." });
      refetch();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Resource Handlers
  const handleSaveResource = async () => {
    setIsSubmitting(true);
    try {
      if (!newResource.title || !newResource.link) {
        throw new Error("Please fill out all fields.");
      }
      await api.post('/content/resources', newResource);
      toast({ title: "Success!", description: "Resource added." });
      setIsAddResourceOpen(false);
      setNewResource(initialNewResourceState);
      refetch();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await api.delete(`/content/resources/${id}`);
      toast({ title: "Deleted", description: "Resource deleted." });
      refetch();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const stats = data?.stats || { totalQuestions: 0, totalUsers: 0, assessmentsTaken: 0 };
  const allQuestions = data?.questions || [];
  const allRoadmaps = data?.roadmaps || [];
  const allResources = data?.resources || [];

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain = domainFilter === "all" || q.domain === domainFilter;
      const matchesLevel = levelFilter === "all" || q.difficulty === levelFilter;
      return matchesSearch && matchesDomain && matchesLevel;
    });
  }, [allQuestions, searchQuery, domainFilter, levelFilter]);

  const filteredRoadmaps = useMemo(() => {
    return allRoadmaps.filter((r) => {
      const matchesDomain = domainFilter === "all" || r.domain === domainFilter;
      return matchesDomain;
    });
  }, [allRoadmaps, domainFilter]);

  const filteredResources = useMemo(() => {
    return allResources.filter((r) => {
      const matchesDomain = domainFilter === "all" || r.domain === domainFilter;
      return matchesDomain;
    });
  }, [allResources, domainFilter]);

  if (authLoading || (isAdmin && dataLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 space-y-8 max-w-7xl mx-auto">
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions">
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
                        <DialogDescription>Create a new question for the assessment</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="question-text">Question Text</Label>
                          <Textarea
                            id="question-text"
                            placeholder="Enter the question..."
                            className="min-h-[100px]"
                            value={newQuestion.question_text}
                            onChange={(e) => handleFormChange(setNewQuestion, "question_text", e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Select
                              value={newQuestion.domain}
                              onValueChange={(value) => handleFormChange(setNewQuestion, "domain", value)}
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
                              onValueChange={(value) => handleFormChange(setNewQuestion, "difficulty", value)}
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
                            onChange={(e) => handleFormChange(setNewQuestion, "option_1", e.target.value)}
                          />
                          <Input
                            placeholder="Option 2"
                            value={newQuestion.option_2}
                            onChange={(e) => handleFormChange(setNewQuestion, "option_2", e.target.value)}
                          />
                          <Input
                            placeholder="Option 3"
                            value={newQuestion.option_3}
                            onChange={(e) => handleFormChange(setNewQuestion, "option_3", e.target.value)}
                          />
                          <Input
                            placeholder="Option 4"
                            value={newQuestion.option_4}
                            onChange={(e) => handleFormChange(setNewQuestion, "option_4", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <RadioGroup
                            value={String(newQuestion.correct_answer)}
                            onValueChange={(value) => handleFormChange(setNewQuestion, "correct_answer", Number(value))}
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
          </TabsContent>

          {/* Roadmaps Tab */}
          <TabsContent value="roadmaps">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Manage Roadmaps</CardTitle>
                  <Dialog open={isAddRoadmapOpen} onOpenChange={setIsAddRoadmapOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-accent hover:bg-accent/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Roadmap Step
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Roadmap Step</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Domain</Label>
                          <Select
                            value={newRoadmap.domain}
                            onValueChange={(v) => handleFormChange(setNewRoadmap, "domain", v)}
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
                          <Label>Step Number</Label>
                          <Input
                            type="number"
                            value={newRoadmap.step_number}
                            onChange={(e) => handleFormChange(setNewRoadmap, "step_number", parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={newRoadmap.title}
                            onChange={(e) => handleFormChange(setNewRoadmap, "title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={newRoadmap.description}
                            onChange={(e) => handleFormChange(setNewRoadmap, "description", e.target.value)}
                          />
                        </div>
                        <Button onClick={handleSaveRoadmap} disabled={isSubmitting} className="w-full">
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={domainFilter} onValueChange={(v) => setDomainFilter(v)}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      <SelectItem value="programmer">Programmer</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="tester">Tester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left">Domain</th>
                        <th className="px-4 py-3 text-left">Step</th>
                        <th className="px-4 py-3 text-left">Title</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredRoadmaps.map((r) => (
                        <tr key={r.id}>
                          <td className="px-4 py-3"><Badge variant="outline">{r.domain}</Badge></td>
                          <td className="px-4 py-3">{r.step_number}</td>
                          <td className="px-4 py-3">{r.title}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRoadmap(r.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Manage Resources</CardTitle>
                  <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-accent hover:bg-accent/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Resource
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Resource</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Domain</Label>
                          <Select
                            value={newResource.domain}
                            onValueChange={(v) => handleFormChange(setNewResource, "domain", v)}
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
                          <Label>Title</Label>
                          <Input
                            value={newResource.title}
                            onChange={(e) => handleFormChange(setNewResource, "title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link</Label>
                          <Input
                            value={newResource.link}
                            onChange={(e) => handleFormChange(setNewResource, "link", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={newResource.type}
                            onValueChange={(v) => handleFormChange(setNewResource, "type", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Course">Course</SelectItem>
                              <SelectItem value="Guide">Guide</SelectItem>
                              <SelectItem value="Video">Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleSaveResource} disabled={isSubmitting} className="w-full">
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={domainFilter} onValueChange={(v) => setDomainFilter(v)}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      <SelectItem value="programmer">Programmer</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="tester">Tester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left">Domain</th>
                        <th className="px-4 py-3 text-left">Title</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredResources.map((r) => (
                        <tr key={r.id}>
                          <td className="px-4 py-3"><Badge variant="outline">{r.domain}</Badge></td>
                          <td className="px-4 py-3">
                            <a href={r.link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                              {r.title} <LinkIcon className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="px-4 py-3">{r.type}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(r.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}