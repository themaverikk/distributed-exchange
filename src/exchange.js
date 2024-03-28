'use strict'

const async = require('async');
const Client = require('./client');
const { OrderTypes } = require('./enum');
const Order = require('./order');

const delay = delayInms => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};

const runExchange = async () => {
    // Create a queue with concurrency of 1 to ensure only one order is processed at a time
    const orderQueue = async.queue((order, completed) => {
        completed(order);
    }, 1);

    const clientA = new Client(1, 1024, orderQueue);
    const clientB = new Client(2, 1025, orderQueue);
    const clientC = new Client(3, 1026, orderQueue);

    await delay(3000);
    clientA.initializeClient();
    clientB.initializeClient();
    clientC.initializeClient();

    await delay(3000);

    clientB.submitOrder(new Order(OrderTypes.SELL, 2, clientB.clientId, 99));
    clientB.submitOrder(new Order(OrderTypes.SELL, 2, clientB.clientId, 95));

    clientC.submitOrder(new Order(OrderTypes.SELL, 3, clientC.clientId, 94));
    clientC.submitOrder(new Order(OrderTypes.SELL, 3, clientC.clientId, 93));

    clientA.submitOrder(new Order(OrderTypes.BUY, 10, clientA.clientId, 100));
}

runExchange();
