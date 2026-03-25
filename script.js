import { renderIncidents } from "./UIManager.js"
import { buildIncidentPayload, postIncident } from "./fetchHandler.js"
import { initMap, setIncidentLocation } from "./map.js"

const matchesPattern = (obj, pattern) => {
    if (!pattern || typeof pattern !== "object") return true
    if (!obj || typeof obj !== "object") return false

    for (const key of Object.keys(pattern)) {
        if (!pattern[key]) continue
        if (obj[key] !== pattern[key]) return false
    }
    return true
}


const getFilteredPayloads = ()=>{


const check = localStorage["pattern"] ?? null
if(!check){return getStoredIncidents()}    
const pattern = JSON.parse(localStorage["pattern"]) ?? null


if(!pattern){return getStoredIncidents()}
const arr = getStoredIncidents().filter(obj=>{


	        return matchesPattern(obj, pattern)

	    })


    return arr
}





let filtered_payloads = []
const startWatcher = ()=>{


    const i=setInterval(()=>{
        if(localStorage["started"]!=='1'){
            clearInterval(i)
        }
        localStorage["started"]='1'


	const list = getFilteredPayloads()
	renderIncidents(list)
	updateMapLocation(list)

    },1000)
}




let incidentMapReady = false




const getStoredIncidents = ()=>{

    const list = []


    for(let key of Object.keys(localStorage)){
        if(isNaN(Number(key))){continue}
        const pld = getPayload(localStorage[key])
        pld["id"]=key
        list.push(pld)
    }
    return list

}


const clearLocalStorage =()=>{



    for(const key of Object.keys(localStorage)){
        if(isNaN(Number(key))){continue}

        localStorage.removeItem(key)
    }
}

const setPayload =(obj)=>{
    return JSON.stringify(obj)
}

const getPayload = (string_obj) => {
    try {
        const parsed = JSON.parse(string_obj);

        if (parsed === null || typeof parsed !== "object") {
            return {};
        }

        return parsed;
    } catch {
        return {};
    }
};



const saveIncident = (obj)=>{

const keys = Object.keys(localStorage)
    .filter(k => !isNaN(Number(k)))
    .map(Number);

const id = keys.length ? Math.max(...keys) + 1 : 1;

	localStorage[id]=setPayload(obj)


	}

const getFirstGpsFromList = (list) => {
    if (!Array.isArray(list)) return null
    for (const obj of list) {
        if (!obj) continue
        if (obj.gps) return obj.gps
    }
    return null
}

const updateMapLocation = (currentList = null) => {
    if (!incidentMapReady) return

    const filterGpsInput = document.querySelector("#filterForm input[name='gps']")
    const gpsFromSearch = filterGpsInput?.value?.trim()

    if (gpsFromSearch) {
        if (setIncidentLocation(gpsFromSearch)) return
    }

    const gpsFromList = getFirstGpsFromList(currentList ?? getFilteredPayloads())
    if (gpsFromList) {
        setIncidentLocation(gpsFromList)
    }
}

startWatcher()






window.addEventListener("DOMContentLoaded", () => {
    const filterForm = document.getElementById("filterForm")
    const saveForm = document.getElementById("saveForm")

    if (!filterForm || !saveForm) {
        console.error("Missing #filterForm or #saveForm in DOM")
        return
    }

    try {
        initMap("#map")
        incidentMapReady = true
        updateMapLocation(getFilteredPayloads())
    } catch (err) {
        console.warn("Map disabled:", err)
        incidentMapReady = false
    }

    const filterGpsInput = filterForm.querySelector("input[name='gps']")
    if (filterGpsInput) {
        filterGpsInput.addEventListener("input", () => updateMapLocation(getFilteredPayloads()))
    }

    saveForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            const payload = await buildIncidentPayload(saveForm)
            saveIncident(payload)

            const res = await postIncident(payload)
            const data = await res.text()
            console.log("response:", data)
        } catch (err) {
            console.error("error:", err)
        }
    })

    filterForm.addEventListener("submit", (e) => {
        e.preventDefault()
        e.stopPropagation()

        const data = Object.fromEntries(new FormData(filterForm))

        const pattern = {
            reporterName: data.reporterName || null,
            reporterEmail: data.reporterEmail || null,
            category: data.category || null,
            location: data.location || null,
            description: data.description || null,
            gps: data.gps || null,
        }

        localStorage['pattern'] = JSON.stringify(pattern)
        const list = getFilteredPayloads()
        renderIncidents(list)
        updateMapLocation(list)
    })
})
