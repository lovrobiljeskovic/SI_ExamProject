const host = "http://softfall2019-si.software:30427"
const cateringUrl = `${host}/catering`;
const facilityUrl = `${host}/facility`;
const eventUrl = `${host}/event`;
const localhost = "http://localhost"

let GLOBAL_EVENTS = {};
let participantsList = [];


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

function redirect(eventid) {
    sessionStorage.setItem('eventid', eventid);
    window.location.href = "../html/event.html";
}

function goBack() {
    window.history.back();
}