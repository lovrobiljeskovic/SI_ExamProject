const host = "http://softfall2019-si.software:30427"
const cateringUrl = `${host}/catering`;
const facilityUrl = `${host}/facility`;
const eventUrl = `${host}/event`;
const localhost = "http://localhost";

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
            return eventId;
        })
        .then(async eventId => {
            for (index in selectedCatering) {
                await addEventToResources(cateringUrl, selectedCatering[index], eventId)
            }
        }).then( () => {
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

function goBack() {
    window.history.back();
}

function redirect(eventid) {
    sessionStorage.setItem('eventid', eventid);
    window.location.href = "../html/event.html";
}



function getGlobalEvents() {
    return GLOBAL_EVENTS;
}



