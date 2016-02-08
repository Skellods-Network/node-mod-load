'use strict';

var fs = require('fs');
var path = require('path');

var nml = require('./nml-class.h.js');


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
};

nml.prototype.addDir = function f_nml_addDir($dir, $sync) {

    var self = this;
    var work = function ($res, $rej) {

        var addResults = function ($err, $files) {

            if ($err) {

                $rej($err);
                return;
            }

            if (!Array.isArray($files)) {

                $files = [];
            }

            var i = 0;
            var l = $files.length;
            if ($sync) {

                while (i < l) {

                    self.addPath($files[i], $sync);
                    i++;
                }
            }
            else {

                var proms = [];
                while (i < l) {

                    proms.push(self.addPath(path.normalize($dir + path.sep) + $files[i], $sync));
                    i++;
                }

                Promise.all(proms.map(reflect)).then($r => {

                    var r = [];
                    var i = 0;
                    var l = $r.length;
                    while (i < l) {

                        if ($r[i].resolved) {

                            r.push($r[i].v);
                        }
                        else if ($r[i].e.substr(0,21) !== 'Not stupidly Loadable') {

                            $rej($r[i].e);
                        }

                        i++;
                    }

                    $res(r);
                }, $rej);
            }

            return $files;
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
