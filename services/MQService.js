var amqp = require('amqplib/callback_api');



class MQService {
    constructor() {
        this.conn = null;
        this.channel = null;
        this.hotelAvailabilityQueue = null;
    }

    async connection(host) {
        return new Promise(async (resolv, reject) => {
            amqp.connect(host, async (error0, connection) => {
                if (error0) return reject(error0)
                else {
                    this.conn = connection;
                    this.channel = await this.createChannel()
                    //this.hotelAvailabilityQueue = await this.declareQueue("availability")
                    resolv(this)
                }
            });
        });
    }

    availability(sessionID, startDate, endDate, city, eventId) {
        return this.send('availability', { sessionID, startDate, endDate, city, eventId })
    }

    rooms(sessionID, hotelId, startDate, endDate) {
        return this.send('rooms', {
            sessionID,
            hotelId,
            startDate,
            endDate
        })
    }

    createBooking(sessionID, eventId, startDate, endDate, roomIds, passportNumber) {
        return this.send('booking', {
            sessionID, eventId, startDate, endDate, roomIds, passportNumber, numGuests: 0,
        });
    }

    findBookings(sessionID, eventId) {
        return this.send('bookingList', { sessionID, eventId });
    }

    async declareQueue(name) {
        return new Promise((resolv, reject) => {
            this.channel.assertQueue(name, {}, (error2, q) => {
                if (error2) return reject(error2);
                else resolv(q)

            });
        })
    }

    async onHotelAvailability(callback) {
        return this.on('availabilityResults', callback);

    }

    async on(queue, callback) {
        var q = await this.declareQueue(queue)

        this.channel.consume(q.queue, function (msg) {
            callback(JSON.parse(msg.content.toString()))
        }, {
            noAck: true
        });
    }

    async send(queue, data) {
        return this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data), 'utf8'), {});
    }

    async  createChannel() {
        return new Promise((resolv, reject) => {
            this.conn.createChannel(function (error1, channel) {
                if (error1) return reject(error1);
                else resolv(channel)
            })
        });
    }
}
module.exports = MQService;