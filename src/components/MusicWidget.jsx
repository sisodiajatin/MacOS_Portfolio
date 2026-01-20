import { useState, useEffect, useRef, useCallback } from "react";
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
    Loader2,
} from "lucide-react";
import useDynamicIslandStore from "#store/dynamicIsland.js";

// Jamendo API client ID (using public access - no key needed for basic features)
const JAMENDO_CLIENT_ID = "56d30c95";

const MusicWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(75);
    const [playlist, setPlaylist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const widgetRef = useRef(null);
    const audioRef = useRef(null);

    const currentTrack = playlist[currentTrackIndex];

    // Sync state to Dynamic Island store
    const setMusicState = useDynamicIslandStore((s) => s.setMusicState);

    // Fetch tracks from Jamendo API
    const fetchJamendoTracks = useCallback(async () => {
        try {
            setIsLoading(true);
            // Fetch popular tracks from Jamendo
            const response = await fetch(
                `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&order=popularity_total&include=musicinfo&audioformat=mp32`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const tracks = data.results.map((track) => ({
                    id: track.id,
                    title: track.name,
                    artist: track.artist_name,
                    album: track.album_name,
                    duration: track.duration,
                    cover: track.album_image || track.image,
                    audioUrl: track.audio,
                }));
                setPlaylist(tracks);
            }
        } catch (error) {
            console.error("Failed to fetch Jamendo tracks:", error);
            // Fallback to empty playlist
            setPlaylist([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch tracks on mount
    useEffect(() => {
        fetchJamendoTracks();
    }, [fetchJamendoTracks]);

    useEffect(() => {
        if (currentTrack) {
            setMusicState({
                isPlaying,
                currentTrack,
                progress,
            });
        }
    }, [isPlaying, currentTrackIndex, progress, setMusicState, currentTrack]);

    const goToNextTrack = useCallback(() => {
        setProgress(0);
        setCurrentTrackIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
    }, [playlist.length]);

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

    // Audio element setup and event handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        // Load new track
        audio.src = currentTrack.audioUrl;
        audio.load();

        // Auto-play if was playing
        if (isPlaying) {
            audio.play().catch(error => console.error("Playback failed:", error));
        }

        // Update progress
        const handleTimeUpdate = () => {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            setProgress(progressPercent);
        };

        // Track ended - go to next
        const handleEnded = () => {
            goToNextTrack();
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [currentTrack, isPlaying, goToNextTrack]);

    // Handle play/pause state
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch(error => console.error("Playback failed:", error));
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // Handle volume changes
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume / 100;
        }
    }, [volume]);

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

    const handleProgressClick = (e) => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * audio.duration;

        audio.currentTime = newTime;
        setProgress(percentage * 100);
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const currentTime = audioRef.current ? audioRef.current.currentTime : 0;

    // Show loading state
    if (isLoading) {
        return (
            <button className="music-widget-button" disabled>
                <Loader2 className="w-5 h-5 animate-spin" />
            </button>
        );
    }

    // Don't render if no tracks loaded
    if (!playlist.length) {
        return null;
    }

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
                <div
                    className="music-progress-bar"
                    onClick={handleProgressClick}
                    style={{ cursor: 'pointer' }}
                >
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

            {/* Hidden audio element for playback */}
            <audio ref={audioRef} preload="metadata" />
        </div>
    );
};

export default MusicWidget;
