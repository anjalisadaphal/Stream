import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    Award,
    Share2,
    Loader2,
    CheckCircle2,
    BarChart3,
    Code2,
    Bug
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";

const fetchPublicAttempt = async (shareId) => {
    const res = await api.get(`/quiz/public/attempts/${shareId}`);
    return res.data;
};

export default function PublicResult() {
    const { shareId } = useParams();
    const navigate = useNavigate();

    const {
        data: attempt,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["publicAttempt", shareId],
        queryFn: () => fetchPublicAttempt(shareId),
        enabled: !!shareId,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !attempt) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <p className="text-destructive text-lg">Result not found or link expired.</p>
                <Button onClick={() => navigate("/")}>Go Home</Button>
            </div>
        );
    }

    const chartData = [
        { name: "Programming", score: attempt.programmer_score, fill: "hsl(var(--chart-1))", icon: Code2 },
        { name: "Analytics", score: attempt.analytics_score, fill: "hsl(var(--chart-2))", icon: BarChart3 },
        { name: "Testing", score: attempt.tester_score, fill: "hsl(var(--chart-3))", icon: Bug },
    ];

    const getDomainIcon = (domain) => {
        switch (domain) {
            case "programmer": return <Code2 className="h-12 w-12 mb-4 text-primary" />;
            case "analytics": return <BarChart3 className="h-12 w-12 mb-4 text-primary" />;
            case "tester": return <Bug className="h-12 w-12 mb-4 text-primary" />;
            default: return <Award className="h-12 w-12 mb-4 text-primary" />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container py-12 max-w-4xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <Badge variant="secondary" className="mb-4">
                        Shared Assessment Result
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight">
                        Career Assessment Profile
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Check out these career assessment results! Take the quiz yourself to discover your own tech career path.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Main Result Card */}
                    <Card className="md:col-span-2 border-primary/20 bg-primary/5">
                        <CardContent className="pt-6 text-center">
                            <div className="flex flex-col items-center">
                                {getDomainIcon(attempt.recommended_domain)}
                                <h2 className="text-2xl font-bold mb-2">Recommended Path</h2>
                                <div className="text-4xl font-extrabold text-primary capitalize mb-4">
                                    {attempt.recommended_domain}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground mb-8">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <span>Based on comprehensive skill analysis</span>
                                </div>
                                <Button size="lg" onClick={() => navigate("/")} className="animate-pulse">
                                    Take the Quiz Yourself
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Score Breakdown */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Score Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tick={{ fill: "hsl(var(--foreground))", fontSize: 14 }}
                                            width={100}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px"
                                            }}
                                        />
                                        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={32}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Performance Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <div className="text-3xl font-bold text-primary">{attempt.total_score}</div>
                                    <div className="text-sm text-muted-foreground">Total Score</div>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <div className="text-3xl font-bold text-primary">
                                        {new Date(attempt.completed_at).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Date Taken</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                                    Domain Proficiency
                                </h4>
                                {chartData.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <item.icon className="h-4 w-4 text-muted-foreground" />
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="font-mono font-bold">{item.score}/50</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
