Things to be taken care of (didn't do it in the interest of time)

1.  Support for currency in orders
2. The race conditions are not handled properly. The logic to handle them can be as follows
    - If the order O was submitted by client C, then Client C orderbook will be the source of truth for Order O.
    - Each client will register two workers, one for returning details for a given OrderID (`client_c_order_state_service`), another for updating an order with given orderID (`client_c_order_update_service`)
    - When order O is received by client C, it will distribute it to workers registered as `order_submit_service`
    - Each worker will push the order to a shared `async.queue` with concurrency 1, it will check the remaining quantity of Order O by calling Client C (`client_c_order_state_service`)
    - In case it's possible to partially/fully fill the order using the local orderBook, then the order will be filled, and the status will be updated to client C (`client_c_order_update_service`)