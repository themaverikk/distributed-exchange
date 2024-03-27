const { v4: uuidv4 } = require('uuid');

class Order {
    constructor(type, quantity, currency, clientId, price) {
        this.orderId = `${this.clientId}-${uuidv4()}`
        this.type = type
        this.quantity = quantity
        this.currency = currency
        this.clientId = clientId
        this.price = price
    }
}

module.exports = Order