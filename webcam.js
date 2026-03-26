const defaultSetText = (el, text) => {
  if (!el) return
  el.textContent = text || ""
}

const hasVideoSize = (videoEl) =>
  !!(videoEl && videoEl.videoWidth > 0 && videoEl.videoHeight > 0)

const stopStream = (stream, videoEl) => {
  if (!stream) return null
  for (const track of stream.getTracks()) track.stop()
  if (videoEl) videoEl.srcObject = null
  return null
}

/**
 * Inline webcam controller (no popup).
 *
 * Expects existing DOM elements (created in index.html).
 * Calls `onUse(dataUrl)` when user confirms using the captured image.
 */
const initInlineWebcam = ({
  container,
  openButton,
  closeButton,
  startButton,
  captureButton,
  useButton,
  video,
  canvas,
  previewImg,
  statusEl,
  onUse,
}) => {
  if (!onUse || typeof onUse !== "function") {
    throw new Error("initInlineWebcam: onUse callback is required")
  }

  let stream = null
  let lastCaptureDataUrl = ""

  const setStatus = (text) => defaultSetText(statusEl, text)

  const resetUi = () => {
    lastCaptureDataUrl = ""
    setStatus("")

    if (captureButton) captureButton.disabled = true
    if (useButton) useButton.disabled = true
    if (startButton) startButton.disabled = false

    if (previewImg) {
      previewImg.src = ""
      previewImg.classList.add("d-none")
    }
  }

  const stop = () => {
    stream = stopStream(stream, video)
  }

  const open = () => {
    if (!container) return
    stop()
    resetUi()
    container.classList.remove("d-none")
    container.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }

  const close = () => {
    if (!container) return
    stop()
    resetUi()
    container.classList.add("d-none")
  }

  const start = async () => {
    if (!video) return
    try {
      setStatus("Requesting camera permission...")
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      video.srcObject = stream

      if (startButton) startButton.disabled = true
      if (captureButton) captureButton.disabled = false
      setStatus("")
    } catch (err) {
      console.error("Error accessing webcam:", err)
      setStatus("Webcam permission denied or unavailable.")
      stop()
      if (startButton) startButton.disabled = false
      if (captureButton) captureButton.disabled = true
      if (useButton) useButton.disabled = true
    }
  }

  const capture = () => {
    if (!video || !canvas) return
    if (!hasVideoSize(video)) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0)

    lastCaptureDataUrl = canvas.toDataURL("image/jpeg", 0.9)

    if (previewImg) {
      previewImg.src = lastCaptureDataUrl
      previewImg.classList.remove("d-none")
    }

    if (useButton) useButton.disabled = false
    setStatus('Captured. Click "Use photo" to attach it to the report.')
  }

  const use = () => {
    if (!lastCaptureDataUrl) return
    onUse(lastCaptureDataUrl)
    close()
  }

  if (openButton) openButton.addEventListener("click", open)
  if (closeButton) closeButton.addEventListener("click", close)
  if (startButton) startButton.addEventListener("click", start)
  if (captureButton) captureButton.addEventListener("click", capture)
  if (useButton) useButton.addEventListener("click", use)

  window.addEventListener("beforeunload", stop)

  return { open, close, start, capture, use, stop, resetUi }
};

export { initInlineWebcam }
