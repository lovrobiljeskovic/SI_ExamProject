const host = "http://softfall2019-si.software:30427"
const cateringUrl = `${host}/catering`;
const facilityUrl = `${host}/facility`;
const eventUrl = `${host}/event`;
const localhost = "http://localhost";
const accomodationUrl = "http://localhost:3050";

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
        }).then(() => {
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



async function searchAvailability(e) {
    e.preventDefault();
    let from = parseDate(document.getElementById('accFrom').value);
    let to = parseDate(document.getElementById('accTo').value);
    let city = document.getElementById('accCity').value;
    if (!from || !to || !city) return;

    toggleAvailabilityForm(false);
    await fetch(`${accomodationUrl}/hotel/availability?startDate=${from}&endDate=${to}&city=${city}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch(e => {
        toggleAvailabilityForm(true)
        throw e;
    });

    try {
        let response = await poll(`${accomodationUrl}/hotel/availability/results`, {
            method: 'GET'
        });
        console.log('response h', response);
    } finally {
        toggleAvailabilityForm(true);
    }
}

function toggleAvailabilityForm(set) {
    let form = document.querySelector('form.accomodation-availability-form');
    for (let c of form.children) {
        if (set) c.removeAttribute('disabled');
        else c.setAttribute('disabled', true);
    }
}

function setToDate() {
    let from = parseDate(document.getElementById('accFrom').value);
    if (!from) return;
    from.setDate(from.getDate() + 1);
    document.getElementById('accTo').value = formatDate(from);
}

function formatDate(date) {
    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
}

function parseDate(str) {
    let parts = str.split("-");
    if (parts.length != 3) return null;
    let d = new Date();
    d.setFullYear(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
    return d;
    //return new Date(str);
}

async function poll(url, options, timeout = 10000) {
    return new Promise((resolve, reject) => {
        let start = new Date().getTime();
        let id = setInterval(cb, 800);
        async function cb() {
            if (new Date().getTime() - start > timeout) {
                return reject(new Error('Polling timed out after ' + timeout + 'MS'))
            }

            let response = await fetch(url, options).catch(e => {
                clearInterval(id);
                return reject(e);
            });
            console.log('response', response);
            if (response.ok && response.status !== 204) {
                clearInterval(id);
                return resolve(response.json());
            }
        };
    });
}


(function () {
    document.getElementById('accFrom').value = formatDate(new Date());
    setToDate();
}());