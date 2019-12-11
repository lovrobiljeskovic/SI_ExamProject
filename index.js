const host = "http://softfall2019-si.software:30427"
const cateringUrl = `${host}/catering`;
const facilityUrl = `${host}/facility`;
const eventUrl = `${host}/event`;

let GLOBAL_EVENTS = {};
let participantsList = [];

async function getInputValues() {
    var res = getCatering();
    return await res;
}

async function getCatering() {
    await fetch(cateringUrl)
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
    await fetch(facilityUrl)
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
    console.log(eventUrl + '/' + name)
    fetch(eventUrl + '/' + name, {
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
            for (i in selectedFacility) {
                await addEventToResources(facilityUrl, selectedFacility[i], eventId)
            }
            for (index in selectedCatering) {
                await addEventToResources(cateringUrl, selectedCatering[index], eventId)
            }
            return "succes";
        })
        .then(() => {
            clearAllValues();
        }).catch((e) => {
            console.log(e)
        })


}

function clearAllValues() {
    document.getElementById("catering").options.selectedIndex = -1;
    document.getElementById("facility").options.selectedIndex = -1;
    document.getElementById("eventName").value = "";
}

async function addEventToResources(url, resourceId, _eventId) {
    console.log(url + '/' + resourceId, _eventId)
    var response = await fetch(url + '/' + resourceId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId: _eventId })
    })
    console.log(await response.json())
}

async function getEvents() {

    fetch(eventUrl + '/all')
        .then(res => {
            return res.json()
        })
        .then(async res => {
            console.log(res)
            var eventList = [];
            for (var i = 0; i < res.length; i++) {
                let facil = await fetch(facilityUrl + '/' + res[i].id)
                let cater = await fetch(cateringUrl + '/' + res[i].id)
                let facility = await facil.json();
                let catering = await cater.json();
                eventList.push({ event: { id: res[i].id, name: res[i].name }, facilities: await facility, caterings: await catering });
                GLOBAL_EVENTS[res[i].id] = { name: res[i].name, facilities: await facility, caterings: await catering };
            }
            return eventList;
        })
        .then(events => {
            console.log(events)
            var table = document.getElementById("mytable");
            table.innerHTML = "";
            let tableString;
            tableString = "<tr> <th> Name </th> <th> Event id </th> <th> Facility </th> <th> Catering </th> <th> </th> </tr>"
            //console.log(obj.events.events.length);
            for (var i = 0; i < events.length; i++) {
                try {
                    tableString += "<tr> <td>" + events[i].event.name + "</td> <td> " + events[i].event.id + "</td>" + "<td> " + events[i].facilities[0].name + "</td> <td> " + events[i].caterings[0].name + "</td> <td> <center> <button class='niceButton' onClick='redirect(" + events[i].event.id + ")'> show </button> </center> </td> </tr>"
                } catch{
                    continue;
                }
                if (i === events.length - 1) {
                    table.innerHTML += tableString;
                }
            }

        })
}

function goBack() {
    window.history.back();
}

function redirect(eventid) {
    sessionStorage.setItem('eventid', eventid);
    window.location.href = "event.html";
}

async function getSingleEvent() {
    let eventId = sessionStorage.getItem('eventid');
    var eventidDOM = document.getElementById('eventid');
    var facilitiesDOM = document.getElementById('facilitiesBody');
    var cateringDOM = document.getElementById('cateringsBody');
    var participantDOM = document.getElementById('participantsBody');
    eventidDOM.innerHTML = eventId

    let facil = await fetch(facilityUrl + '/' + eventId)
    let cater = await fetch(cateringUrl + '/' + eventId)
    //let partici = await fetch('http://localhost:8080/participants/' + eventId)
    let facility = await facil.json();
    let catering = await cater.json();
    //let participants = await partici.json();

    facility.forEach((facility) => {
        facilitiesDOM.innerHTML += "<tr> <td>" + facility.name + "</td>  <td>" + facility.address + "</td> <td>" + facility.capacity + "</td> </tr>"
    })

    catering.forEach((catering) => {
        cateringDOM.innerHTML += "<tr> <td> " + catering.name + "</td>  <td> " + catering.address + "</td> <td> " + catering.typeOfFood + "</td> </tr>"
    })

    /*
    participants.forEach((participant) => {
        participantDOM.innerHTML += "<tr><td> " + participant.name + "</td>  <td> " + participant.mail + "</td></tr>"
    })
    */

}

function getGlobalEvents() {
    return GLOBAL_EVENTS;
}

function addParticipant2List() {
    let name = document.getElementById("participantName").value
    let email = document.getElementById("participantEmail").value

    let participantDOM = document.getElementById("participantBody");

    participantDOM.innerHTML += "<tr> <td> " + name + "</td> <td> " + email + " </td> </tr>";
    participantsList.push({ Name: name, Email: email })

    document.getElementById("participantName").value = "";
    document.getElementById("participantEmail").value = "";
}

async function submitParticipants() {
    //let participants = document.getElementById("participantsBody")
    console.log(participantsList)
    let id = sessionStorage.getItem('eventid');
    for (var i = 0; i < participantsList.length; i++) {
        try {
            await fetch('http://localhost:8080/participant/' + id, {
                method: 'POST',
                body: JSON.stringify(participantsList[i])
            })
        } catch{
            alert("somethign went wrong")
        }

        if (i === participantsList.length - 1) {
            document.getElementById("participantBody").innerHTML = "";
        }

    }



}