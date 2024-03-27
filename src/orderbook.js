'use strict'

const async = require('async');
const { OrderTypes, OrderStatus } = require('./enum');

class OrderBook {
    constructor(clientID) {
        this.clientID = clientID;
        this.buyOrders = [];
        this.sellOrders = [];

        // Create a queue with a concurrency of 1 to ensure only one order is processed at a time
        this.orderQueue = async.queue((task, done) => {
            this.processOrder(task.order);
            done(task.order);
        }, 1);
    }

    done = order => {
        order.status = OrderStatus.SUCCESS
    }

    addOrder = order => {
        // Add order to the appropriate list and sort
        const list = order.type === OrderTypes.BUY ? this.buyOrders : this.sellOrders;
        list.push(order);
        this.sortOrders(list, order.type);

        // Try to match orders if they're from different 
        this.matchOrders();
    }

    sortOrders = (list, type) => {
        // Sort buy orders in descending order of price, sell orders in ascending order
        if (type === OrderTypes.BUY) {
            list.sort((a, b) => b.price - a.price);
        } else {
            list.sort((a, b) => a.price - b.price);
        }
    }


    processOrder = order => {
        if (order.type === OrderTypes.BUY) {
            return matchBuyOrder(order);
        } else {
            return matchSellOrder(order);
        }
    }

    matchBuyOrder = order => {
        order.quantity -= 1;
        return order;
    }

    matchOrder = order => {
        // Match BUY order against SELL orders, and vice versa
        const list = order.type === OrderTypes.BUY ? this.sellOrders : this.buyOrders;

        // While there are orders to match
        while (list.length > 0) {
            const matchingOrder = list[0];

            // If the top buy order price is at least the top sell order price
            if (buyOrder.price >= sellOrder.price) {
                const quantity = Math.min(buyOrder.quantity, sellOrder.quantity);

                // Update quantities
                buyOrder.quantity -= quantity;
                sellOrder.quantity -= quantity;

                // Remove the order from the list if it is fully matched
                if (buyOrder.quantity === 0) this.buyOrders.shift();
                if (sellOrder.quantity === 0) this.sellOrders.shift();

                // Here you would handle the transfer of assets between clients
            } else {
                // No more matches can be made
                break;
            }
        }
    }


}

module.exports = OrderBook;
