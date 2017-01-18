'use strict';

const fs = require('fs');
const path = require('path');

const msg = require('./nml-messages.h.js');
const nml = require('./nml-class.h.js');


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
}

nml.prototype.addPath = function f_nml_addPath($path, $sync) {

    const work = ($res, $rej) => {

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

        const processStats = ($err, $stats) => {

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

                let errn;
                if (path.isAbsolute($path)) {

                    errn = addSafe.apply(this, [name, $path]);
                }
                else {

                    errn = addSafe.apply(this, [name, path.normalize(path.dirname(require.main.filename) + path.sep + $path)]);
                }

                if (errn == 0) {

                    this.versions[name] = typeof undefined;
                    this.info[name] = {};
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

                this.getPackageInfo($path).then($info => {

                    const errn = addSafe.apply(this, [$info.name, path.normalize(path.dirname(require.main.filename) + path.sep + $path)]);
                    if (errn == 0) {

                        this.versions[$info.name] = typeof $info.version === 'string' ? $info.version : typeof $info.version;
                        this.info[$info.name] = $info;
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
                }, () => {

                    // Package.json does not exist... lets look for index.js
                    fs.open($path + path.sep + 'index.js', 'r', ($err, $fd) => {

                        if ($err) {

                            // This is no module package
                            $rej('Not stupidly Loadable: ' + $path);
                            return;
                        }

                        fs.close($fd);
                        const name = path.basename($path);
                        const errn = addSafe.apply(this, [name, path.normalize(path.dirname(require.main.filename) + path.sep + $path) + path.sep + 'index.js']);

                        if (errn == 0) {

                            this.versions[name] = typeof undefined;
                            this.info[name] = {};
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
