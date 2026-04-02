import { buildIncidentPayload, postIncident } from "./fetchHandler.js";
import { saveIncident } from "./incidentStore.js";
import { initInlineWebcam } from "./webcam.js";

const initIncidentPosting = () => {
  const saveForm = document.getElementById("saveForm");
  if (!saveForm) return;

  const openWebcamBtn = document.getElementById("openWebcamBtn");
  const capturedImageInput = document.getElementById("capturedImageBase64");
  const imagePreview = document.getElementById("imagePreview");
  const fileInput = document.getElementById("incidentImageFile");

  const setPreview = (dataUrl) => {
    if (!imagePreview) return;
    if (!dataUrl) {
      imagePreview.src = "";
      imagePreview.classList.add("d-none");
      return;
    }
    imagePreview.src = dataUrl;
    imagePreview.classList.remove("d-none");
  };

  const clearCaptured = () => {
    if (capturedImageInput) capturedImageInput.value = "";
    try {
      localStorage.removeItem("imgData");
    } catch {}
  };

  const setCaptured = (dataUrl) => {
    if (capturedImageInput) capturedImageInput.value = dataUrl;
    try {
      localStorage.setItem("imgData", dataUrl);
    } catch {}
    if (fileInput) fileInput.value = "";
    setPreview(dataUrl);
  };

  const webcam = initInlineWebcam({
    container: document.getElementById("webcamContainer"),
    openButton: openWebcamBtn,
    closeButton: document.getElementById("webcamCloseBtn"),
    startButton: document.getElementById("webcamStartBtn"),
    captureButton: document.getElementById("webcamCaptureBtn"),
    useButton: document.getElementById("webcamUseBtn"),
    video: document.getElementById("webcamVideo"),
    canvas: document.getElementById("webcamCanvas"),
    previewImg: document.getElementById("webcamPhotoPreview"),
    statusEl: document.getElementById("webcamStatus"),
    onUse: (dataUrl) => setCaptured(dataUrl),
  });

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.length ? fileInput.files[0] : null;
      if (!file) return;
      clearCaptured();
      webcam?.close?.();
      const url = URL.createObjectURL(file);
      setPreview(url);
    });
  }

  try {
    const existing = localStorage.getItem("imgData");
    if (
      existing &&
      existing.startsWith("data:image/") &&
      (!fileInput || !fileInput.files?.length)
    ) {
      setCaptured(existing);
    }
  } catch {}

  const feedbackEl = document.getElementById("formFeedback");

  const showFeedback = (message, variant = "info") => {
    if (!feedbackEl) return;
    feedbackEl.innerHTML = `
      <div class="alert alert-${variant} py-2 mb-0" role="alert">
        ${message}
      </div>
    `;
  };

  const clearFeedback = () => {
    if (!feedbackEl) return;
    feedbackEl.innerHTML = "";
  };

  saveForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearFeedback();

    try {
      const payload = await buildIncidentPayload(saveForm);
      saveIncident(payload);
      console.log("payload is ", payload);

      const res = await postIncident(payload);
      const data = await res.text();
      console.log("response:", data);

      if (!res.ok) {
        showFeedback("API error: incident could not be submitted.", "danger");
        return;
      }

      showFeedback("Incident submitted successfully.", "success");
      clearCaptured();
      if (fileInput) fileInput.value = "";
      setPreview(null);
      webcam?.close?.();
      saveForm.reset();
    } catch (err) {
      console.error("error:", err);
      const message = err?.message?.toString().toLowerCase() || "unknown error";
      if (message.includes("obrazek") || message.includes("picture") || message.includes("photo")) {
        showFeedback("A photo is required. Please attach an image or take one with the webcam.", "warning");
      } else {
        showFeedback("API error: " + (err?.message || "An unexpected error occurred."), "danger");
      }
    }
  });
};

export { initIncidentPosting };

