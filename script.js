import { renderIncidents } from "./UIManager.js"
import { buildIncidentPayload, postIncident } from "./fetchHandler.js"
import { initMap, setIncidentLocation } from "./map.js"
import { initInlineWebcam } from "./webcam.js"

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




const renderdbpayloads = async()=>{


const url = "http://wa3lm.dev.spsejecna.net/incident/select.php"



const res = await fetch(url,)




list = []
renderIncidents(list)

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
    const openWebcamBtn = document.getElementById("openWebcamBtn")
    const capturedImageInput = document.getElementById("capturedImageBase64")
    const imagePreview = document.getElementById("imagePreview")
    const fileInput = document.getElementById("incidentImageFile")

    if (!filterForm || !saveForm) {
        console.error("Missing #filterForm or #saveForm in DOM")
        return
    }

    const setPreview = (dataUrl) => {
        if (!imagePreview) return
        if (!dataUrl) {
            imagePreview.src = ""
            imagePreview.classList.add("d-none")
            return
        }
        imagePreview.src = dataUrl
        imagePreview.classList.remove("d-none")
    }

    const clearCaptured = () => {
        if (capturedImageInput) capturedImageInput.value = ""
        try { localStorage.removeItem("imgData") } catch {}
    }

    const setCaptured = (dataUrl) => {
        if (capturedImageInput) capturedImageInput.value = dataUrl
        try { localStorage.setItem("imgData", dataUrl) } catch {}
        if (fileInput) fileInput.value = ""
        setPreview(dataUrl)
    }

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
    })

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

    if (fileInput) {
        fileInput.addEventListener("change", () => {
            const file = fileInput.files?.length ? fileInput.files[0] : null
            if (!file) return
            clearCaptured()
            webcam?.close?.()
            const url = URL.createObjectURL(file)
            setPreview(url)
        })
    }

    try {
        const existing = localStorage.getItem("imgData")
        if (existing && existing.startsWith("data:image/") && (!fileInput || !fileInput.files?.length)) {
            setCaptured(existing)
        }
    } catch {}

    saveForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            const payload = await buildIncidentPayload(saveForm)
            console.log("saving incident" + payload)
            saveIncident(payload)

            const res = await postIncident(payload)
            const data = await res.text()
            console.log("response:", data)

            
            clearCaptured()
            if (fileInput) fileInput.value = ""
            setPreview(null)
            webcam?.close?.()
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
