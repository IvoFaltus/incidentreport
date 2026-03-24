import { renderIncidents } from "./UIManager.js"


const getFilteredPayloads = ()=>{


const check = localStorage["pattern"] ?? null
if(!check){return getStoredIncidents()}    
const pattern = JSON.parse(localStorage["pattern"]) ?? null


if(!pattern){return getStoredIncidents()}
const arr = getStoredIncidents().filter(obj=>{


        return obj.matches(pattern)

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


renderIncidents(getFilteredPayloads())

    },1000)
}




startWatcher()


Object.prototype.matches = function (pattern) {
    for (const key in pattern) {
        if(!pattern[key]){continue}
        if (pattern[key] && this[key] !== pattern[key]) {
            return false;
            
        }
    }
    return true;
};




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

const filterForm = $("#filterForm")[0] 
const saveForm =$("#saveForm")[0]



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






$(document).ready(()=>{

$("#saveForm").submit(e=>{
    e.preventDefault()


    const data = Object.fromEntries(new FormData(saveForm));


    const payload = {
        reportName:data.reportName ?? null,
        reportEmail:data.reportEmail ?? null,
        category:data.category ?? null,
        location:data.location ?? null,
        description:data.description ?? null,
        imageBase64:btoa(data.imageBase64) ?? null,
        gps:data.gps ?? null,



    }

    saveIncident(payload)





})






$("#filterForm").submit(e=>{

    e.preventDefault()


    const data = Object.fromEntries(new FormData(filterForm));

    const pattern = {
        reportName:data.reportName || null,
        reportEmail:data.reportEmail|| null,
        category:data.category || null,
        location:data.location || null,
        description:data.description || null,
        gps:data.gps || null,



    }
    


    localStorage['pattern']=JSON.stringify(pattern)

    
    renderIncidents(getFilteredPayloads())






})




})