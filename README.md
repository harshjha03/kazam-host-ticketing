# Kazam Ticketing Prototype

An interactive mobile prototype for the Kazam charger issue-reporting flow, built with React + Vite.

## Run it

```bash
npm install
npm run dev
```

Vite prints a local URL (usually http://localhost:5173) and opens it automatically.

## Build for sharing

```bash
npm run build      # outputs to dist/
npm run preview    # serves the production build locally
```

## Structure

```
.
├── index.html          # Vite entry HTML
├── src/
│   ├── main.jsx        # React root — mounts <App />
│   └── App.jsx         # The full prototype (all screens + animations)
├── vite.config.js
└── package.json
```

All UI lives in `src/App.jsx`. Styling is inline + a single injected `<style>` block
(the `ANIM` constant) that holds the keyframes for the screen transitions, recording
pulse, success pop, and blinking status dots.
