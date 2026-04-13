const renderIncidents = (list) => {
console.log(list)

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

        const reporterEmail = obj.reporterEmail ?? obj.reportEmail ?? "---"

        el.innerHTML = `
    <p><strong>Name:</strong> ${obj.reporter_name ?? "---"}</p>
    <p><strong>Location:</strong> ${obj.location ?? "---"}</p>
    <p><strong>Category:</strong> ${obj.category ?? "---"}</p>
    <p><strong>Email:</strong> ${obj.reporter_email ?? "---"}</p>
    <p><strong>GPS:</strong> ${obj.gps ?? "---"}</p>
    <p><strong>Created at:</strong> ${obj.created_at ?? "---"}</p>
`


        listEl.appendChild(el)



    }
}




export { renderIncidents }
