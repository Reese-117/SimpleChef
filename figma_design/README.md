
  # Develop Frontend Design

  This is a code bundle for Develop Frontend Design. The original project is available at https://www.figma.com/design/X1mCUt7sUpFDNjhV3YNBaR/Develop-Frontend-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## New frontend on a phone (not Expo Go)

  This folder is a **Vite + React (web)** app. **Expo Go cannot run it**—Expo Go only loads the separate React Native app in `../frontend/`.

  To use this UI on a physical device:

  1. Start the API on your PC (`../backend`, e.g. `python run.py` on port 8000).
  2. In this folder, create `.env` with your PC’s LAN address so the phone can reach the API (not `localhost`):
     `VITE_API_URL=http://192.168.x.x:8000/api/v1`
  3. Run `npm run dev` (dev server listens on all interfaces so the Network URL works on LAN).
  4. On your phone (same Wi‑Fi), open a browser to `http://192.168.x.x:5173` (use the **Network** URL Vite prints in the terminal).

  If you need a single “app icon” experience, options are: add this URL to the home screen (PWA-style), wrap the built site with **Capacitor**, or embed the deployed URL in a **WebView** screen inside the Expo app (still opened via Expo Go, but the UI is the web bundle).
  