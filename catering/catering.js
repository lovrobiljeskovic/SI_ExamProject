class Catering {
    constructor(cateringId, name, typeOfFood, address) {
        this.cateringId = cateringId
        this.name = name
        this.typeOfFood = typeOfFood
        this.address = address
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



module.exports = Catering;