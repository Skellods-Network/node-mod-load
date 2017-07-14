'use strict';

const nml = require('./nml-class.h.js');

const me = module.exports = {
    detect: [],
    load: [],
    error: [],

    fire: ($ev, ...args) => me[$ev].forEach($h => $h.apply(undefined, args)),
};

nml.prototype.on = function($event, $handler) {
    const ev = $event.toString();

    if (!me[ev]) {
        return;
    }

    if (!me[ev].includes($handler)) {
        me[ev].push($handler);
    }
};
