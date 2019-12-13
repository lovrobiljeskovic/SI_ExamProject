const host = "http://softfall2019-si.software:30427"
const localhost = "http://localhost"
const cateringUrl = `${host}/catering`;
const facilityUrl = `${host}/facility`;
const eventUrl = `${host}/event`;
const participantURL = `http://localhost:8082`;

let GLOBAL_EVENTS = {};
let participantsList = [];


async function getSingleEvent() {
    let eventId = sessionStorage.getItem('eventid');
    var eventidDOM = document.getElementById('eventid');
    var facilitiesDOM = document.getElementById('facilitiesBody');
    var cateringDOM = document.getElementById('cateringsBody');
    var participantDOM = document.getElementById('participantsBody');
    eventidDOM.innerHTML = eventId

    let facil = await fetch(facilityUrl + '/' + eventId)
    let cater = await fetch(cateringUrl + '/' + eventId)
    let partici = await fetch(participantURL + "/" + eventId, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    let facility = await facil.json();
    let catering = await cater.json();
    let participants = await partici.json();
    console.log(participants)
    facility.forEach((facility) => {
        facilitiesDOM.innerHTML += "<tr> <td>" + facility.name + "</td>  <td>" + facility.address + "</td> <td>" + facility.capacity + "</td> </tr>"
    })

    catering.forEach((catering) => {
        cateringDOM.innerHTML += "<tr> <td> " + catering.name + "</td>  <td> " + catering.address + "</td> <td> " + catering.typeOfFood + "</td> </tr>"
    })

    participants.forEach((participant) => {
        //participantDOM.innerHTML += "<tr><td> " + participant.name + "</td>  <td> " + participant.email + "</td>" + "<td>" + "<center><button class='removeBtn' onClick=`${}`>X</button></center>"+"</td> </tr>"
        participantDOM.innerHTML += `<tr><td id='${participant.email}'> ${participant.name} </td>  <td> ${participant.email} </td><td><center><button class='removeBtn' onClick='removeParticipant(\"${participant.email}\")'>X</button></center> </td> </tr>`

    })

}

function redirect(eventid) {
    sessionStorage.setItem('eventid', eventid);
    window.location.href = "../html/event.html";
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
    let fetchArr = [];
    for (var i = 0; i < participantsList.length; i++) {
        let obj = {
            eventId: id,
            email: participantsList[i].Email,
            name: participantsList[i].Name
        }
        fetchArr.push(obj);
    }
    console.log(JSON.stringify(fetchArr))
    try {
        let res = await fetch('http://localhost:8082/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({participants: fetchArr})
        })
        let response = await res.json();
        if(await response.message == "success"){
            document.getElementById("participantBody").innerHTML = "";
            window.location.reload()
        }

    } catch{
        alert("somethign went wrong")
    }

}

function goBack() {
    window.history.back();
}

async function removeParticipant(mail) {
    console.log(mail)
    let id = sessionStorage.getItem('eventid');

    let partici = await fetch(participantURL + "/",
        {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: mail, eventId: id })
        })

    var res = await partici.json()
    console.log(res)
    if(res.message == "success"){
        window.location.reload();
    }else{
        alert(res.message)
    }

}