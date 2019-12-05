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
    var obj = {}
    fetch('http://localhost:8080/event/all')
        .then(res => {
            return res.json()
        })
        .then(events => {
            
            events.forEach(async function (id) {
                let facil = await fetch('http://localhost:8080/facility/' + id)
                let catering = await fetch('http://localhost:8080/catering/' + id)
                obj[id] = { facilities: await facil.json(), caterings: await catering.json() }
            })
            
        })
        .then(() => {
            var keys = Object.keys(obj)
            console.log(keys)
            console.log(obj)
  
        })
}