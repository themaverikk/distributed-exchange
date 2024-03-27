'use strict'

const Client = require('./client');
const { OrderTypes, Currencies, OrderStatus } = require('./enum');
const Order = require('./order');

const clientA = new Client(1, 1024);
const clientB = new Client(2, 1025);
const order = new Order()

clientA.submitOrder({ type: OrderTypes.BUY, quantity: 10, price: 100, currency: Currencies.BTC, status: OrderStatus.PENDING });
clientB.submitOrder({ type: OrderTypes.SELL, quantity: 5, price: 100, currency: Currencies.ETH, status: OrderStatus.PENDING });

console.log('orders submitted');
