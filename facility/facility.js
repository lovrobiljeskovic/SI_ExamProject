class Facility {
    constructor(facilityId, name, address, capacity) {
        this.facilityId = facilityId
        this.name = name
        this.address = address
        this.capacity = capacity
        this.eventIds = []
    }

    addEventId(eventId) {
        this.eventIds.push(eventId)
    }

    eventExists(searchEventId) {
        for(var i of this.eventIds) {
            if(searchEventId == i) {
                return true
            }
        }
        return false
    }
}

module.exports = Facility;