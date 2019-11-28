const Facility = require('./facility')
const express = require('express')
const app = express()
const port = 3002
app.use(express.json())

function createFacilities() {
    var facilityList = []
    var facility1 = new Facility(1, "JustasFacility", "UselessStreet", 1)
    facility1.eventIds = [1, 2, 3] 
    var facility2 = new Facility(2, "PravienFacility", "PravienStreet", 420)
    facility2.eventIds = [10, 20, 30] 
    var facility3 = new Facility(3, "CphBusiness Lyngby", "Noregardsvej", 6000)
    facility3.eventIds = [100, 200, 300] 
    var facility4 = new Facility(4, "CphBusiness Soerne", "SomeStreet", 2000)
    facility4.addEventId(2)
    var facility5 = new Facility(5, "DTU", "AnotherStreet", 20000)
    facilityList.push(facility1, facility2, facility3, facility4, facility5)
    return facilityList
}


var facilities = createFacilities()

app.get('/', (req, res) => res.send(facilities))
app.get('/:eventId', function(req, res) {
    var returnList = []
    for(var i = 0; i< facilities.length; i++) {
        var bool = facilities[i].eventExists(req.params.eventId)
        if(bool) {
            returnList.push(facilities[i])
        }
    }
    res.send(returnList)
})

app.post('/facility/:facilityId', function(req, res) {
    for(var i = 0; i<facilities.length; i++) {
        if(facilities[i].facilityId == req.params.facilityId) {
            facilities[i].addEventId(req.body.eventId)
        }
    }

})

app.listen(port, () => console.log(`These are the facilities ${facilities}!`))