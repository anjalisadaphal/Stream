import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function ParticlesBackground() {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                background: {
                    color: {
                        value: "#0f172a", // Dark background matching your theme
                    },
                },
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                        onHover: {
                            enable: true,
                            mode: ["grab", "repulse"],
                        },
                        resize: true,
                    },
                    modes: {
                        push: {
                            quantity: 4,
                        },
                        repulse: {
                            distance: 150,
                            duration: 0.4,
                        },
                        grab: {
                            distance: 200,
                            links: {
                                opacity: 0.5,
                            },
                        },
                    },
                },
                particles: {
                    color: {
                        value: ["#22d3ee", "#a855f7"], // Cyan and Purple
                    },
                    links: {
                        color: "#22d3ee",
                        distance: 150,
                        enable: true,
                        opacity: 0.3,
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: true,
                        speed: 1.5,
                        straight: false,
                        attract: {
                            enable: true,
                            rotateX: 600,
                            rotateY: 1200,
                        },
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 80,
                    },
                    opacity: {
                        value: { min: 0.3, max: 0.8 },
                        animation: {
                            enable: true,
                            speed: 1,
                            minimumValue: 0.3,
                        },
                    },
                    shape: {
                        type: ["circle", "triangle", "polygon"],
                        polygon: {
                            sides: 6,
                        },
                    },
                    size: {
                        value: { min: 1, max: 5 },
                        animation: {
                            enable: true,
                            speed: 2,
                            minimumValue: 1,
                        },
                    },
                },
                detectRetina: true,
            }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
            }}
        />
    );
}
