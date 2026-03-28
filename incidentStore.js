const isNumericStorageKey = (key) => !isNaN(Number(key));

const serializeIncident = (obj) => JSON.stringify(obj ?? {});

const parseIncident = (stringObj) => {
  try {
    const parsed = JSON.parse(stringObj);
    if (parsed === null || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
};

const getStoredIncidents = (storage = localStorage) => {
  const list = [];

  for (const key of Object.keys(storage)) {
    if (!isNumericStorageKey(key)) continue;
    const incident = parseIncident(storage[key]);
    incident.id = key;
    list.push(incident);
  }

  return list;
};

const saveIncident = (obj, storage = localStorage) => {
  const keys = Object.keys(storage)
    .filter((k) => isNumericStorageKey(k))
    .map(Number);

  const id = keys.length ? Math.max(...keys) + 1 : 1;
  storage[id] = serializeIncident(obj);
  return id;
};

const clearStoredIncidents = (storage = localStorage) => {
  for (const key of Object.keys(storage)) {
    if (!isNumericStorageKey(key)) continue;
    storage.removeItem(key);
  }
};

const getFilterPattern = (storage = localStorage) => {
  const raw = storage.getItem("pattern");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

const setFilterPattern = (pattern, storage = localStorage) => {
  storage.setItem("pattern", JSON.stringify(pattern ?? {}));
};

export {
  clearStoredIncidents,
  getFilterPattern,
  getStoredIncidents,
  saveIncident,
  setFilterPattern,
};

