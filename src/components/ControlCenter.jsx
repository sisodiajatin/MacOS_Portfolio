import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
    Sun,
    Moon,
    Monitor,
    Wifi,
    WifiOff,
    Bluetooth,
    BluetoothOff,
    Volume2,
    VolumeX,
    Plane,
    BatteryFull,
    Check,
} from "lucide-react";

const ControlCenter = ({ isOpen, onClose, darkMode, onDarkModeChange }) => {
    const [wifi, setWifi] = useState(true);
    const [bluetooth, setBluetooth] = useState(true);
    const [sound, setSound] = useState(true);
    const [airplaneMode, setAirplaneMode] = useState(false);
    const [volume, setVolume] = useState(75);
    const [brightness, setBrightness] = useState(100);

    const containerRef = useRef(null);
    const overlayRef = useRef(null);

    // Animation
    useGSAP(() => {
        if (!containerRef.current || !overlayRef.current) return;

        if (isOpen) {
            gsap.fromTo(
                overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.2 }
            );
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, scale: 0.95, y: -10 },
                { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power2.out" }
            );
        }
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const handleAirplaneToggle = () => {
        setAirplaneMode(!airplaneMode);
        if (!airplaneMode) {
            setWifi(false);
            setBluetooth(false);
        }
    };

    const themeOptions = [
        { id: "light", label: "Light", icon: Sun, value: false },
        { id: "dark", label: "Dark", icon: Moon, value: true },
        { id: "system", label: "System", icon: Monitor, value: null },
    ];

    const currentTheme = darkMode === true ? "dark" : darkMode === false ? "light" : "system";

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                ref={overlayRef}
                className="control-center-overlay"
                onClick={onClose}
            />

            {/* Dropdown */}
            <div ref={containerRef} className="control-center">
                {/* Theme Section */}
                <div className="control-section">
                    <h3 className="control-section-title">Appearance</h3>
                    <div className="theme-options">
                        {themeOptions.map(({ id, label, icon: Icon, value }) => (
                            <button
                                key={id}
                                className={`theme-option ${currentTheme === id ? "active" : ""}`}
                                onClick={() => onDarkModeChange(value)}
                            >
                                <div className="theme-option-icon">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span>{label}</span>
                                {currentTheme === id && (
                                    <Check className="w-4 h-4 text-blue-500 absolute right-2" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Controls */}
                <div className="control-section">
                    <h3 className="control-section-title">Controls</h3>
                    <div className="quick-controls">
                        {/* WiFi */}
                        <button
                            className={`quick-control ${wifi && !airplaneMode ? "active" : ""}`}
                            onClick={() => !airplaneMode && setWifi(!wifi)}
                            disabled={airplaneMode}
                        >
                            {wifi && !airplaneMode ? (
                                <Wifi className="w-5 h-5" />
                            ) : (
                                <WifiOff className="w-5 h-5" />
                            )}
                            <span>Wi-Fi</span>
                        </button>

                        {/* Bluetooth */}
                        <button
                            className={`quick-control ${bluetooth && !airplaneMode ? "active" : ""}`}
                            onClick={() => !airplaneMode && setBluetooth(!bluetooth)}
                            disabled={airplaneMode}
                        >
                            {bluetooth && !airplaneMode ? (
                                <Bluetooth className="w-5 h-5" />
                            ) : (
                                <BluetoothOff className="w-5 h-5" />
                            )}
                            <span>Bluetooth</span>
                        </button>

                        {/* Airplane Mode */}
                        <button
                            className={`quick-control ${airplaneMode ? "active" : ""}`}
                            onClick={handleAirplaneToggle}
                        >
                            <Plane className="w-5 h-5" />
                            <span>Airplane</span>
                        </button>

                        {/* Sound */}
                        <button
                            className={`quick-control ${sound ? "active" : ""}`}
                            onClick={() => setSound(!sound)}
                        >
                            {sound ? (
                                <Volume2 className="w-5 h-5" />
                            ) : (
                                <VolumeX className="w-5 h-5" />
                            )}
                            <span>Sound</span>
                        </button>
                    </div>
                </div>

                {/* Sliders */}
                <div className="control-section">
                    <div className="control-slider">
                        <div className="slider-header">
                            <Sun className="w-4 h-4" />
                            <span>Display</span>
                        </div>
                        <input
                            type="range"
                            min="20"
                            max="100"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="slider"
                        />
                    </div>

                    <div className="control-slider">
                        <div className="slider-header">
                            <Volume2 className="w-4 h-4" />
                            <span>Sound</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sound ? volume : 0}
                            onChange={(e) => {
                                setVolume(Number(e.target.value));
                                setSound(Number(e.target.value) > 0);
                            }}
                            className="slider"
                        />
                    </div>
                </div>

                {/* Battery Status */}
                <div className="control-section battery-section">
                    <BatteryFull className="w-5 h-5 text-green-500" />
                    <span>Battery</span>
                    <span className="battery-percent">100%</span>
                </div>
            </div>
        </>
    );
};

export default ControlCenter;
