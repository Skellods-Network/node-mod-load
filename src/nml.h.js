'use strict';

const NML = require('./nml-class.h.js');


const nst = {};

// This simple factory will become a full-fledged object thingy later on
module.exports = function ($namespace) {

    if (!nst[$namespace]) {

        const newNS = new NML($namespace);
        nst[$namespace] = newNS;
        return newNS;
    }
    else {

        return nst[$namespace];
    }
};
