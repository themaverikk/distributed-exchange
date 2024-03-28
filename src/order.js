const { v4: uuidv4 } = require('uuid');

class Order {
    constructor(type, quantity, clientId, price) {
        this.orderId = `${clientId}-${uuidv4()}`;
        this.type = type;
        this.quantity = quantity;
        this.clientId = clientId;
        this.price = price;
    }
}

module.exports = Order