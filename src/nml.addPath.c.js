'use strict';

var fs = require('fs');
var path = require('path');

var nml = require('./nml-class.h.js');


const ERR_DUPLICATE_NAME = 'A module with the same name has already been loaded: ';
const ERR_NOT_LOADABLE = 'A module could not be loaded by Node.JS: ';

function addSafe($name, $absPath) {

    if (!this.libs[$name]) {

        return (typeof (this.libs[$name] = require($absPath)) !== 'undefined') ? 0 : 2;
    }
    else {

        // I could throw here, but that would break addDir sync loops and be a pain for resolving promises
        // even if the error is non-fatal for the application itself
        // imho a good application should check the return values for possible problems
        return 1;
    }
};

nml.prototype.addPath = function f_nml_addPath($path, $sync) {
    
    var self = this;
    var work = function ($res, $rej) {

        var processStats = function ($err, $stats) {

            if ($err) {

                $rej($err);
                return;
            }

            if (!$stats) {

                $rej(new Error('Error retriving stats for ' + $path));
                return;
            }

            let name = '';
            if ($stats.isFile()) {

                name = path.basename($path, '.js');
                var errn = addSafe.apply(self, [name, path.normalize(path.dirname(require.main.filename) + path.sep + $path)]);
                if (errn == 0) {

                    $res(name);
                }
                else if (errn == 1) {

                    $rej(ERR_DUPLICATE_NAME + name);
                }
                else {

                    $rej(ERR_NOT_LOADABLE + name);
                }
            }
            else {

                name = $path;

                self.getPackageInfo($path).then(function ($info) {

                    var errn = addSafe.apply(self, [$info.name, path.normalize(path.dirname(require.main.filename) + path.sep + $path)]);
                    if (errn == 0) {

                        $res($info.name);
                    }
                    else if (errn == 1) {

                        $rej(ERR_DUPLICATE_NAME + $info.name);
                    }
                    else {

                        $rej(ERR_NOT_LOADABLE + $info.name);
                    }
                }, function ($err) {

                    // Package.json does not exist... lets look for index.js
                    fs.open($path + path.sep + 'index.js', 'r', function ($err, $fd) {

                        if ($err) {
                                
                            // This is no module package
                            $rej('Not stupidly Loadable: ' + $path);
                            return;
                        }

                        fs.close($fd);
                        var name = path.basename($path);
                        var errn = addSafe.apply(self, [name, path.normalize(path.dirname(require.main.filename) + path.sep + $path) + path.sep + 'index.js']);

                        if (errn == 0) {

                            $res(name);
                        }
                        else if (errn == 1) {

                            $rej(ERR_DUPLICATE_NAME + name);
                        }
                        else {

                            $rej(ERR_NOT_LOADABLE + name);
                        }
                    });
                });
            }

            return name;
        };

        if ($sync) {

            return processStats(null, fs.statSync($path));
        }
        else {

            fs.stat($path, processStats);
        }
    };

    if ($sync) {

        return work();
    }
    else {

        return new Promise(work);
    }
};
