import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Music,
    X,
    Maximize2,
    Minimize2,
} from "lucide-react";

// Sample playlist
const playlist = [
    {
        id: 1,
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        duration: 203,
        cover: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    },
    {
        id: 2,
        title: "Starboy",
        artist: "The Weeknd ft. Daft Punk",
        album: "Starboy",
        duration: 230,
        cover: "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452",
    },
    {
        id: 3,
        title: "Save Your Tears",
        artist: "The Weeknd",
        album: "After Hours",
        duration: 215,
        cover: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    },
    {
        id: 4,
        title: "Levitating",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
        duration: 203,
        cover: "https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946",
    },
];

const MusicWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(75);

    const widgetRef = useRef(null);
    const progressInterval = useRef(null);

    const currentTrack = playlist[currentTrackIndex];

    const goToNextTrack = () => {
        setProgress(0);
        setCurrentTrackIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
    };

    // Animation
    useGSAP(() => {
        if (!widgetRef.current) return;

        if (isOpen) {
            gsap.fromTo(
                widgetRef.current,
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
            );
        }
    }, [isOpen]);

    // Simulate playback progress
    useEffect(() => {
        if (isPlaying) {
            progressInterval.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        goToNextTrack();
                        return 0;
                    }
                    return prev + (100 / currentTrack.duration) * 0.5;
                });
            }, 500);
        } else {
            clearInterval(progressInterval.current);
        }

        return () => clearInterval(progressInterval.current);
    }, [isPlaying, currentTrack.duration]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handlePrev = () => {
        setProgress(0);
        setCurrentTrackIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
    };

    const handleNext = () => {
        goToNextTrack();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const currentTime = (progress / 100) * currentTrack.duration;

    // Floating button when widget is closed
    if (!isOpen) {
        return (
            <button
                className="music-widget-button"
                onClick={() => setIsOpen(true)}
                title="Now Playing"
            >
                <Music className="w-5 h-5" />
                {isPlaying && <span className="music-playing-indicator" />}
            </button>
        );
    }

    return (
        <div
            ref={widgetRef}
            className={`music-widget ${isExpanded ? "expanded" : ""}`}
        >
            {/* Header */}
            <div className="music-widget-header">
                <span className="music-widget-title">Now Playing</span>
                <div className="music-widget-controls">
                    <button onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </button>
                    <button onClick={() => setIsOpen(false)}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Album Art & Info */}
            <div className="music-widget-content">
                <div className="music-album-art">
                    <img src={currentTrack.cover} alt={currentTrack.album} />
                    {isPlaying && <div className="music-playing-overlay" />}
                </div>

                <div className="music-track-info">
                    <h3 className="music-track-title">{currentTrack.title}</h3>
                    <p className="music-track-artist">{currentTrack.artist}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="music-progress">
                <div className="music-progress-bar">
                    <div
                        className="music-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="music-progress-time">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="music-playback-controls">
                <button onClick={handlePrev} className="music-control-btn">
                    <SkipBack className="w-5 h-5" />
                </button>
                <button onClick={handlePlayPause} className="music-control-btn play-btn">
                    {isPlaying ? (
                        <Pause className="w-6 h-6" />
                    ) : (
                        <Play className="w-6 h-6 ml-0.5" />
                    )}
                </button>
                <button onClick={handleNext} className="music-control-btn">
                    <SkipForward className="w-5 h-5" />
                </button>
            </div>

            {/* Volume (expanded only) */}
            {isExpanded && (
                <div className="music-volume">
                    <Volume2 className="w-4 h-4" />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="music-volume-slider"
                    />
                </div>
            )}

            {/* Playlist (expanded only) */}
            {isExpanded && (
                <div className="music-playlist">
                    <h4>Up Next</h4>
                    <ul>
                        {playlist.map((track, index) => (
                            <li
                                key={track.id}
                                className={index === currentTrackIndex ? "active" : ""}
                                onClick={() => {
                                    setCurrentTrackIndex(index);
                                    setProgress(0);
                                }}
                            >
                                <img src={track.cover} alt={track.title} />
                                <div>
                                    <span className="track-name">{track.title}</span>
                                    <span className="track-artist">{track.artist}</span>
                                </div>
                                <span className="track-duration">{formatTime(track.duration)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MusicWidget;
