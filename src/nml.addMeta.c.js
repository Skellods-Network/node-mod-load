'use strict';

const nml = require('./nml-class.h.js');


nml.prototype.addMeta = function f_nml_addMeta($name, $obj) {

    if (!this.libs[$name]) {

        this.versions[$name] = typeof undefined;
        this.info[$name] = {};
        return !!(this.libs[$name] = $obj);
    }
    else {

        return false;
    }
};
