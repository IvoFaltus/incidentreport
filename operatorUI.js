import { renderIncidents } from "./UIManager.js";
import { getFilterPattern, getStoredIncidents, setFilterPattern } from "./incidentStore.js";
import { initMap, setIncidentLocation } from "./map.js";

const matchesPattern = (obj, pattern) => {
  if (!pattern || typeof pattern !== "object") return true;
  if (!obj || typeof obj !== "object") return false;

  for (const key of Object.keys(pattern)) {
    if (!pattern[key]) continue;
    if (obj[key] !== pattern[key]) return false;
  }
  return true;
};

let watcherInterval = null;
let incidentMapReady = false;

const stopWatcher = () => {
  clearInterval(watcherInterval);
  watcherInterval = null;
};

const getFilteredIncidents = () => {
  const pattern = getFilterPattern();
  if (!pattern) return getStoredIncidents();
  return getStoredIncidents().filter((obj) => matchesPattern(obj, pattern));
};

const getFirstGpsFromList = (list) => {
  if (!Array.isArray(list)) return null;
  for (const obj of list) {
    if (!obj) continue;
    if (obj.gps) return obj.gps;
  }
  return null;
};

const updateMapLocation = (currentList = null) => {
  if (!incidentMapReady) return;

  const filterGpsInput = document.querySelector("#filterForm input[name='gps']");
  const gpsFromSearch = filterGpsInput?.value?.trim();
  if (gpsFromSearch) {
    if (setIncidentLocation(gpsFromSearch)) return;
  }

  const gpsFromList = getFirstGpsFromList(currentList ?? getFilteredIncidents());
  if (gpsFromList) setIncidentLocation(gpsFromList);
};

const startWatcher = () => {
  stopWatcher();

  watcherInterval = setInterval(() => {
    // Preserve the previous "started" localStorage behavior (used elsewhere to stop the watcher).
    if (localStorage["started"] !== "1") {
      stopWatcher();
      return;
    }
    localStorage["started"] = "1";

    const list = getFilteredIncidents();
    renderIncidents(list);
    updateMapLocation(list);
  }, 1000);
};

const renderDbPayloads = async () => {
  stopWatcher();

  const listDiv = document.querySelector(".listdiv");
  if (listDiv) listDiv.innerHTML = "";

  const url = "http://wa3lm.dev.spsejecna.net/incident/select.php";

  const name = $("#id-name").val() ?? null;
  const email = $("#id-email").val() ?? null;
  const category = $("#id-category").val() ?? null;
  const location = $("#id-location").val() ?? null;
  const description = $("#id-description").val() ?? null;
  const gps = $("#id-gps").val() ?? null;

  let conditions = { reporter_name:name, reporter_email:email,category:category, location:location, description:description, gps:gps };
  for (const key of Object.keys(conditions)) {
    if (!conditions[key]) delete conditions[key];
  }

  if (!conditions || Object.keys(conditions).length === 0) conditions = {};
  console.log("conditions are")
  console.log(conditions)
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      select: ["id", "reporter_name", "category", "created_at","reporter_email","gps","location"],
      where: conditions,
      orderBy: { column: "created_at", direction: "DESC" },
      limit: 20,
      offset: 0,
    }),
  });

  if (!res.ok) {
    console.log("problem with response");
    return;
  }

  const payloadsfromdb = await res.json();
  renderIncidents(payloadsfromdb["data"]);
};

const initOperatorUI = () => {
  const filterForm = document.getElementById("filterForm");
  if (!filterForm) return;

  // Start local watcher immediately once UI is ready.
  localStorage["started"] = "1";
  startWatcher();

  try {
    initMap("#map");
    incidentMapReady = true;
    updateMapLocation(getFilteredIncidents());
  } catch (err) {
    console.warn("Map disabled:", err);
    incidentMapReady = false;
  }

  const filterGpsInput = filterForm.querySelector("input[name='gps']");
  if (filterGpsInput) {
    filterGpsInput.addEventListener("input", () => updateMapLocation(getFilteredIncidents()));
  }

  const localSearchBtn = document.querySelector(".localsearch");
  if (localSearchBtn) {
    localSearchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const data = Object.fromEntries(new FormData(filterForm));
      const pattern = {
        reporterName: data.reporterName || null,
        reporterEmail: data.reporterEmail || null,
        category: data.category || null,
        location: data.location || null,
        description: data.description || null,
        gps: data.gps || null,
      };

      setFilterPattern(pattern);
      const list = getFilteredIncidents();
      renderIncidents(list);
      updateMapLocation(list);
    });
  }

  const dbSearchBtn = document.querySelector(".dbsearch");
  if (dbSearchBtn) {
    dbSearchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      renderDbPayloads();
    });
  }
};

export { initOperatorUI };

