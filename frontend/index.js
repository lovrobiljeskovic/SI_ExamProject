let GLOBAL_EVENTS = {};


async function getInputValues() {
    var res = getCatering();
    return await res;
}

async function getCatering() {
    await fetch("http://localhost:8080/catering/")
        .then(res => {
            return res.json();
        })
        .then(caterings => {
            console.log(caterings)
            var cateringDOM = document.getElementById("catering");
            cateringDOM.innerHTML = ""
            caterings.forEach((catering) => {
                cateringDOM.innerHTML += '<option value="' + catering.cateringId + '" label="' + catering.name + '"> ' + catering.name + ' </option>'
            })


        }).then(() => {
            return getFacilities();
        }).catch(e => {
            alert(e);
        })
}

async function getFacilities() {
    await fetch("http://localhost:8080/facility/")
        .then(res => {
            return res.json();
        })
        .then(facilities => {
            console.log(facilities)
            var cateringDOM = document.getElementById("facility");
            cateringDOM.innerHTML = ""
            facilities.forEach((facility) => {
                cateringDOM.innerHTML += '<option value="' + facility.facilityId + '" label="' + facility.name + '"> ' + facility.name + ' </option>'
            })
        }).then(() => {
            return "success";
        }).catch(e => {
            alert(e);
        })
}

function submitForm() {
    var id;

    var catering = document.getElementById("catering");
    var selectedCatering = catering.options[catering.selectedIndex];
    var facility = document.getElementById("facility");
    var selectedFacility = facility.options[facility.selectedIndex];


    fetch("http://localhost:8080/event/")
        .then(res => {
            return res.json()
        })
        .then(res => {
            id = res.id;
            return res.id;
        })
        .then(eventId => {
            console.log(eventId)
            addEventToResources("http://localhost:3002/facility/", selectedFacility.value, eventId)
            addEventToResources("http://localhost:8080/catering/", selectedCatering.value, eventId)
            return "succes";
        }).catch((e) => {
            console.log(e)
        })


}

async function addEventToResources(url, resourceId, _eventId) {
    console.log(url, resourceId, _eventId)
    var response = await fetch(url + resourceId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId: _eventId })
    })
    console.log(await response.json())
}

async function getEvents() {

    fetch('http://localhost:8080/event/all')
        .then(res => {
            return res.json()
        })
        .then(async res => {
            console.log(res)
            var eventList = [];
            for (var i = 0; i < res.length; i++){
                let facil = await fetch('http://localhost:8080/facility/' + res[i])
                let cater = await fetch('http://localhost:8080/catering/' + res[i])
                let facility = await facil.json();
                let catering = await cater.json();
                eventList.push({ eventId: res[i], facilities: await facility, caterings: await catering });
                GLOBAL_EVENTS[res[i]] = { facilities: await facility, caterings: await catering };
            }
            return eventList;
        })
        .then(events => {
            console.log("g: " + GLOBAL_EVENTS)
            console.log(events)
            var table = document.getElementById("mytable");
            table.innerHTML = "";
            table.innerHTML = "<tr> <th> eventId </th> <th> facility </th> <th> catering </th> <th> </th> </tr>"
            //console.log(obj.events.events.length);
            for (var i = 0; i < events.length; i++){
                console.log(events[i])
                table.innerHTML += "<tr> <td> " + events[i].eventId + "</td>" + "<td> " + events[i].facilities[0].name + "</td> <td> "+ events[i].caterings[0].name + "</td> <td> <center> <button onClick='getSingleEvent(" + events[i].eventId + ")'> show </button> </center> </td> </tr>"
               /* for (var j = 0; j < events[i].facilities.length;j++){
                    if(j === 0){
                        table.innerHTML += "<tr> <td> " + events[i].eventId + "</td>" + "<td> " + events[i].facilities[0].name + "</td> <td> "+ events[i].caterings[0].name + "</td> <td> <center> <button> show </button> </center> </td>"
                    }else{
                        table.innerHTML += "<tr> <td> " + "" + "</td>" + "<td> " + events[i].facilities[j].name + "</td> <td> "+ events[i].caterings[j].name + "</td>"

                    }
                }
                console.log(events[i].facilities.length)
                */
            }
            //var keys = Object.keys(obj)
            //console.log(keys)
            //console.log(obj)
  
        })
}


function redirect(eventid){
    window.location.href = "event.html?eventid="+eventid;
}

function getSingleEvent(id){
    document.getElementById('singleevent').innerHTML = `
    <div class="greyborder">
    <a> Event id: </a> <a id="eventid"> </a> <br> <br>
    <a>Facilities: </a>
    <dl id="facilities" style="list-style-type:circle;">
    </dl>
    <br>
    <a>Caterings: </a>
    <dl id="caterings">
    </dl></div>`


    var eventidDOM = document.getElementById('eventid');
    var facilitiesDOM = document.getElementById('facilities');
    var cateringDOM = document.getElementById('caterings');

    var event = GLOBAL_EVENTS[id];
    console.log(event)
    eventidDOM.innerHTML = id
    event.facilities.forEach( (facility) => {
        facilitiesDOM.innerHTML += "<dt> name: " + facility.name + "</dt>  <dt> address: " + facility.address + "</dt> <dt> capacity: " + facility.capacity + "</dt>"
    })
    event.caterings.forEach( (catering) => {
        cateringDOM.innerHTML += "<dt> name: " + catering.name + "</dt>  <dt> address:" + catering.address + "</dt> <dt> food: " + catering.typeOfFood + "</dt>"
    })

    console.log(GLOBAL_EVENTS[id])



}

function getGlobalEvents(){
    return GLOBAL_EVENTS;
}