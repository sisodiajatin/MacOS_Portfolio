import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

const CursorPet = () => {
    const petRef = useRef(null);
    const [petPosition, setPetPosition] = useState({ x: 32, y: 32 });
    const [cursorPosition, setCursorPosition] = useState({ x: 32, y: 32 });
    const [spritePos, setSpritePos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastUpdateTime = useRef(0);
    const animationFrameId = useRef(null);
    const frameCount = useRef(0);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Track cursor position
    useEffect(() => {
        if (prefersReducedMotion) return;

        const handleMouseMove = (e) => {
            setCursorPosition({ x: e.clientX, y: e.clientY });
        };

        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                setCursorPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("touchmove", handleTouchMove);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("touchmove", handleTouchMove);
        };
    }, [prefersReducedMotion]);

    // Initialize Draggable with proper position handling
    useEffect(() => {
        if (prefersReducedMotion || !petRef.current) return;

        const handleDragMove = (e) => {
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const y = e.clientY || (e.touches && e.touches[0].clientY);

            if (x !== undefined && y !== undefined) {
                setPetPosition({ x, y });
            }
        };

        const handleDragEnd = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
        };

        const handleDragStart = (e) => {
            e.preventDefault();
            setIsDragging(true);

            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchmove', handleDragMove);
            document.addEventListener('touchend', handleDragEnd);
        };

        const petElement = petRef.current;
        petElement.addEventListener('mousedown', handleDragStart);
        petElement.addEventListener('touchstart', handleDragStart);

        return () => {
            if (petElement) {
                petElement.removeEventListener('mousedown', handleDragStart);
                petElement.removeEventListener('touchstart', handleDragStart);
            }
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
        };
    }, [prefersReducedMotion]);

    // Animation loop for pet movement and sprite updates
    useEffect(() => {
        if (prefersReducedMotion) return;

        const animate = (timestamp) => {
            // Skip animation if dragging
            if (isDragging) {
                animationFrameId.current = requestAnimationFrame(animate);
                return;
            }

            // Throttle to ~10 FPS (100ms intervals)
            if (timestamp - lastUpdateTime.current > 100) {
                lastUpdateTime.current = timestamp;

                // Calculate distance to cursor
                const diffX = cursorPosition.x - petPosition.x;
                const diffY = cursorPosition.y - petPosition.y;
                const distance = Math.sqrt(diffX * diffX + diffY * diffY);

                // If within 48px, idle
                if (distance > 48) {
                    // Calculate velocity vector
                    const speed = 10;
                    const velocityX = (diffX / distance) * speed;
                    const velocityY = (diffY / distance) * speed;

                    // Update position
                    let newX = petPosition.x + velocityX;
                    let newY = petPosition.y + velocityY;

                    // Clamp to viewport bounds
                    newX = Math.max(16, Math.min(window.innerWidth - 48, newX));
                    newY = Math.max(16, Math.min(window.innerHeight - 48, newY));

                    setPetPosition({ x: newX, y: newY });

                    // Calculate sprite based on direction
                    // Sprite positions from oneko.js (grid coords * 32px)
                    const frame = Math.floor(frameCount.current / 2) % 2; // Normal frame change

                    // Sprite mappings: [x_grid, y_grid] -> pixel offsets
                    const spriteFrames = {
                        N: [[-1, -2], [-1, -3]],
                        NE: [[0, -2], [0, -3]],
                        E: [[-3, 0], [-3, -1]],
                        SE: [[-5, -1], [-5, -2]],
                        S: [[-6, -3], [-7, -2]],
                        SW: [[-5, -3], [-6, -1]],
                        W: [[-4, -2], [-4, -3]],
                        NW: [[-1, 0], [-1, -1]]
                    };

                    // Determine direction based on velocity
                    let direction = "";
                    const angle = Math.atan2(diffY, diffX);
                    const deg = angle * (180 / Math.PI);

                    // 8-directional movement based on angle
                    if (deg >= -22.5 && deg < 22.5) direction = "E";
                    else if (deg >= 22.5 && deg < 67.5) direction = "SE";
                    else if (deg >= 67.5 && deg < 112.5) direction = "S";
                    else if (deg >= 112.5 && deg < 157.5) direction = "SW";
                    else if (deg >= 157.5 || deg < -157.5) direction = "W";
                    else if (deg >= -157.5 && deg < -112.5) direction = "NW";
                    else if (deg >= -112.5 && deg < -67.5) direction = "N";
                    else if (deg >= -67.5 && deg < -22.5) direction = "NE";

                    // Get sprite coordinates and convert to pixel offsets
                    const [gridX, gridY] = spriteFrames[direction][frame];
                    const spriteX = gridX * 32;
                    const spriteY = gridY * 32;

                    setSpritePos({ x: spriteX, y: spriteY });
                    frameCount.current++;
                } else {
                    // Idle position - sprite at grid position [-3, -3]
                    setSpritePos({ x: -3 * 32, y: -3 * 32 });
                }
            }

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [cursorPosition, petPosition, prefersReducedMotion, isDragging]);

    // Smooth position updates with GSAP (only when not dragging)
    useGSAP(() => {
        if (!petRef.current || prefersReducedMotion || isDragging) return;

        gsap.to(petRef.current, {
            left: petPosition.x,
            top: petPosition.y,
            duration: 0.1,
            ease: "power1.out",
        });
    }, [petPosition, isDragging]);

    // Handle window resize
    useEffect(() => {
        if (prefersReducedMotion) return;

        const handleResize = () => {
            setPetPosition((prev) => ({
                x: Math.max(16, Math.min(window.innerWidth - 48, prev.x)),
                y: Math.max(16, Math.min(window.innerHeight - 48, prev.y)),
            }));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [prefersReducedMotion]);

    if (prefersReducedMotion) return null;

    return (
        <div
            ref={petRef}
            className="cursor-pet"
            style={{
                position: "fixed",
                left: `${petPosition.x}px`,
                top: `${petPosition.y}px`,
                width: "32px",
                height: "32px",
                backgroundImage: "url('/sprites/oneko.gif')",
                backgroundPosition: `${spritePos.x}px ${spritePos.y}px`,
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
                cursor: isDragging ? "grabbing" : "grab",
                zIndex: 9999,
                transform: "translate(-50%, -50%)",
            }}
        />
    );
};

export default CursorPet;
