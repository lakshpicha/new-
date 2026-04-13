const PRESET_COLORS = ["#00d4ff", "#ff6b6b", "#ffd166", "#95f9a9", "#b388ff", "#ffffff"];

const inputVideo = document.getElementById("inputVideo");
const overlayCanvas = document.getElementById("overlayCanvas");
const drawCanvas = document.getElementById("drawCanvas");
const overlayCtx = overlayCanvas.getContext("2d");
const drawCtx = drawCanvas.getContext("2d");

const statusEl = document.getElementById("status");
const startCameraBtn = document.getElementById("startCameraBtn");
const stopCameraBtn = document.getElementById("stopCameraBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");
const colorPicker = document.getElementById("colorPicker");
const sizeSlider = document.getElementById("sizeSlider");
const sizeValue = document.getElementById("sizeValue");
const palette = document.getElementById("palette");
const trackingState = document.getElementById("trackingState");
const fpsValue = document.getElementById("fpsValue");

let brushColor = colorPicker.value;
let brushSize = Number(sizeSlider.value);
let camera = null;
let hands = null;
let isCameraRunning = false;

let previousPoint = null;
let lastFrameTime = 0;
let smoothedFps = 0;

function drawInstructionText() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  drawCtx.fillStyle = "rgba(255, 255, 255, 0.86)";
  drawCtx.font = "700 34px Inter, sans-serif";
  drawCtx.fillText("AirCanvas Pro", 32, 58);
  drawCtx.font = "500 18px Inter, sans-serif";
  drawCtx.fillStyle = "rgba(220, 232, 255, 0.92)";
  drawCtx.fillText("Start camera, then pinch (thumb + index) to draw", 32, 92);
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setTrackingState(text) {
  trackingState.textContent = text;
}

function updateFps() {
  const now = performance.now();
  if (lastFrameTime) {
    const instant = 1000 / (now - lastFrameTime);
    smoothedFps = smoothedFps ? smoothedFps * 0.8 + instant * 0.2 : instant;
    fpsValue.textContent = Math.max(0, Math.round(smoothedFps)).toString();
  }
  lastFrameTime = now;
}

function buildPalette() {
  PRESET_COLORS.forEach((color, idx) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.style.background = color;
    button.title = color;
    if (idx === 0) button.classList.add("active");

    button.addEventListener("click", () => {
      document.querySelectorAll(".swatch").forEach((swatch) => swatch.classList.remove("active"));
      button.classList.add("active");
      brushColor = color;
      colorPicker.value = color;
    });

    palette.appendChild(button);
  });
}

function toCanvasPoint(landmark) {
  return {
    x: (1 - landmark.x) * overlayCanvas.width,
    y: landmark.y * overlayCanvas.height
  };
}

function isPinching(indexTip, thumbTip) {
  const dx = indexTip.x - thumbTip.x;
  const dy = indexTip.y - thumbTip.y;
  const distance = Math.hypot(dx, dy);
  return distance < 0.055;
}

function drawStroke(point) {
  drawCtx.strokeStyle = brushColor;
  drawCtx.lineWidth = brushSize;
  drawCtx.lineCap = "round";
  drawCtx.lineJoin = "round";

  if (!previousPoint) {
    previousPoint = point;
  }

  // Interpolate for smoother real-time strokes.
  const steps = 3;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const ix = previousPoint.x + (point.x - previousPoint.x) * t;
    const iy = previousPoint.y + (point.y - previousPoint.y) * t;
    drawCtx.beginPath();
    drawCtx.moveTo(previousPoint.x, previousPoint.y);
    drawCtx.lineTo(ix, iy);
    drawCtx.stroke();
  }

  previousPoint = point;
}

function clearOverlay() {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

function drawCursor(point, color) {
  overlayCtx.beginPath();
  overlayCtx.arc(point.x, point.y, 8, 0, Math.PI * 2);
  overlayCtx.fillStyle = color;
  overlayCtx.fill();
  overlayCtx.strokeStyle = "white";
  overlayCtx.lineWidth = 2;
  overlayCtx.stroke();
}

function onResults(results) {
  updateFps();
  clearOverlay();

  if (!results.multiHandLandmarks || !results.multiHandLandmarks.length) {
    previousPoint = null;
    setTrackingState("No Hand");
    setStatus("No hand detected. Place your hand clearly in front of the camera.");
    return;
  }

  const landmarks = results.multiHandLandmarks[0];
  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];

  const indexPoint = toCanvasPoint(indexTip);
  const pinching = isPinching(indexTip, thumbTip);

  drawCursor(indexPoint, pinching ? "#4ade80" : "#ffcf66");

  if (pinching) {
    setTrackingState("Drawing");
    setStatus("Drawing mode: Pinch detected ✅");
    drawStroke(indexPoint);
  } else {
    setTrackingState("Tracking");
    setStatus("Tracking mode: Open hand (not drawing)");
    previousPoint = null;
  }

  if (typeof drawConnectors === "function" && typeof drawLandmarks === "function") {
    drawConnectors(overlayCtx, landmarks, HAND_CONNECTIONS, { color: "#7ea2ff", lineWidth: 2 });
    drawLandmarks(overlayCtx, landmarks, { color: "#dce9ff", lineWidth: 1, radius: 1.6 });
  }
}

function resizeCanvases() {
  const { videoWidth, videoHeight } = inputVideo;
  if (!videoWidth || !videoHeight) return;

  overlayCanvas.width = videoWidth;
  overlayCanvas.height = videoHeight;
  drawCanvas.width = videoWidth;
  drawCanvas.height = videoHeight;
  drawInstructionText();
}

async function startCamera() {
  if (isCameraRunning) return;
  if (!window.Hands || !window.Camera) {
    setStatus("Required camera/hand library failed to load. Check internet access.");
    return;
  }

  hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.6
  });

  hands.onResults(onResults);

  camera = new Camera(inputVideo, {
    onFrame: async () => {
      await hands.send({ image: inputVideo });
    },
    width: 960,
    height: 540
  });

  await camera.start();
  isCameraRunning = true;
  lastFrameTime = 0;
  smoothedFps = 0;
  fpsValue.textContent = "0";
  resizeCanvases();
  setTrackingState("Ready");
  setStatus("Camera started. Show your hand and pinch to draw.");
}

function stopCamera() {
  if (!isCameraRunning) return;

  camera.stop();
  const stream = inputVideo.srcObject;
  if (stream && typeof stream.getTracks === "function") {
    stream.getTracks().forEach((track) => track.stop());
  }

  inputVideo.srcObject = null;
  isCameraRunning = false;
  previousPoint = null;
  clearOverlay();
  setTrackingState("Idle");
  fpsValue.textContent = "0";
  setStatus("Camera stopped.");
}

function clearDrawing() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  drawInstructionText();
}

function saveDrawing() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = drawCanvas.width;
  exportCanvas.height = drawCanvas.height;
  const exportCtx = exportCanvas.getContext("2d");

  exportCtx.drawImage(inputVideo, 0, 0, exportCanvas.width, exportCanvas.height);
  exportCtx.drawImage(drawCanvas, 0, 0);

  const a = document.createElement("a");
  a.href = exportCanvas.toDataURL("image/png");
  a.download = `aircanvas-${Date.now()}.png`;
  a.click();
}

startCameraBtn.addEventListener("click", () => {
  startCamera().catch((err) => {
    setStatus(`Camera error: ${err.message}`);
  });
});

stopCameraBtn.addEventListener("click", stopCamera);
clearBtn.addEventListener("click", clearDrawing);
saveBtn.addEventListener("click", saveDrawing);

colorPicker.addEventListener("input", () => {
  brushColor = colorPicker.value;
  document.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.classList.toggle("active", swatch.title.toLowerCase() === brushColor.toLowerCase());
  });
});

sizeSlider.addEventListener("input", () => {
  brushSize = Number(sizeSlider.value);
  sizeValue.textContent = brushSize;
});

window.addEventListener("resize", resizeCanvases);

buildPalette();
drawInstructionText();
setTrackingState("Idle");
