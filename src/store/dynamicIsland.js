import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// GitHub username - change this to update the profile
export const GITHUB_USERNAME = "sisodiajatin";
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

const useDynamicIslandStore = create(
    immer((set) => ({
        // Music state (synced from MusicWidget)
        music: {
            isPlaying: false,
            currentTrack: null,
            progress: 0,
        },

        // GitHub activity state (fetched from API)
        github: {
            username: GITHUB_USERNAME,
            lastCommitTime: "loading...",
            commitStreak: 0,
            todayCommits: 0,
            totalRepos: 0,
            isTyping: false,
            isLoading: true,
            recentActivity: [],
        },

        // Weather state (fetched from API)
        weather: {
            temperature: null,
            condition: "loading",
            icon: "01d",
            location: "Locating...",
            feelsLike: null,
            humidity: null,
            windSpeed: null,
            isLoading: true,
            forecast: [], // 5-day forecast
            lastUpdated: null,
        },

        // Island UI state
        islandState: "idle", // "idle" | "music" | "notification" | "github" | "weather"

        // Notification queue
        notification: null, // { type: "window", title: "Finder opened", icon: "finder" }

        // Actions
        setMusicState: (musicData) =>
            set((state) => {
                state.music = { ...state.music, ...musicData };
                // Auto-switch to music state when playing
                if (musicData.isPlaying && state.islandState === "idle") {
                    state.islandState = "music";
                } else if (!musicData.isPlaying && state.islandState === "music") {
                    state.islandState = "idle";
                }
            }),

        setGithubData: (githubData) =>
            set((state) => {
                state.github = { ...state.github, ...githubData, isLoading: false };
            }),

        setGithubTyping: (isTyping) =>
            set((state) => {
                state.github.isTyping = isTyping;
            }),

        showNotification: (notification) =>
            set((state) => {
                state.notification = notification;
                state.islandState = "notification";
            }),

        clearNotification: () =>
            set((state) => {
                state.notification = null;
                state.islandState = state.music.isPlaying ? "music" : "idle";
            }),

        setWeatherData: (weatherData) =>
            set((state) => {
                state.weather = { ...state.weather, ...weatherData, isLoading: false };
            }),
    }))
);

export default useDynamicIslandStore;
