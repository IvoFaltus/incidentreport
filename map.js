const DEFAULT_CENTER = [50.087, 14.421];
const DEFAULT_ZOOM = 13;

let map = null;
let marker = null;

const parseGps = (gpsString) => {
  if (!gpsString) return null;
  const s = String(gpsString).trim();

  const match = s.match(
    /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/
  );
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;

  return [lat, lng];
};

const initMap = (containerSelector = "#map") => {
  const el = document.querySelector(containerSelector);
  if (!el) throw new Error("Map container not found");
  if (!window.L) throw new Error("Leaflet not loaded");

  map = window.L.map(el).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  marker = window.L.marker(DEFAULT_CENTER).addTo(map);
  return map;
};

const setIncidentLocation = (gpsString, { zoom = DEFAULT_ZOOM } = {}) => {
  if (!map || !marker) return false;
  const coords = parseGps(gpsString);
  if (!coords) return false;

  marker.setLatLng(coords);
  map.setView(coords, zoom);
  return true;
};

export { initMap, parseGps, setIncidentLocation };
