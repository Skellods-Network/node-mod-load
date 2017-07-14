'use strict';

const fs = require('fs');
const path = require('path');

const nml = require('./nml-class.h.js');


// Slightly modified in syntax, but not logic-wise
// http://stackoverflow.com/a/31424853/1756880
function reflect($promise) {

    return $promise.then($v => {

        return {

            v: $v,
            resolved: true,
        };
    }, $e => {

        return {

            e: $e,
            resolved: false,
        };
    });
}

nml.prototype.addDir = function f_nml_addDir($dir, $sync) {

    const work = ($res, $rej) => {

        const addResults = ($err, $files) => {

            if ($err) {

                $rej($err);
                return;
            }

            if (!Array.isArray($files)) {

                $files = [];
            }

            let i = 0;
            const l = $files.length;
            const proms = [];
            while (i < l) {

                proms.push(this.addPath(path.normalize($dir + path.sep) + $files[i], $sync));
                i++;
            }

            if ($sync) {

                return proms;
            }

            Promise.all(proms.map(reflect)).then($r => {

                const r = [];
                let i = 0;
                const l = $r.length;
                let ok = true;

                while (i < l) {

                    if ($r[i].resolved) {

                        r.push($r[i].v);
                    }
                    else if ($r[i].e.substr(0, 21) !== 'Not stupidly Loadable') {

                        $rej($r[i].e);
                        ok = false;
                        break;
                    }

                    i++;
                }

                if (ok) {

                    $res(r);
                }
            }, $rej);
        };

        if ($sync) {

            return addResults(null, fs.readdirSync($dir));
        }
        else {

            fs.readdir($dir, addResults);
        }
    };

    if ($sync) {

        return work();
    }
    else {

        return new Promise(work);
    }
};
