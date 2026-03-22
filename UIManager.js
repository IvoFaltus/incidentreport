const renderIncidents = (list)=>{


    if(!list){
        return
    }
$(".list").html("")

    for(let obj of list){
        if(Object.keys(obj).length === 0){continue}
console.log("rendered")

const el = $("<div></div>")
el
.addClass("card")
.html(`<p>${obj.location}</p> <p>${obj.category}</p> <p>${obj.reportEmail}</p> <p>${obj.reportName}</p><p>${obj.gps}</p>`)


$(".list").append(el);



    }
}




export {renderIncidents}