'use strict'

const async = require('async');
const util = require('util');
const { PeerRPCClient } = require('grenache-nodejs-ws');
const Link = require('grenache-nodejs-link');
const { OrderTypes } = require('./enum');

class OrderBook {
    constructor(clientId) {
        this.clientId = clientId;
        this.client = this.initializeClient();
        this.buyOrders = [];
        this.sellOrders = [];
    }

    initializeClient = () => {
        const link = new Link({
            grape: 'http://127.0.0.1:30001',
            requestTimeout: 10000
        });
        link.start();

        const client = new PeerRPCClient(link, {});
        client.init();

        return client;
    }

    updateOrder = order => {
        const list = order.type === OrderTypes.BUY ? this.buyOrders : this.sellOrders;

        const matchingOrderIndex = list.findIndex(o => o.orderId === order.orderId);

        if (matchingOrderIndex < 0) {
            return;
        }

        // if the order is fully filled, remove it from the list. Idealy we should just update it's status, but for simplicity, we just remove it
        if (order.quantity === 0) {
            console.log('Removing orderId:', order.orderId, 'from orderbook as its been filled');
            list.splice(matchingOrderIndex, 1);
        } else {
            list[matchingOrderIndex].quantity = order.quantity;
        }
    }


    processOrder = order => {
        if (order.type === OrderTypes.BUY) {
            this.matchBuyOrder(order);
        } else {
            this.matchSellOrder(order);
        }
    }


    matchBuyOrder = order => {
        while (this.sellOrders.length > 0 && order.quantity > 0 && order.price >= this.sellOrders[this.sellOrders.length - 1].price) {
            const matchedSellOrder = this.sellOrders[this.sellOrders.length - 1];
            const tradeQuantity = Math.min(order.quantity, matchedSellOrder.quantity);

            order.quantity -= tradeQuantity;
            matchedSellOrder.quantity -= tradeQuantity;

            if (matchedSellOrder.quantity === 0) {
                this.sellOrders.pop();
            }
            if (order.quantity === 0) {
                console.log('Order fulfilled, orderId:', order.orderId, ', price: ', matchedSellOrder.price, ', quantity:', tradeQuantity);
            } else {
                console.log('Order partially fulfilled, orderId:', order.orderId, ', price: ', matchedSellOrder.price, ', quantity:', tradeQuantity);
            }
        }

        this.client.request('client_' + order.clientId, order, { timeout: 10000 });
        return order;
    }


    matchSellOrder = order => {
        while (this.buyOrders.length > 0 && order.quantity > 0 && order.price <= this.buyOrders[this.buyOrders.length - 1].price) {
            const matchedBuyOrder = this.buyOrders[this.buyOrders.length - 1];
            const tradeQuantity = Math.min(order.quantity, matchedBuyOrder.quantity);

            order.quantity -= tradeQuantity;
            matchedBuyOrder.quantity -= tradeQuantity;

            if (matchedBuyOrder.quantity === 0) {
                this.buyOrders.pop();
            }

            if (order.quantity === 0) {
                console.log('Order fulfilled, orderId:', order.orderId, ', price:', order.price, ', quantity:', tradeQuantity);
            } else {
                console.log('Order partially fulfilled, orderId:', order.orderId, ', price:', order.price, ', quantity:', tradeQuantity);
            }
        }
        this.client.request('client_' + order.clientId, order, { timeout: 10000 });

        return order;
    }

    addOrder = order => {
        // Add order to the appropriate list and sort
        const list = order.type === OrderTypes.BUY ? this.buyOrders : this.sellOrders;
        list.push(order);
        this.sortOrders(list, order.type);
    }

    sortOrders = (list, type) => {
        // Sort buy orders in ascending order of price, sell orders in descending order
        if (type === OrderTypes.BUY) {
            list.sort((a, b) => a.price - b.price);
        } else {
            list.sort((a, b) => b.price - a.price);
        }
    }
}

module.exports = OrderBook;
