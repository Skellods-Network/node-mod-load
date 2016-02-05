'use strict';

var nml = require('.');
var libs = nml.libs;


console.log('\n  Node-Mod-Load\n\n  A node module loader! -> TESTSUITE\n');

// Get package info
nml.getPackageInfo('.').then(($info) => {

    console.log('Test getPackageInfo:\t\t' + ($info.version ? 'OK' : 'ERROR'));
}, ($err) => {

    console.log('Test getPackageInfo:\t\tERROR - ' + $err);
});

// addMeta
nml.addMeta('foo', { foo: true, });
console.log('Test addMeta:\t\t\t' + ((libs.foo && libs.foo.foo === true) ? 'OK' : 'ERROR'));

// addPath Module
nml.addPath('./test-modules/bar.js').then(($mod) => {

    console.log('Test Module addPath:\t\t' + (($mod === 'bar' && libs.bar && libs.bar.bar === true) ? 'OK' : 'ERROR'));
}, ($err) => {

    console.log('Test Module addPath:\t\tERROR - ' + $err);
});

// addPath Package
nml.addPath('./test-modules/baz').then(($mod) => {

    console.log('Test Package addPath:\t\t' + (($mod === 'baz' && libs.bar && libs.bar.bar === true) ? 'OK' : 'ERROR'));
}, ($err) => {

    console.log('Test Package addPath:\t\tERROR - ' + $err);
});

// addPath Folder
nml.addPath('./test-modules/qux').then(($mod) => {

    console.log('Test Folder addPath:\t\t' + (($mod === 'qux' && libs.bar && libs.bar.bar === true) ? 'OK' : 'ERROR'));
}, ($err) => {

    console.log('Test Folder addPath:\t\tERROR - ' + $err);
});

// addDir
var n2 = nml('N2');
n2.addDir('./test-modules').then($res => {

    if ($res.length == 3) {

        console.log('Test addDir:\t\t\tOK');
    }
    else {

        console.log('Test addDir:\t\t\tERROR');
    }
}, $err => {

    console.log('Test addDir:\t\t\tERROR - ' + $err);
});

// test namespace separation
var n1 = nml('N1');
process.nextTick(() => {

    // at this point, at least _default.foo should exist
    // but the namespace N1 should be empty
    if (Object.keys(n1.libs).length > 0) {

        console.log('Test namespace separation:\tERROR');
        return;
    }
    
    n1.addMeta('n1', { n1: true, });
    if (libs.n1) {

        console.log('Test namespace separation:\tERROR');
        return;
    }

    var testNS = nml('N1');
    if (testNS.libs.n1 && testNS.libs.n1.n1 === true) {

        console.log('Test namespace separation:\tOK');
    }
    else {

        console.log('Test namespace separation:\tERROR');
    }
});
