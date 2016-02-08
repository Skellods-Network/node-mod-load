'use strict';

var NML = require('./nml-class.h.js');


var nst = {};

// This simple factory will become a full-fledged object thingy later on
module.exports = function ($namespace) {

    if (!nst[$namespace]) {

        var newNS = new NML($namespace);
        nst[$namespace] = newNS;
        return newNS;
    }
    else {

        return nst[$namespace];
    }
};
