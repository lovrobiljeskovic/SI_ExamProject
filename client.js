var express = require('express')
var cors = require('cors')
var session = require('express-session')
const env = process.env;
const sessionStore = new session.MemoryStore();
const app = express()

const MQService = require('./services/MQService');

const port = 3050
const mqHost = env.MQ_HOST || 'amqp://localhost';

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

app.get('/hotel/:hotelId/rooms', async function (req, res) {
    if (!req.params.hotelId) {
        return res.status(422).json('invalid hotelId', req.params.hotelId);
    }
    if (!req.query.startDate || !req.query.endDate) {
        return res.status(422).json('invalid dates', req.query);
    }

    mqService.rooms(req.sessionID, req.params.hotelId, req.query.startDate, req.query.endDate)
    res.sendStatus(202)
})

app.get('/hotel/:hotelId/rooms/results', function (req, res) {
    return sendPollResponse(req, res, 'rooms_' + req.params.hotelId);
})


app.get('/booking', async function (req, res) {
    for (let val of ['eventId', 'startDate', 'endDate', 'roomIds', 'passportNumber']) {
        if (!req.query[val]) {
            return res.status(422).json('invalid', val, req.query[val]);
        }
    }
    mqService.createBooking(req.sessionID, req.query.eventId, req.query.startDate, req.query.endDate, req.query.roomIds, req.query.passportNumber);
    res.sendStatus(202);
});


app.get('/booking/results', function (req, res) {
    return sendPollResponse(req, res, 'bookingSuccess');
})


app.get('/booking/:eventId', async function (req, res) {
    if (!req.params.eventId) {
        return res.status(422).json('invalid eventId', req.params.eventId);
    }
    mqService.findBookings(req.sessionID, req.params.eventId);
    res.sendStatus(202);
});

app.get('/booking/:eventId/results', function (req, res) {
    return sendPollResponse(req, res, 'bookings_' + req.params.eventId);
});

app.listen(port, async () => {
    await mqService.connection(mqHost);
    await mqService.onHotelAvailability(async (data) => {
        await setSessionData(data.sessionID, { hotels: data.hotels });
    })

    await mqService.on('roomsResults', async data => {
        console.log('roomsResult', data);
        let payload = {};
        payload['rooms_' + data.hotelId] = data.rooms;

        await setSessionData(data.sessionID, payload);
    });

    await mqService.on('bookingResults', async data => {
        await setSessionData(data.sessionID, { bookingSuccess: data.success });
    });

    await mqService.on('bookingListResults', async data => {
        let payload = {};
        payload['bookings_' + data.eventId] = data.bookings;
        await setSessionData(data.sessionID, payload);
    });

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

async function setSessionData(id, data) {
    let ses = await getSession(id);
    for (let key in data) {
        ses[key] = data[key];
    }
    await setSession(id, ses);
}


function sendPollResponse(req, res, key) {
    var value = req.session[key]
    if (value) {
        delete req.session[key];
        res.send(value);
    } else {
        res.sendStatus(204);
    }
}