'use strict';

var nml = require('./nml-class.h.js');


nml.prototype.addMeta = function f_nml_addMeta($name, $obj) {

    this.libs[$name] = $obj;
};
