async function getInputValues(){

    var res = getCatering();
    return await res;
}


async function getCatering(){
    await fetch("http:localhost:3009/")
    .then(res => {
        return res.json();
    })
    .then(caterings => {
        console.log(caterings)
        var cateringDOM = document.getElementById("catering");
        cateringDOM.innerHTML = ""
        caterings.forEach( (catering) => {
            cateringDOM.innerHTML += '<option value="' + catering.cateringId + '" label="'+catering.name+'"> ' + catering.name + ' </option>'
        })
            
         
    }).then( () => {
        return getFacilities();
    }).catch (e => {
        alert(e);
    })
}

async function getFacilities(){
    await fetch("http:localhost:3008/")
    .then(res => {
        return res.json();
    })
    .then(facilities => {
        console.log(facilities)
        var cateringDOM = document.getElementById("facility");
        cateringDOM.innerHTML = ""
        facilities.forEach( (facility) => {
            cateringDOM.innerHTML += '<option value="' + facility.facilityId + '" label="'+facility.name+'"> ' + facility.name + ' </option>'
        })
    }).then( () => {
        return "success";
    }).catch (e => {
        alert(e);
    })
}

function submitForm(){
    var catering = document.getElementById("catering");
    var selectedCatering = catering.options[catering.selectedIndex];
    var facility = document.getElementById("facility");
    var selectedFacility = facility.options[facility.selectedIndex];

    console.log(selectedCatering, selectedFacility)
    //yourSelect.options[ yourSelect.selectedIndex ].value
    console.log(selectedCatering.label , selectedCatering.value);
    
    console.log(selectedFacility.label, selectedFacility.value);


}