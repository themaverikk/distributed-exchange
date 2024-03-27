const OrderTypes = {
    BUY: 'buy',
    SELL: 'sell'
}

const OrderStatus = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILURE: 'failure'
}

const Currencies = {
    BTC: 'bitcoin',
    ETH: 'etherium',
    USD: 'united states dollor'
}

module.exports = {
    OrderStatus,
    OrderTypes,
    Currencies
}