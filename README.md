# 🍎 macOS-Style Portfolio

A stunning, interactive portfolio website that replicates the macOS Big Sur experience in your browser. Features a dynamic island, music player, live wallpaper, and more!

![Portfolio Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🎵 **Music Player** - Real music playback with Jamendo API integration
- 🏝️ **Dynamic Island** - Interactive notification center with GitHub stats, weather, and time
- 🌈 **Live Wallpaper** - Animated mesh gradient background
- 🐱 **Cursor Pet** - Interactive cat that follows your cursor
- 📁 **macOS Windows** - Draggable, resizable windows with authentic macOS styling
- 💻 **Code Editor** - Monaco Editor integration with syntax highlighting
- 📸 **Photo Gallery** - Lightbox-style image viewer
- 🌤️ **Weather Widget** - Real-time weather from Open-Meteo API
- 🔍 **Spotlight Search** - Quick app launcher (Cmd/Ctrl + K)
- 🎨 **Dark Mode** - Full dark mode support

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/sisodiajatin/MacOS_Portfolio.git
   cd MacOS_Portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env with your details
   # Change VITE_GITHUB_USERNAME to your GitHub username
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🌍 Deployment

This project is optimized for **FREE** deployment on Vercel.

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sisodiajatin/MacOS_Portfolio)

### Manual Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**TL;DR:**
```bash
npm i -g vercel
vercel login
vercel --prod
```

Don't forget to set environment variables in Vercel dashboard!

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Your GitHub username (required)
VITE_GITHUB_USERNAME=sisodiajatin

# Jamendo Music API client ID (optional - has default)
VITE_JAMENDO_CLIENT_ID=56d30c95

# Weather location coordinates (optional - defaults to Worcester, MA)
VITE_WEATHER_LAT=42.2626
VITE_WEATHER_LON=-71.8023
```

**How to customize:**
- Replace `sisodiajatin` with your GitHub username
- Change coordinates to your city ([find coordinates](https://www.latlong.net/))

## 🛠️ Tech Stack

- **Framework**: React 19.2 + Vite 7.2
- **Styling**: Tailwind CSS 4.1
- **Animations**: GSAP + Framer Motion
- **State Management**: Zustand
- **Code Editor**: Monaco Editor
- **3D Graphics**: Three.js + React Three Fiber
- **Icons**: Lucide React
- **Date/Time**: Day.js

## 📁 Project Structure

```
MacOS_Portfolio/
├── public/              # Static assets
│   ├── images/         # Portfolio images
│   └── icons/          # App icons
├── src/
│   ├── components/     # React components
│   │   ├── DynamicIsland.jsx
│   │   ├── MusicWidget.jsx
│   │   ├── Dock.jsx
│   │   └── ...
│   ├── windows/        # Window components
│   ├── store/          # Zustand stores
│   ├── constants/      # App constants
│   └── index.css       # Global styles
├── .env.example        # Environment template
└── DEPLOYMENT.md       # Deployment guide
```

## 🎨 Customization

### Change Portfolio Content

1. **Personal Info**: Edit `src/constants/index.js`
2. **Images**: Replace files in `public/images/`
3. **GitHub Username**: Update `.env` file
4. **Weather Location**: Update coordinates in `.env`

### Add Custom Windows

1. Create component in `src/windows/YourWindow.jsx`
2. Add to `src/constants/index.js` in `dockApps` array
3. Import in `src/App.jsx`

## 🎹 Keyboard Shortcuts

- **Cmd/Ctrl + K**: Open Spotlight search
- **Cmd/Ctrl + W**: Close active window
- **Cmd/Ctrl + D**: Toggle dark mode
- **Escape**: Close topmost window or Spotlight

## 📦 Build for Production

```bash
# Create optimized build
npm run build

# Preview production build locally
npm run preview
```

Build output will be in the `dist/` directory.

## 🐛 Known Issues

- Monaco Editor increases bundle size (~7MB of worker files, lazy-loaded)
- GitHub API has 60 req/hour limit for unauthenticated requests
- Audio autoplay may be blocked by browser policies (user interaction required)

## 📄 License

MIT License - feel free to use this for your own portfolio!

## 🙏 Acknowledgments

- Inspired by macOS Big Sur
- Music from [Jamendo](https://www.jamendo.com/)
- Weather from [Open-Meteo](https://open-meteo.com/)
- Icons from [Lucide](https://lucide.dev/)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

## 📬 Contact

- **GitHub**: [@sisodiajatin](https://github.com/sisodiajatin)
- **Portfolio**: [Your Vercel URL here]

---

Made with ❤️ and React
