'use strict';

const nml = require('./nml-class.h.js');

const me = module.exports = {
    detect: [],
    load: [],
    error: [],

    fire: function ($ev) {
        me[$ev].forEach($h => $h.apply(undefined, Array.from(arguments).slice(1)));
    },
};

nml.prototype.on = function($event, $handler) {
    const ev = $event.toString();

    if (!me[ev]) {
        return;
    }

    if (me[ev].indexOf($handler) < 0) {
        me[ev].push($handler);
    }
};
