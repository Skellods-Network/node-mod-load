'use strict';

var fs = require('fs');
var path = require('path');

var msg = require('./nml-messages.h.js');
var nml = require('./nml-class.h.js');


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

        if (!$res) {

            $res = $r => {

                return $r;
            };
        }
        
        if (!$rej) {

            $rej = $err => {
                
                throw new Error($err);
            };
        }

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

                var errn;
                if (path.isAbsolute($path)) {

                    errn = addSafe.apply(self, [name, $path]);
                }
                else {

                    errn = addSafe.apply(self, [name, path.normalize(path.dirname(require.main.filename) + path.sep + $path)]);
                }

                if (errn == 0) {

                    self.versions[name] = typeof undefined;
                    if ($sync) {

                        return name;
                    }
                    else {

                        $res(name);
                    }
                }
                else if (errn == 1) {

                    if ($sync) {

                        throw msg.ERR_DUPLICATE_NAME + name;
                    }
                    else {

                        $rej(msg.ERR_DUPLICATE_NAME + name);
                    }
                }
                else {

                    if ($sync) {

                        throw msg.ERR_NOT_LOADABLE + name;
                    }
                    else {

                        $rej(msg.ERR_NOT_LOADABLE + name);
                    }
                }
            }
            else {

                name = $path;

                self.getPackageInfo($path).then(function ($info) {

                    var errn = addSafe.apply(self, [$info.name, path.normalize(path.dirname(require.main.filename) + path.sep + $path)]);
                    if (errn == 0) {

                        self.versions[$info.name] = typeof $info.version === 'string' ? $info.version : typeof $info.version;
                        if ($sync) {

                            return $info.name;
                        }
                        else {

                            $res($info.name);
                        }
                    }
                    else if (errn == 1) {

                        if ($sync) {

                            throw msg.ERR_DUPLICATE_NAME + $info.name;
                        }
                        else {

                            $rej(msg.ERR_DUPLICATE_NAME + $info.name);
                        }
                    }
                    else {

                        if ($sync) {

                            throw msg.ERR_NOT_LOADABLE + $info.name;
                        }
                        else {

                            $rej(msg.ERR_NOT_LOADABLE + $info.name);
                        }
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

                            self.versions[name] = typeof undefined;
                            if ($sync) {

                                return name;
                            }
                            else {

                                $res(name);
                            }
                        }
                        else if (errn == 1) {

                            if ($sync) {

                                throw msg.ERR_DUPLICATE_NAME + name;
                            }
                            else {

                                $rej(msg.ERR_DUPLICATE_NAME + name);
                            }
                        }
                        else {

                            if ($sync) {

                                throw msg.ERR_NOT_LOADABLE + name;
                            }
                            else {

                                $rej(msg.ERR_NOT_LOADABLE + name);
                            }
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
