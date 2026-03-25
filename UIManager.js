const renderIncidents = (list) => {


    if (!list) {
        return
    }
    const listEl = document.querySelector(".list")
    if (!listEl) return
    listEl.innerHTML = ""

    for (let obj of list) {
        if (Object.keys(obj).length === 0) { continue }

        const el = document.createElement("div")
        el.classList.add("card")

        const reporterName = obj.reporterName ?? obj.reportName ?? ""
        const reporterEmail = obj.reporterEmail ?? obj.reportEmail ?? ""

        el.innerHTML = `
    <p><strong>Name:</strong> ${reporterName}</p>
    <p><strong>Location:</strong> ${obj.location}</p>
    <p><strong>Category:</strong> ${obj.category}</p>
    <p><strong>Email:</strong> ${reporterEmail}</p>
    <p><strong>GPS:</strong> ${obj.gps}</p>
`


        listEl.appendChild(el)



    }
}




export { renderIncidents }
