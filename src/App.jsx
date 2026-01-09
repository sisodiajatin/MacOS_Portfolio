import { useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

import { Navbar, Welcome, Dock, Home, BootScreen, Spotlight, ContextMenu, MusicWidget } from "#components";
import { Resume, Safari, Terminal, Finder, Text, Image, Contact, Photos, CodeEditor } from "#windows";
import useWindowStore from "#store/window.js";

gsap.registerPlugin(Draggable);

const App = () => {
    const [isBooting, setIsBooting] = useState(true);
    const [spotlightOpen, setSpotlightOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0 });
    const { windows, closeWindow } = useWindowStore();

    // Get the topmost open window
    const getTopmostWindow = useCallback(() => {
        let topWindow = null;
        let maxZ = 0;
        Object.entries(windows).forEach(([key, win]) => {
            if (win.isOpen && win.zIndex > maxZ) {
                maxZ = win.zIndex;
                topWindow = key;
            }
        });
        return topWindow;
    }, [windows]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd/Ctrl + K for Spotlight
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSpotlightOpen((prev) => !prev);
                return;
            }

            // Escape to close spotlight or topmost window
            if (e.key === "Escape") {
                if (spotlightOpen) {
                    setSpotlightOpen(false);
                    return;
                }
                const topWindow = getTopmostWindow();
                if (topWindow) {
                    closeWindow(topWindow);
                }
                return;
            }

            // Cmd/Ctrl + W to close topmost window
            if ((e.metaKey || e.ctrlKey) && e.key === "w") {
                e.preventDefault();
                const topWindow = getTopmostWindow();
                if (topWindow) {
                    closeWindow(topWindow);
                }
            }

            // Cmd/Ctrl + D for dark mode toggle
            if ((e.metaKey || e.ctrlKey) && e.key === "d") {
                e.preventDefault();
                setDarkMode((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [spotlightOpen, getTopmostWindow, closeWindow]);

    const handleBootComplete = () => {
        setIsBooting(false);
    };

    // Handle right-click context menu
    const handleContextMenu = (e) => {
        // Only show on main/desktop area, not on windows
        if (e.target.closest("section") && !e.target.closest("#home") && !e.target.closest("#welcome")) {
            return;
        }
        e.preventDefault();
        setContextMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
        });
    };

    return (
        <>
            {isBooting && <BootScreen onComplete={handleBootComplete} />}
            
            <main 
                className={darkMode ? "dark-mode" : ""}
                onContextMenu={handleContextMenu}
            >
                <Navbar 
                    onSpotlightOpen={() => setSpotlightOpen(true)} 
                    darkMode={darkMode}
                    onDarkModeChange={setDarkMode}
                />
                <Welcome />
                <Dock />

                <Safari />
                <Terminal />
                <Resume />
                <Finder />
                <Text />
                <Image />
                <Contact />
                <Photos />
                <CodeEditor />

                <Home />

                <Spotlight 
                    isOpen={spotlightOpen} 
                    onClose={() => setSpotlightOpen(false)} 
                />

                <ContextMenu
                    isOpen={contextMenu.isOpen}
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
                />

                <MusicWidget />
            </main>
        </>
    );
};

export default App;
