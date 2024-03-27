Things that need to be done
- Return order details once the order is matched
- Handle race condition to ensure a given order is only executed once, we'll use `link.lookup` method and call all the nodes one by one, in case any node responds that the order has been matched, other nodes will just ignore the given order.
