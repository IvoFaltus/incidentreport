const renderIncidents = (list) => {


    if (!list) {
        return
    }
    $(".list").html("")

    for (let obj of list) {
        if (Object.keys(obj).length === 0) { continue }

        const el = $("<div></div>")
        el
            .addClass("card")
            .html(`
    <p><strong>Name:</strong> ${obj.reportName}</p>
    <p><strong>Location:</strong> ${obj.location}</p>
    <p><strong>Category:</strong> ${obj.category}</p>
    <p><strong>Email:</strong> ${obj.reportEmail}</p>
    <p><strong>GPS:</strong> ${obj.gps}</p>
`)


        $(".list").append(el);



    }
}




export { renderIncidents }