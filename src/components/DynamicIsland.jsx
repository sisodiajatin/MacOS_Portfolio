import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Play, Pause, SkipBack, SkipForward, Code, GitCommit, Flame, Github, Clock, ExternalLink, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useDynamicIslandStore, { GITHUB_USERNAME, GITHUB_PROFILE_URL } from "#store/dynamicIsland.js";

dayjs.extend(relativeTime);

const DynamicIsland = ({ darkMode }) => {
    const islandRef = useRef(null);
    const contentRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [greeting, setGreeting] = useState("");
    const [showGithub, setShowGithub] = useState(false);

    // Store state
    const { music, github, weather, islandState, notification, clearNotification, setGithubData, setWeatherData } =
        useDynamicIslandStore();

    // Fetch Weather data
    const fetchWeatherData = useCallback(async () => {
        try {
            // Worcester, MA coordinates
            const latitude = 42.2626;
            const longitude = -71.8023;

            // Using Open-Meteo API (free, no API key required)
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=celsius&wind_speed_unit=kmh&timezone=America/New_York`;

            const response = await fetch(weatherUrl);
            const data = await response.json();

            // Map weather codes to conditions and icons
            // isDay parameter: true = day icons (d), false = night icons (n)
            const getWeatherInfo = (code, isDay = true) => {
                const suffix = isDay ? "d" : "n";
                const weatherCodes = {
                    0: { condition: "Clear", icon: `01${suffix}` },
                    1: { condition: "Clear", icon: `01${suffix}` },
                    2: { condition: "Clouds", icon: `02${suffix}` },
                    3: { condition: "Clouds", icon: `03${suffix}` },
                    45: { condition: "Fog", icon: `50${suffix}` },
                    48: { condition: "Fog", icon: `50${suffix}` },
                    51: { condition: "Drizzle", icon: `09${suffix}` },
                    53: { condition: "Drizzle", icon: `09${suffix}` },
                    55: { condition: "Drizzle", icon: `09${suffix}` },
                    61: { condition: "Rain", icon: `10${suffix}` },
                    63: { condition: "Rain", icon: `10${suffix}` },
                    65: { condition: "Rain", icon: `10${suffix}` },
                    71: { condition: "Snow", icon: `13${suffix}` },
                    73: { condition: "Snow", icon: `13${suffix}` },
                    75: { condition: "Snow", icon: `13${suffix}` },
                    77: { condition: "Snow", icon: `13${suffix}` },
                    80: { condition: "Rain", icon: `09${suffix}` },
                    81: { condition: "Rain", icon: `09${suffix}` },
                    82: { condition: "Rain", icon: `09${suffix}` },
                    85: { condition: "Snow", icon: `13${suffix}` },
                    86: { condition: "Snow", icon: `13${suffix}` },
                    95: { condition: "Thunderstorm", icon: `11${suffix}` },
                    96: { condition: "Thunderstorm", icon: `11${suffix}` },
                    99: { condition: "Thunderstorm", icon: `11${suffix}` }
                };
                return weatherCodes[code] || { condition: "Clear", icon: `01${suffix}` };
            };

            // Determine if it's day or night (6 AM to 6 PM is day)
            const currentHour = dayjs().hour();
            const isDay = currentHour >= 6 && currentHour < 18;

            const currentWeather = getWeatherInfo(data.current.weather_code, isDay);

            // Process daily forecast (use day icons for forecasts)
            const dailyForecasts = [];
            for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
                const dayWeather = getWeatherInfo(data.daily.weather_code[i], true);
                dailyForecasts.push({
                    temp: Math.round((data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2),
                    condition: dayWeather.condition,
                    icon: dayWeather.icon,
                    date: dayjs(data.daily.time[i])
                });
            }

            setWeatherData({
                temperature: Math.round(data.current.temperature_2m),
                condition: currentWeather.condition,
                icon: currentWeather.icon,
                location: "Worcester",
                feelsLike: Math.round(data.current.apparent_temperature),
                humidity: data.current.relative_humidity_2m,
                windSpeed: Math.round(data.current.wind_speed_10m),
                forecast: dailyForecasts,
                lastUpdated: dayjs()
            });
        } catch (error) {
            console.error("Failed to fetch weather data:", error);
            // Fallback to realistic Worcester, MA weather data if API fails
            // Worcester average temps: Jan: -3°C, Feb: -2°C, Mar: 2°C, Apr: 8°C, May: 14°C,
            // Jun: 19°C, Jul: 22°C, Aug: 21°C, Sep: 17°C, Oct: 11°C, Nov: 5°C, Dec: 0°C
            const month = dayjs().month(); // 0-11
            const winterTemps = [-3, -2, 2, 8, 14, 19, 22, 21, 17, 11, 5, 0];
            const avgTemp = winterTemps[month];

            // Determine if it's day or night for fallback
            const currentHour = dayjs().hour();
            const isDayFallback = currentHour >= 6 && currentHour < 18;
            const suffix = isDayFallback ? "d" : "n";

            setWeatherData({
                temperature: avgTemp,
                condition: month >= 11 || month <= 2 ? "Snow" : month <= 5 ? "Clouds" : "Clear",
                icon: month >= 11 || month <= 2 ? `13${suffix}` : month <= 5 ? `04${suffix}` : `01${suffix}`,
                location: "Worcester",
                feelsLike: avgTemp - 3,
                humidity: 70,
                windSpeed: 15,
                forecast: [
                    { temp: avgTemp, condition: "Snow", icon: "13d", date: dayjs() },
                    { temp: avgTemp + 1, condition: "Clouds", icon: "04d", date: dayjs().add(1, "day") },
                    { temp: avgTemp - 2, condition: "Snow", icon: "13d", date: dayjs().add(2, "day") },
                    { temp: avgTemp + 2, condition: "Clouds", icon: "04d", date: dayjs().add(3, "day") },
                    { temp: avgTemp, condition: "Clear", icon: "02d", date: dayjs().add(4, "day") },
                ],
                lastUpdated: dayjs()
            });
        }
    }, [setWeatherData]);

    // Fetch GitHub data
    const fetchGithubData = useCallback(async () => {
        try {
            // Fetch user data and events in parallel
            const [userRes, eventsRes] = await Promise.all([
                fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
                fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=30`)
            ]);

            const userData = await userRes.json();
            const eventsData = await eventsRes.json();

            // Calculate stats from events
            const today = dayjs().startOf("day");
            let todayCommits = 0;
            let lastCommitTime = null;
            const recentActivity = [];

            // Process events
            for (const event of eventsData) {
                const eventTime = dayjs(event.created_at);

                if (event.type === "PushEvent") {
                    const commits = event.payload?.commits || [];

                    // Count today's commits
                    if (eventTime.isAfter(today)) {
                        todayCommits += commits.length;
                    }

                    // Get last commit time
                    if (!lastCommitTime && commits.length > 0) {
                        lastCommitTime = eventTime;
                    }

                    // Add to recent activity
                    if (recentActivity.length < 3 && commits.length > 0) {
                        const lastCommit = commits[commits.length - 1];
                        recentActivity.push({
                            type: "commit",
                            message: lastCommit.message?.split("\n")[0] || "Push to repository",
                            time: eventTime.fromNow(),
                            repo: event.repo?.name?.split("/")[1] || ""
                        });
                    }
                }
            }

            // Calculate streak (simplified - counts consecutive days with events)
            const eventDays = new Set();
            eventsData.forEach(event => {
                if (event.type === "PushEvent") {
                    eventDays.add(dayjs(event.created_at).format("YYYY-MM-DD"));
                }
            });

            let streak = 0;
            let checkDate = dayjs();
            while (eventDays.has(checkDate.format("YYYY-MM-DD")) ||
                   (streak === 0 && eventDays.has(checkDate.subtract(1, "day").format("YYYY-MM-DD")))) {
                if (eventDays.has(checkDate.format("YYYY-MM-DD"))) {
                    streak++;
                }
                checkDate = checkDate.subtract(1, "day");
                if (streak > 30) break; // Cap at 30 for display
            }

            setGithubData({
                lastCommitTime: lastCommitTime ? lastCommitTime.fromNow() : "No recent commits",
                commitStreak: streak,
                todayCommits,
                totalRepos: userData.public_repos || 0,
                isTyping: todayCommits > 0, // Show typing if active today
                recentActivity: recentActivity.length > 0 ? recentActivity : [
                    { type: "info", message: "No recent activity", time: "" }
                ]
            });
        } catch (error) {
            console.error("Failed to fetch GitHub data:", error);
            setGithubData({
                lastCommitTime: "unavailable",
                commitStreak: 0,
                todayCommits: 0,
                totalRepos: 0,
                isTyping: false,
                recentActivity: [{ type: "error", message: "Failed to load", time: "" }]
            });
        }
    }, [setGithubData]);

    // Fetch GitHub data on mount and refresh every 5 minutes
    useEffect(() => {
        fetchGithubData();
        const interval = setInterval(fetchGithubData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchGithubData]);

    // Fetch Weather data on mount and refresh every 10 minutes
    useEffect(() => {
        fetchWeatherData();
        const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchWeatherData]);

    // Open GitHub profile
    const openGithubProfile = (e) => {
        e.stopPropagation();
        window.open(GITHUB_PROFILE_URL, "_blank", "noopener,noreferrer");
    };

    // Time and greeting updates
    useEffect(() => {
        const updateTimeAndGreeting = () => {
            const now = dayjs();
            setCurrentTime(now);

            const hour = now.hour();
            if (hour < 12) setGreeting("Good morning");
            else if (hour < 17) setGreeting("Good afternoon");
            else if (hour < 21) setGreeting("Good evening");
            else setGreeting("Working late?");
        };

        updateTimeAndGreeting();
        const interval = setInterval(updateTimeAndGreeting, 60000);
        return () => clearInterval(interval);
    }, []);

    // Cycle between idle, GitHub, and Weather views (when not playing music)
    const [currentView, setCurrentView] = useState(0); // 0: idle, 1: github, 2: weather

    useEffect(() => {
        if (music.isPlaying || isExpanded) return;

        const cycleInterval = setInterval(() => {
            setCurrentView((prev) => (prev + 1) % 3); // Cycle through 0, 1, 2
        }, 5000); // Toggle every 5 seconds

        return () => clearInterval(cycleInterval);
    }, [music.isPlaying, isExpanded]);

    // Update showGithub based on currentView for backward compatibility
    useEffect(() => {
        setShowGithub(currentView === 1);
    }, [currentView]);

    // Notification auto-dismiss
    useEffect(() => {
        if (notification) {
            const timeout = setTimeout(clearNotification, 3000);
            return () => clearTimeout(timeout);
        }
    }, [notification, clearNotification]);

    // Mount animation
    useGSAP(() => {
        if (!islandRef.current) return;

        gsap.fromTo(
            islandRef.current,
            { opacity: 0, scale: 0.8, y: -20 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.5)",
                delay: 0.5, // After boot screen fades
            }
        );
    }, []);

    // Content fade animation on state change
    useGSAP(() => {
        if (!contentRef.current) return;

        gsap.fromTo(
            contentRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.15, ease: "power2.out" }
        );
    }, [islandState, isExpanded, music.isPlaying, showGithub]);

    // Determine current state class
    const getStateClass = () => {
        let classes = ["dynamic-island"];
        if (darkMode) classes.push("dark");
        if (isExpanded) classes.push("expanded");
        if (music.isPlaying) classes.push("music-active");
        if (notification) classes.push("notification");
        if (showGithub && !music.isPlaying) classes.push("github-active");
        if (currentView === 2 && !music.isPlaying) classes.push("weather-active");
        return classes.join(" ");
    };

    // Format time helper
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Render notification view
    const renderNotification = () => (
        <div className="island-notification">
            <div className="island-notif-icon">
                <img src={`/icons/${notification.icon}.png`} alt="" />
            </div>
            <span className="island-notif-text">{notification.title}</span>
        </div>
    );

    // Render expanded music view
    const renderExpandedMusic = () => {
        const currentSeconds = (music.progress / 100) * music.currentTrack.duration;
        return (
            <div className="island-expanded-content">
                <div className="island-music-expanded">
                    <div className="island-album-large">
                        <img
                            src={music.currentTrack.cover}
                            alt={music.currentTrack.album}
                        />
                    </div>
                    <div className="island-music-details">
                        <div className="island-music-title">
                            {music.currentTrack.title}
                        </div>
                        <div className="island-music-artist">
                            {music.currentTrack.artist}
                        </div>
                        <div className="island-progress">
                            <div className="island-progress-bar">
                                <div
                                    className="island-progress-fill"
                                    style={{ width: `${music.progress}%` }}
                                />
                            </div>
                            <div className="island-progress-time">
                                <span>{formatTime(currentSeconds)}</span>
                                <span>{formatTime(music.currentTrack.duration)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="island-controls">
                    <button className="island-control-btn">
                        <SkipBack className="w-4 h-4" />
                    </button>
                    <button className="island-control-btn play">
                        {music.isPlaying ? (
                            <Pause className="w-5 h-5" />
                        ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                        )}
                    </button>
                    <button className="island-control-btn">
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    // Render expanded idle view
    const renderExpandedIdle = () => (
        <div className="island-expanded-content">
            <div className="island-greeting-large">
                <span>{greeting}, explorer</span>
            </div>
            <div className="island-stats">
                <div className="island-stat">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="island-stat-value">{github.commitStreak}</span>
                    <span className="island-stat-label">day streak</span>
                </div>
                <div className="island-stat-divider" />
                <div className="island-stat">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span className="island-stat-value">{github.totalRepos}</span>
                    <span className="island-stat-label">repos</span>
                </div>
            </div>
            <div className="island-time-large">
                {currentTime.format("dddd, MMMM D")}
            </div>
        </div>
    );

    // Render compact music view
    const renderCompactMusic = () => (
        <div className="island-music-compact">
            <div className="island-album-art">
                <img
                    src={music.currentTrack.cover}
                    alt={music.currentTrack.album}
                />
            </div>
            <div className="island-track-info">
                <div className="island-track-title">{music.currentTrack.title}</div>
                <div className="island-track-artist">{music.currentTrack.artist}</div>
            </div>
            <div className="island-visualizer">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`island-bar ${!music.isPlaying ? "paused" : ""}`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                    />
                ))}
            </div>
        </div>
    );

    // Render compact idle view
    const renderCompactIdle = () => (
        <div className="island-idle">
            <span className="island-clock">{currentTime.format("h:mm A")}</span>
            <span className="island-separator" />
            <div className="island-activity">
                <span className="island-dot active" />
                <span className="island-dot" />
                <span className="island-dot" />
            </div>
        </div>
    );

    // Render compact weather view
    const renderCompactWeather = () => (
        <div className="island-weather-compact">
            <div className="island-weather-icon">
                {weather.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <img
                        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                        alt={weather.condition}
                        className="w-8 h-8"
                    />
                )}
            </div>
            <div className="island-weather-info">
                <div className="island-weather-temp">
                    {weather.temperature}°C
                </div>
                <div className="island-weather-location">
                    {weather.location}
                </div>
            </div>
            <span className="island-separator" />
            <div className="island-weather-condition">
                {weather.condition}
            </div>
        </div>
    );

    // Render compact GitHub activity view
    const renderCompactGithub = () => (
        <div className="island-github-compact" onClick={openGithubProfile} title="Open GitHub Profile">
            <div className="island-github-icon">
                {github.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Github className="w-4 h-4" />
                )}
            </div>
            <div className="island-github-info">
                <div className="island-github-commit">
                    <Clock className="w-3 h-3" />
                    <span>{github.lastCommitTime}</span>
                </div>
            </div>
            <span className="island-separator" />
            <div className="island-streak">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="island-streak-count">{github.commitStreak}</span>
            </div>
            {github.isTyping && (
                <div className="island-typing">
                    <span className="island-typing-dot" />
                    <span className="island-typing-dot" />
                    <span className="island-typing-dot" />
                </div>
            )}
        </div>
    );

    // Render expanded weather view
    const renderExpandedWeather = () => (
        <div className="island-expanded-content island-weather-expanded">
            <div className="island-weather-header">
                <div className="island-weather-current">
                    <img
                        src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                        alt={weather.condition}
                        className="island-weather-icon-large"
                    />
                    <div className="island-weather-main">
                        <div className="island-weather-temp-large">{weather.temperature}°</div>
                        <div className="island-weather-condition-text">{weather.condition}</div>
                        <div className="island-weather-location-text">{weather.location}</div>
                    </div>
                </div>
            </div>
            <div className="island-weather-details">
                <div className="island-weather-detail">
                    <span className="island-weather-detail-label">Feels like</span>
                    <span className="island-weather-detail-value">{weather.feelsLike}°C</span>
                </div>
                <div className="island-weather-detail">
                    <span className="island-weather-detail-label">Humidity</span>
                    <span className="island-weather-detail-value">{weather.humidity}%</span>
                </div>
                <div className="island-weather-detail">
                    <span className="island-weather-detail-label">Wind</span>
                    <span className="island-weather-detail-value">{weather.windSpeed} km/h</span>
                </div>
            </div>
            {weather.forecast.length > 0 && (
                <div className="island-weather-forecast">
                    {weather.forecast.slice(0, 5).map((day, index) => (
                        <div key={index} className="island-forecast-day">
                            <span className="island-forecast-date">
                                {index === 0 ? "Today" : day.date.format("ddd")}
                            </span>
                            <img
                                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                                alt={day.condition}
                                className="island-forecast-icon"
                            />
                            <span className="island-forecast-temp">{Math.round(day.temp)}°</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // Render expanded GitHub view
    const renderExpandedGithub = () => (
        <div className="island-expanded-content island-github-expanded" onClick={openGithubProfile}>
            <div className="island-github-header">
                <Github className="w-5 h-5" />
                <span>@{GITHUB_USERNAME}</span>
                {github.isTyping && (
                    <div className="island-coding-indicator">
                        <span className="island-coding-text">active today</span>
                        <div className="island-typing-cursor" />
                    </div>
                )}
                <ExternalLink className="w-3.5 h-3.5 ml-auto text-white/40" />
            </div>
            <div className="island-github-stats">
                <div className="island-github-stat">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <div className="island-github-stat-content">
                        <span className="island-github-stat-value">{github.commitStreak}</span>
                        <span className="island-github-stat-label">day streak</span>
                    </div>
                </div>
                <div className="island-stat-divider" />
                <div className="island-github-stat">
                    <GitCommit className="w-5 h-5 text-emerald-400" />
                    <div className="island-github-stat-content">
                        <span className="island-github-stat-value">{github.todayCommits}</span>
                        <span className="island-github-stat-label">today</span>
                    </div>
                </div>
                <div className="island-stat-divider" />
                <div className="island-github-stat">
                    <Code className="w-5 h-5 text-blue-400" />
                    <div className="island-github-stat-content">
                        <span className="island-github-stat-value">{github.totalRepos}</span>
                        <span className="island-github-stat-label">repos</span>
                    </div>
                </div>
            </div>
            {github.recentActivity.length > 0 && github.recentActivity[0].message && (
                <div className="island-github-recent">
                    <div className="island-github-recent-item">
                        <GitCommit className="w-3 h-3 text-white/50" />
                        <span className="island-github-message">{github.recentActivity[0].message}</span>
                        <span className="island-github-time">{github.recentActivity[0].time}</span>
                    </div>
                </div>
            )}
        </div>
    );

    // Main render content based on state
    const renderContent = () => {
        // Notification takes priority
        if (notification) {
            return renderNotification();
        }

        // Expanded view
        if (isExpanded) {
            if (music.currentTrack && music.isPlaying) {
                return renderExpandedMusic();
            }
            // Show GitHub in expanded when cycling to GitHub
            if (showGithub) {
                return renderExpandedGithub();
            }
            // Show Weather in expanded when cycling to Weather
            if (currentView === 2) {
                return renderExpandedWeather();
            }
            return renderExpandedIdle();
        }

        // Compact music view
        if (music.currentTrack && music.isPlaying) {
            return renderCompactMusic();
        }

        // Cycle between idle, GitHub activity, and weather
        if (showGithub) {
            return renderCompactGithub();
        }

        if (currentView === 2) {
            return renderCompactWeather();
        }

        // Compact idle view
        return renderCompactIdle();
    };

    return (
        <div
            ref={islandRef}
            className={getStateClass()}
            onClick={() => setIsExpanded(!isExpanded)}
            onMouseLeave={() => isExpanded && setIsExpanded(false)}
        >
            <div ref={contentRef} className="island-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default DynamicIsland;
