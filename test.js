'use strict';

const tap = require('tap');

const nml = require('.');
const libs = nml.libs;


console.log('\n  Node-Mod-Load\n\n  A node module loader! -> TESTSUITE\n');

tap.test('Get package info', $t => {

    $t.plan(3);

    nml.getPackageInfo('.').then($info => {

        $t.ok($info.version);
    }, $err => {

        $t.fail($err);
    });

    nml.getPackageInfo('./does/not/exist').then(() => {

        $t.fail('Found non-existent package.json');
    }, () => {

        $t.ok(true);
    });

    nml.getPackageInfo('./test-modules/error').then(() => {

        $t.fail('Malformed package.json was accepted');
    }, () => {

        $t.ok(true);
    });
});

tap.test('addMeta', $t => {

    $t.plan(2);

    nml.addMeta('foo', {foo: true,});
    $t.ok(libs.foo && libs.foo.foo);

    $t.notOk(nml.addMeta('foo', {foo: true,}));

    $t.end();
});

tap.test('addPath Module', $t => {

    $t.plan(1);

    nml.addPath('./test-modules/bar.js').then(($mod) => {

        $t.ok($mod === 'bar' && libs.bar && libs.bar.bar);
    }, ($err) => {

        $t.fail($err);
    });
});

tap.test('addPath Package', $t => {

    $t.plan(2);

    nml.addPath('./test-modules/baz').then(($mod) => {

        $t.ok($mod === 'baz' && libs.bar && libs.bar.bar);
        $t.ok(nml.versions[$mod] === '1.0.0');
    }, ($err) => {

        $t.fail($err);
        $t.end();
    });
});

tap.test('addPath Folder', $t => {

    $t.plan(1);

    nml.addPath('./test-modules/qux').then(($mod) => {

        $t.ok($mod === 'qux' && libs.bar && libs.bar.bar === true);
    }, ($err) => {

        $t.fail($err);
    });
});

tap.test('addDir', $t => {

    $t.plan(1);

    const n2 = nml('N2');
    n2.addDir('./test-modules').then($res => {

        $t.equal($res.length, 4);
    }, $err => {

        $t.fail($err);
    });


    /* todo: sync tests
    const n3 = nml('N3');
    try {

        let ret = n3.addDir('./test-modules', true);
    }
    catch ($err) {

        console.log($err);
    }


    $t.equal(n3.libs.length, 3);

    n3.addDir('./test-modules', true);
    */
});

tap.test('test namespace separation', $t => {

    $t.plan(3);

    const n1 = nml('N1');
    process.nextTick(() => {

        // at this point, at least _default.foo should exist
        // but the namespace N1 should be empty
        $t.ok(Object.keys(n1.libs).length == 0);

        n1.addMeta('n1', { n1: true, });
        $t.notOk(libs.n1);


        const testNS = nml('N1');
        $t.ok(testNS.libs.n1 && testNS.libs.n1.n1 === true);

        $t.end();
    });
});
