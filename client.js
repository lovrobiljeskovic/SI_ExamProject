var express = require('express')
var cors = require('cors')
var session = require('express-session')
const sessionStore = new session.MemoryStore();
const app = express()

const MQService = require('./services/MQService');

const port = 3050

let mqService = new MQService();

app.use(cors({
    origin: '*',
}))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
}))
app.use(express.static('public'))

app.get('/hotel/availability', async function (req, res) {
    mqService.availability(req.sessionID, req.query.startDate, req.query.endDate, req.query.city, req.query.eventId)
    res.sendStatus(202)
})

app.get('/hotel/availability/results', function (req, res) {
    var value = req.session.hotels
    if (value) {
        delete req.session.hotels;
        res.send(value);
    } else {
        res.sendStatus(204);
    }
})

app.listen(port, async () => {
    await mqService.connection('');
    await mqService.onHotelAvailability(async (data) => {
        let ses = await getSession(data.sessionID);
        ses["hotels"] = data.hotels;
        await setSession(data.sessionID, ses);
    })
})

async function getSession(id) {
    return new Promise((resolv, reject) => {
        sessionStore.get(id, (err, ses) => {
            if (err) reject(err);
            else resolv(ses);
        })
    })
}

async function setSession(id, session) {
    return new Promise((resolve, reject) => {
        sessionStore.set(id, session, err => {
            if (err) reject(err);
            else resolve();
        })
    })
}