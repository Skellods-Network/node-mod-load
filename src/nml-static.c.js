'use strict';

const nmlC = require('./nml.h.js');

const nmlO = nmlC('_default');

nmlC.libs = nmlO.libs;
nmlC.versions = nmlO.versions;

let i = 0;
const k = Object.getOwnPropertyNames(nmlO.__proto__);
const l = k.length;
let tmp = '';
while (i < l) {

    tmp = k[i];
    if (tmp !== 'constructor') {

        nmlC[tmp] = nmlO[tmp].bind(nmlO);
    }

    i++;
}
