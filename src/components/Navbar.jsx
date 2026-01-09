import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { navLinks } from "#constants";
import useWindowStore from "#store/window.js";
import { Sun, Moon, Wifi, Search, SlidersHorizontal } from "lucide-react";
import ControlCenter from "#components/ControlCenter.jsx";

const Navbar = ({ onSpotlightOpen, darkMode, onDarkModeChange }) => {
    const { openWindow } = useWindowStore();
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [controlCenterOpen, setControlCenterOpen] = useState(false);

    // Update time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <nav>
                <div>
                    <img src="/images/logo.svg" alt="logo" />
                    <p className="font-bold">Jatin's Portfolio</p>

                    <ul>
                        {navLinks.map(({ id, name, type }) => (
                            <li key={id} onClick={() => openWindow(type)}>
                                <p>{name}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <ul>
                        <li 
                            className="cursor-pointer hover:bg-white/20 p-1 rounded transition-colors"
                            title="Wi-Fi"
                        >
                            <Wifi className="w-4 h-4 opacity-80" />
                        </li>
                        <li 
                            onClick={onSpotlightOpen} 
                            className="cursor-pointer hover:bg-white/20 p-1 rounded transition-colors"
                            title="Spotlight Search (Ctrl+K)"
                        >
                            <Search className="w-4 h-4 opacity-80" />
                        </li>
                        <li 
                            onClick={() => setControlCenterOpen(!controlCenterOpen)}
                            className="cursor-pointer hover:bg-white/20 p-1 rounded transition-colors"
                            title="Control Center"
                        >
                            <SlidersHorizontal className="w-4 h-4 opacity-80" />
                        </li>
                        <li 
                            onClick={() => onDarkModeChange(!darkMode)} 
                            className="cursor-pointer hover:bg-white/20 p-1 rounded transition-colors"
                            title="Toggle Dark Mode (Ctrl+D)"
                        >
                            {darkMode ? (
                                <Sun className="w-4 h-4 opacity-80 text-yellow-400" />
                            ) : (
                                <Moon className="w-4 h-4 opacity-80" />
                            )}
                        </li>
                    </ul>
                    <time 
                        className="cursor-pointer hover:bg-white/20 px-2 py-0.5 rounded transition-colors"
                        onClick={() => setControlCenterOpen(!controlCenterOpen)}
                        title="Control Center"
                    >
                        {currentTime.format("ddd MMM D h:mm A")}
                    </time>
                </div>
            </nav>

            <ControlCenter 
                isOpen={controlCenterOpen}
                onClose={() => setControlCenterOpen(false)}
                darkMode={darkMode}
                onDarkModeChange={onDarkModeChange}
            />
        </>
    );
};

export default Navbar;
