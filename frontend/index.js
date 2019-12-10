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

    var eventName = document.getElementById("eventName");
    var name = eventName.value;

    var catering = document.getElementById("cateringSelector");
    var facility = document.getElementById("facilitySelector");

    var select = catering.querySelector("select");
    var selectedCatering = [].map.call(select.selectedOptions, function (option) {
        return option.value;
    }); 

    var select1 = facility.querySelector("select");
    var selectedFacility = [].map.call(select1.selectedOptions, function (option) {
        return option.value;
    }); 
    console.log("http://localhost:8080/event/" + name)
    fetch("http://localhost:8080/event/" + name, {
        method: 'POST',
        body: null, // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            return res.json()
        })
        .then(res => {
            return res.id;
        })
        .then(async eventId => {
            for (i in selectedFacility){
                await addEventToResources("http://localhost:8080/facility/", selectedFacility[i], eventId)
            }
            for (index in selectedCatering){
                await addEventToResources("http://localhost:8080/catering/", selectedCatering[index], eventId)
            }
            return "succes";
        })
        .then( () => {
            clearAllValues();
        }).catch((e) => {
            console.log(e)
        })


}

function clearAllValues(){
    document.getElementById("catering").options.selectedIndex = -1;
    document.getElementById("facility").options.selectedIndex = -1;
    document.getElementById("eventName").value = "";
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
            for (var i = 0; i < res.length; i++) {
                let facil = await fetch('http://localhost:8080/facility/' + res[i].id)
                let cater = await fetch('http://localhost:8080/catering/' + res[i].id)
                let facility = await facil.json();
                let catering = await cater.json();
                eventList.push({ event: {id : res[i].id, name: res[i].name }, facilities: await facility, caterings: await catering });
                GLOBAL_EVENTS[res[i].id] = { name: res[i].name, facilities: await facility, caterings: await catering };
            }
            return eventList;
        })
        .then(events => {
            console.log(events)
            var table = document.getElementById("mytable");
            table.innerHTML = "";
            table.innerHTML = "<tr> <th> name </th> <th> eventId </th> <th> facility </th> <th> catering </th> <th> </th> </tr>"
            //console.log(obj.events.events.length);
            for (var i = 0; i < events.length; i++) {
                table.innerHTML += "<tr> <td>" + events[i].event.name + "</td> <td> " + events[i].event.id + "</td>" + "<td> " + events[i].facilities[0].name + "</td> <td> " + events[i].caterings[0].name + "</td> <td> <center> <button onClick='getSingleEvent(" + events[i].event.id + ")'> show </button> </center> </td> </tr>"
            }

        })
}

function getSingleEvent(id) {
    document.getElementById('singleevent').innerHTML = `
    <div class="greyborder" style="padding-bottom: 2%; !important">
    <a> Name: </a> <a id="eventname"></a> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <a> Id: </a> <a id="eventid"> </a> <br> <br>
    <a>Facilities: </a>
    <table id="facilities">
    </table>
    <br>
    <a>Caterings: </a>
    <table id="caterings" style="padding-bottom: 5%;">
    </table></div>`

    var eventnameDOM = document.getElementById('eventname');
    var eventidDOM = document.getElementById('eventid');
    var facilitiesDOM = document.getElementById('facilities');
    var cateringDOM = document.getElementById('caterings');
    var event = GLOBAL_EVENTS[id];
    eventidDOM.innerHTML = id
    eventnameDOM.innerText = GLOBAL_EVENTS[id].name;
    facilitiesDOM.innerHTML = "<tr> <th> name </th> <th> address </th> <th> capacity </th> </tr>"
    event.facilities.forEach((facility) => {
        facilitiesDOM.innerHTML += "<tr> <td>" + facility.name + "</td>  <td>" + facility.address + "</td> <td>" + facility.capacity + "</td> </tr>"
    })
    cateringDOM.innerHTML = "<tr> <th>name </th> <th> address </th> <th> food type </th> </tr>"
    event.caterings.forEach((catering) => {
        cateringDOM.innerHTML += "<td> " + catering.name + "</td>  <td> " + catering.address + "</td> <td> " + catering.typeOfFood + "</td>"
    })

    console.log(GLOBAL_EVENTS[id] , id)



}

function getGlobalEvents() {
    return GLOBAL_EVENTS;
}