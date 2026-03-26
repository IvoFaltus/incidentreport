import { compressDataUrlTo2MB, compressImageTo2MB } from "./fileManager.js";

const DEFAULT_INCIDENT_API_URL = "http://wa3lm.dev.spsejecna.net/incident/api.php";

const buildIncidentPayload = async (formEl) => {
  const formData = new FormData(formEl);
  const o = Object.fromEntries(formData);

  const fileInput = formEl.querySelector('input[type="file"]');
  const file = fileInput?.files?.length ? fileInput.files[0] : null;

  const captured = (o.capturedImageBase64 || "").toString().trim();
  const hasCaptured = captured.startsWith("data:image/");

  if (!file && !hasCaptured) throw new Error("obrazek je potreba");

  const imageBase64 = file
    ? await compressImageTo2MB(file)
    : await compressDataUrlTo2MB(captured);

  return {
    reporterName: o.reporterName,
    reporterEmail: o.reporterEmail,
    category: o.category,
    location: o.location,
    description: o.description,
    gps: o.gps,
    imageBase64,
  };
};

const postIncident = async (payload, url = DEFAULT_INCIDENT_API_URL) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res;
};

export { DEFAULT_INCIDENT_API_URL, buildIncidentPayload, postIncident };
