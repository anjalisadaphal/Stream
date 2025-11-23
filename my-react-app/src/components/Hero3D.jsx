import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero3D({ onGetStarted }) {
    const cardRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        const container = containerRef.current;
        if (!card || !container) return;

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg tilt
            const rotateY = ((x - centerX) / centerX) * 15;

            card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateZ(20px)
      `;
        };

        const handleMouseLeave = () => {
            card.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        translateZ(0px)
      `;
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4"
        >
            {/* Ambient Gradient Orbs */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-chart-3/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />

            {/* Main Content Card */}
            <div
                ref={cardRef}
                className="relative max-w-4xl w-full transition-transform duration-300 ease-out"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Glassmorphism Card */}
                <div className="relative glass-card rounded-3xl p-12 md:p-16 shadow-2xl border border-white/20 backdrop-blur-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.2), inset 0 1px 0 0 rgba(255,255,255,0.1)'
                    }}
                >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                        <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 shimmer" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 text-primary text-sm font-medium animate-fade-in">
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            <span className="gradient-text-primary font-semibold">Smart Career Guidance System</span>
                        </div>

                        {/* Main Heading with 3D Text Effect */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                            <span className="block mb-2">Ready to Start</span>
                            <span className="block gradient-text text-6xl md:text-7xl lg:text-8xl">
                                Your Tech Journey?
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Discover your perfect tech career path with <span className="gradient-text-primary font-semibold">STREAM</span>.
                            <br className="hidden md:block" />
                            AI-powered assessment for Programming, Analytics, or Testing careers.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center">
                            <Button
                                size="lg"
                                onClick={onGetStarted}
                                className="group relative text-lg h-16 px-10 rounded-full overflow-hidden shadow-2xl"
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    boxShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3)'
                                }}
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                <span className="relative z-10 flex items-center gap-2 font-semibold">
                                    Get Started Now
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="text-lg h-16 px-10 rounded-full glass-hover border-2 border-white/20"
                            >
                                Explore Careers
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center justify-center gap-8 pt-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-muted-foreground">30 questions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
                                <span className="text-muted-foreground">30 minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-chart-3 animate-pulse" style={{ animationDelay: '1s' }} />
                                <span className="text-muted-foreground">Instant results</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Glow */}
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-t from-primary/30 to-transparent blur-2xl" />
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full glass border border-primary/30 flex items-center justify-center float"
                    style={{ transform: 'translateZ(50px)' }}>
                    <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full glass border border-accent/30 flex items-center justify-center float"
                    style={{ transform: 'translateZ(50px)', animationDelay: '1s' }}>
                    <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-sm text-muted-foreground">Scroll to explore</span>
                <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
                    <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
                </div>
            </div>
        </section>
    );
}
