'use strict';

const OrderBook = require('./orderbook');
const { PeerRPCClient, PeerRPCServer } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');

// Client instance with its own orderbook
class Client {
  constructor(clientId, port) {

    this.clientId = clientId
    this.orderBook = new OrderBook();

    const link = this.initializeLink();
    this.initializeServer(link, port);
    this.client = this.initializeClient(link);
  }

  initializeLink = () => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001',
      requestTimeout: 10000
    })
    link.start();

    return link;
  }

  initializeServer = (link, port) => {
    const server = new PeerRPCServer(link, { timeout: 300000 });
    server.init();

    // Listen for incoming requests
    const service = server.transport('server');
    service.listen(port);

    // Announce service
    setInterval(() => {
      link.announce('distributed_exchange', service.port, {});
    }, 1000);

    service.on('request', (rid, key, order, handler) => {
      if (order.clientId !== this.clientId) {
        const returnedOrder = this.orderBook.processOrder(order);

        console.log(returnedOrder);
      }
      handler.reply(null, 'SUCCESS');
    });
  }

  initializeClient = link => {
    const client = new PeerRPCClient(link, {});
    client.init();

    return client;
  }

  submitOrder = order => {
    const clientOrder = { ...order, clientId: this.clientId };
    this.client.map('distributed_exchange', clientOrder, { timeout: 100000 }, (err, result) => {
      if (err) {
        throw err;
      }

      console.log('Placed order: ', order, ', got response: ', result);
    });
  }
}

module.exports = Client;
