const host = "http://softfall2019-si.software:30427"
const cateringUrl = `${host}/catering`;
const facilityUrl = `${host}/facility`;
const eventUrl = `${host}/event`;
const accomodationUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

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

    let roomsForm = document.getElementById('accomodationRoomsForm');
    let passportId = null;
    let hotelId = null;
    let roomIds = null;
    let accFrom = null;
    let accTo = null;
    if (roomsForm.style.visibility !== 'hidden') {
        if (!roomsForm.reportValidity()) return; // errors should be shown

        let ckbxs = document.querySelectorAll('input[name="accRoomIdCkbx"]:checked')
        if (!ckbxs.length) {
            alert('Select at least one room');
            return;
        }

        passportId = document.getElementById('accPassportNumber').value;
        hotelId = document.getElementById('accHotelId').value;
        roomIds = Array.from(ckbxs).map(c => parseInt(c.value));
        accFrom = parseDate(document.getElementById('accFrom').value);
        accTo = parseDate(document.getElementById('accTo').value);
    }

    console.log('passport', passportId, 'hotel', hotelId, 'rooms', roomIds);
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
            await createBooking(eventId, accFrom, accTo, roomIds, passportId);
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
    removeAccomodation();
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

    toggleAccomodationSection(false);
    await fetch(`${accomodationUrl}/hotel/availability?startDate=${from}&endDate=${to}&city=${city}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch(e => {
        toggleAccomodationSection(true)
        throw e;
    });

    try {
        let hotels = await poll(`${accomodationUrl}/hotel/availability/results`, {
            method: 'GET'
        });
        console.log('response h', hotels);
        showHotels(hotels);
    } finally {
        toggleAccomodationSection(true);
    }
}

async function searchRooms(e) {
    let hotelId = parseInt(e.target.getAttribute('data-hotel-id'));
    console.log('searchRooms', hotelId);
    if (!hotelId) return;

    let from = parseDate(document.getElementById('accFrom').value);
    let to = parseDate(document.getElementById('accTo').value);

    toggleAccomodationSection(false);
    await fetch(`${accomodationUrl}/hotel/${hotelId}/rooms?startDate=${from}&endDate=${to}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch(e => {
        toggleAccomodationSection(true)
        throw e;
    });

    try {
        let rooms = await poll(`${accomodationUrl}/hotel/${hotelId}/rooms/results`, {
            method: 'GET'
        });
        console.log('response h', rooms);
        showRooms(hotelId, rooms);
    } finally {
        toggleAccomodationSection(true);
    }
}

async function createBooking(eventId, from, to, roomIds, passportId) {
    toggleAccomodationSection(false);

    let rooms = roomIds.map(r => 'roomIds=' + r).join("&");
    await fetch(`${accomodationUrl}/booking?startDate=${from}&endDate=${to}&eventId=${eventId}&passportNumber=${passportId}&${rooms}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).catch(e => {
        toggleAccomodationSection(true)
        throw e;
    });

    try {
        let success = await poll(`${accomodationUrl}/booking/results`, {
            method: 'GET'
        });
        return success;
    } finally {
        toggleAccomodationSection(true);
    }
}

async function getBookings(eventId) {

    await fetch(`${accomodationUrl}/booking/${eventId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    let bookings = await poll(`${accomodationUrl}/booking/${eventId}/results`, {
        method: 'GET'
    });
    return bookings;

}

function removeAccomodation() {
    for (let id of ['accomodationRoomsForm', 'accomodationHotelTable']) {
        let el = document.getElementById(id);
        el.style.visibility = 'hidden';
    }
}

function toggleAccomodationSection(set) {
    let form = document.querySelector('form.accomodation-availability-form');
    for (let c of form.children) {
        if (set) c.removeAttribute('disabled');
        else c.setAttribute('disabled', true);
    }
    let header = document.querySelector('#accommodationSelector h2')
    if (set) header.classList.remove('loading')
    else header.classList.add('loading')
}

function showHotels(hotels) {
    let table = document.getElementById('accomodationHotelTable');
    let body = document.querySelector('#accomodationHotelTable tbody');

    let td, btn;

    while (body.children.length > 1) {
        body.removeChild(body.lastChild);
    }

    for (let hotel of hotels) {
        let row = document.createElement('tr');

        td = document.createElement('td');
        td.innerHTML = hotel.Name;
        row.appendChild(td);

        td = document.createElement('td');
        td.innerHTML = hotel.Address;
        row.appendChild(td);

        td = document.createElement('td');
        td.innerHTML = hotel.DistanceToCenter;
        row.appendChild(td);

        td = document.createElement('td');
        btn = document.createElement('button');
        btn.innerHTML = 'Browse rooms';
        btn.setAttribute('name', 'accSearchRoomsBtn')
        btn.setAttribute('data-hotel-id', hotel.ID);
        td.appendChild(btn);
        row.appendChild(td);

        body.appendChild(row);
    }
    table.style.visibility = 'visible';
}

function showRooms(hotelId, rooms) {
    let form = document.querySelector('#accomodationRoomsForm');
    let hotelIdEl = document.querySelector('#accomodationRoomsForm > input')
    let body = document.querySelector('#accomodationRoomsTable tbody');
    hotelIdEl.setAttribute('value', hotelId);

    let td, ckbx;

    while (body.children.length > 1) {
        body.removeChild(body.lastChild);
    }

    for (let room of rooms) {
        let row = document.createElement('tr');

        td = document.createElement('td');
        td.innerHTML = room.RoomType;
        row.appendChild(td);

        td = document.createElement('td');
        td.innerHTML = room.Capacity;
        row.appendChild(td);

        td = document.createElement('td');
        td.innerHTML = room.Price;
        row.appendChild(td);

        td = document.createElement('td');
        ckbx = document.createElement('input');
        ckbx.setAttribute('type', 'checkbox');
        ckbx.setAttribute('name', 'accRoomIdCkbx')
        ckbx.setAttribute('value', room.ID);
        td.appendChild(ckbx);
        row.appendChild(td);

        body.appendChild(row);
    }
    form.style.visibility = 'visible';
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

    document.addEventListener('click', (e) => {
        if (e.target.name === 'accSearchRoomsBtn') searchRooms(e);
    });
}());