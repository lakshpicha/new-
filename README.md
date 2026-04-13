# AirCanvas Pro (Real-Time Camera + Hand Tracking)

AirCanvas Pro is a browser app where you draw in the air with your hand.
It uses your webcam and hand landmarks to convert finger movement into brush strokes in real time.

---

## Project Overview

This project is designed to demonstrate:
- Real-time webcam streaming in the browser.
- Hand landmark detection with MediaPipe Hands.
- Gesture-based interaction (pinch to draw, open hand to move).
- Layered canvas rendering (video + overlay + drawing layer).
- UI controls for brush color, brush size, clear, and save.

If you are learning frontend + computer vision basics, this is a good starter reference app.

---

## Main Features

- ✅ Real-time AirCanvas drawing using laptop camera.
- ✅ Pinch gesture (thumb + index) enables drawing mode.
- ✅ Open hand keeps tracking without drawing.
- ✅ Multiple colors (preset palette + custom color picker).
- ✅ Adjustable brush thickness.
- ✅ Live tracking status and FPS counter.
- ✅ Save output as PNG.

---

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- [MediaPipe Hands](https://developers.google.com/mediapipe)

---

## How to Run (Any IDE)

> Important: This project should run through a **local HTTP server** (not `file://`) so camera permissions work reliably.

### Option A: VS Code
1. Open folder in VS Code.
2. Open terminal (`Ctrl + \``).
3. Run:
   ```bash
   python -m http.server 8000
   ```
4. Open `http://localhost:8000` in browser.

### Option B: IntelliJ / WebStorm / PyCharm
1. Open the project folder.
2. Use built-in terminal.
3. Run:
   ```bash
   python -m http.server 8000
   ```
4. Open `http://localhost:8000`.

### Option C: Replit / Codespaces / Cloud IDE
1. Import/upload this project.
2. Start a basic static server (Python or Node server).
3. Expose port `8000` and open the generated preview URL.
4. Allow webcam permission in the browser.

---

## How to Use

1. Click **Start Camera**.
2. Allow webcam access.
3. Keep your hand visible in front of camera.
4. **Pinch thumb + index** to draw.
5. Open hand to move cursor without drawing.
6. Change brush color/size from control panel.
7. Use **Clear Canvas** or **Save PNG** anytime.

---

## Real-Time Experience Tips

For smoother hand tracking and better UX:
- Use good front lighting.
- Keep background less cluttered.
- Keep hand inside camera frame.
- Prefer Chromium browsers (Chrome/Edge/Brave).
- Reduce browser tabs if FPS drops.

---

## Event / Demo Guide (for presentation)

If you are showing this project in a class/event:
1. Start server and open app before audience joins.
2. Quickly explain gesture logic (pinch = draw).
3. Show color and size controls.
4. Create a drawing live in 20–30 seconds.
5. Save the output PNG as final demo result.

This flow gives a clean “real-time AI + UI” demonstration.
