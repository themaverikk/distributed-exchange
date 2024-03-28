'use strict';

const OrderBook = require('./orderbook');
const { PeerRPCClient, PeerRPCServer } = require('grenache-nodejs-ws');
const Link = require('grenache-nodejs-link');

// Client instance with its own orderbook
class Client {
  constructor(clientId, port, orderQueue) {
    this.clientId = clientId;
    this.orderQueue = orderQueue;
    this.orderBook = new OrderBook(clientId);

    // service that will trigger fulfillment of order, it will add the order to an async queue with concurrency 1
    this.initService('order_submit_service', port, (rid, key, order, handler) => {
      if (order.quantity > 0 && order.clientId !== this.clientId) {
        this.orderQueue.push(order, order => {
          this.orderBook.processOrder(order);
        });
      }

      handler.reply(null, order);
    });

    // service that will update the orderBook after an order is fulfilled
    // TODO: configure separate port for this service
    this.initService('client_' + this.clientId, port + 10, (rid, key, order, handler) => {
      this.orderBook.updateOrder(order);
      handler.reply(null, order);
    });
  }

  initService = (serviceName, port, callback) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001',
      requestTimeout: 10000
    });
    link.start();

    const server = new PeerRPCServer(link, {});
    server.init();

    const service = server.transport('server');
    service.listen(port);

    setInterval(() => {
      link.announce(serviceName, service.port, {});
    }, 1000);

    service.on('request', callback);
  }

  initializeClient = () => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001',
      requestTimeout: 10000
    });
    link.start();

    this.client = new PeerRPCClient(link, {});
    this.client.init();
  }

  submitOrder = order => {
    // Add the order to local orderBook
    this.orderBook.addOrder(order);

    // call all the nodes of order submit service so that they can initiate the order fulfillment
    this.client.map('order_submit_service', order, { timeout: 10000 }, (err, result) => {
      if (err) {
        throw err;
      }
    });
  }
}

module.exports = Client;
