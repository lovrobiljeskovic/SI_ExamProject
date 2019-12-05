const Catering = require('./catering')
const express = require('express')
const app = express()
const port = 3009
app.use(express.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

function createCaterings() {
    var cateringList = []
    var catering1 = new Catering(1,"Justas Catering", "sea food", "JustasStreet")
    catering1.eventIds = [1, 2, 3]
    var catering2 = new Catering(2, "Pravien Catering", "burgers", "PravienStreet")
    catering2.eventIds = [10, 20, 30]
    var catering3 = new Catering(3, "Copenhagen Catering", "pastry", "Noregardsvej")
    catering3.eventIds = [100, 200, 300]
    var catering4 = new Catering(4, "Stockholm Catering", "italian", "Stockhom Street")
    var catering5 = new Catering(5, "Oslo Catering", "mexican", "Oslo Street")
    cateringList.push(catering1, catering2, catering3, catering4, catering5)
    return cateringList
}

var caterings = createCaterings()

app.get('/catering/', (req, res) => res.send(caterings))
app.get('/catering/:eventId', function(req, res) {
    var returnList = []
    for(var i = 0; i< caterings.length; i++) {
        var bool = caterings[i].eventExists(req.params.eventId)
        if(bool) {
            returnList.push(caterings[i])
        }
    }
    res.send(returnList)
})

app.post('/catering/:cateringId', function(req, res) {
    if(req.body.eventId === null || undefined) {
        res.sendStatus(422)
        return
    }
    for(var i = 0; i<caterings.length; i++) {
        if(caterings[i].cateringId == req.params.cateringId) {
            caterings[i].addEventId(req.body.eventId)
            res.sendStatus(200)
            return
        }
    }
    return res.sendStatus(422)

})
app.listen(port, () => console.log(`List of all caterings ${caterings}!`))