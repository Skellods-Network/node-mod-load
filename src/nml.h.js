'use strict';

var bst = require('binary-search-tree');

var NML = require('./nml-class.h.js');


var nst = null;

// This simple factory will become a full-fledged object thingy later on
module.exports = function ($namespace) {

    if (nst == null) {

        nst = new bst.BinarySearchTree({

            unique: true,
        });
    }

    var obj = nst.search($namespace);
    if (obj.length <= 0) {

        var newNS = new NML($namespace);
        nst.insert($namespace, newNS);
        return newNS;
    }
    else {

        return obj[0];
    }
};
