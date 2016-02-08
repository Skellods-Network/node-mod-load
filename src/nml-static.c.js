'use static';

var nmlC = require('./nml.h.js');

var nmlO = nmlC('_default');

nmlC.libs = nmlO.libs;
nmlC.versions = nmlO.versions;

var i = 0;
var k = Object.getOwnPropertyNames(nmlO.__proto__);
var l = k.length;
var tmp = '';
while (i < l) {

    tmp = k[i];
    if (tmp !== 'constructor') {

        nmlC[tmp] = nmlO[tmp].bind(nmlO);
    }

    i++;
}
