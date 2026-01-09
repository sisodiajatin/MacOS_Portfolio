import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const BootScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState("logo"); // logo -> loading -> fade

    useGSAP(() => {
        // Apple logo fade in
        gsap.fromTo(
            ".boot-logo",
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
        );

        // Start loading after logo appears
        const startLoading = setTimeout(() => {
            setPhase("loading");
        }, 800);

        return () => clearTimeout(startLoading);
    }, []);

    useEffect(() => {
        if (phase !== "loading") return;

        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setPhase("fade");
                    return 100;
                }
                // Variable speed - faster at start and end
                const increment = prev < 30 ? 8 : prev > 80 ? 6 : 3;
                return Math.min(prev + increment, 100);
            });
        }, 80);

        return () => clearInterval(interval);
    }, [phase]);

    useGSAP(() => {
        if (phase !== "fade") return;

        // Fade out the entire boot screen
        gsap.to(".boot-screen", {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
                onComplete?.();
            },
        });
    }, [phase, onComplete]);

    return (
        <div className="boot-screen">
            {/* Apple-style logo */}
            <div className="boot-logo">
                <svg
                    viewBox="0 0 170 170"
                    className="w-20 h-20 text-white"
                    fill="currentColor"
                >
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375a25.222 25.222 0 0 1-.188-3.07c0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71.12 1.083.17 2.166.17 3.24z" />
                </svg>
            </div>

            {/* Progress bar and percentage */}
            {phase !== "logo" && (
                <div className="boot-loading">
                    <div className="boot-progress-container">
                        <div
                            className="boot-progress-bar"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="boot-percentage">{progress}%</span>
                </div>
            )}
        </div>
    );
};

export default BootScreen;
