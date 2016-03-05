'use strict';

const config = require('./config.json');

module.exports = {
    port: config.port,
    RLocation: config.RLocation,
    scheduleString: config.scheduleString
}