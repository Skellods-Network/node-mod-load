'use strict';

const fs = require('fs');
const path = require('path');

const msg = require('./nml-messages.h.js');
const nml = require('./nml-class.h.js');
const on = require('./nml.on.c');


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
                let p;
                if (path.isAbsolute($path)) {

                    p = $path;
                }
                else {

                    p = path.normalize(path.dirname(require.main.filename) + path.sep + $path);
                }

                on.fire('detect', name, p);
                errn = addSafe.apply(this, [name, p]);

                if (errn === 0) {

                    on.fire('load', name, p, this.libs[name], undefined);
                    this.versions[name] = typeof undefined;
                    this.info[name] = {};
                    if ($sync) {

                        return name;
                    }
                    else {

                        $res(name);
                    }
                }
                else if (errn === 1) {

                    const reason = msg.ERR_DUPLICATE_NAME + name;
                    on.fire('error', name, p, new Error(reason));
                    if ($sync) {

                        throw reason;
                    }
                    else {

                        $rej(reason);
                    }
                }
                else {

                    const reason = msg.ERR_NOT_LOADABLE + name;
                    on.fire('error', name, p, new Error(reason));
                    if ($sync) {

                        throw reason;
                    }
                    else {

                        $rej(reason);
                    }
                }
            }
            else {

                let p;
                if (path.isAbsolute($path)) {

                    p = $path;
                }
                else {

                    p = path.normalize(path.dirname(require.main.filename) + path.sep + $path);
                }

                name = $path;

                const doAdd = $info => {

                    on.fire('detect', $info.name, p);
                    const errn = addSafe.apply(this, [$info.name, p]);
                    if (errn === 0) {

                        on.fire('load', $info.name, p, this.libs[$info.name], $info);
                        this.versions[$info.name] = typeof $info.version === 'string' ? $info.version : typeof $info.version;
                        this.info[$info.name] = $info;
                        if ($sync) {

                            return $info.name;
                        }
                        else {

                            $res($info.name);
                        }
                    }
                    else if (errn === 1) {

                        const reason = msg.ERR_DUPLICATE_NAME + $info.name;
                        on.fire('error', name, p, new Error(reason));
                        if ($sync) {

                            throw reason;
                        }
                        else {

                            $rej(reason);
                        }
                    }
                    else {

                        const reason = msg.ERR_NOT_LOADABLE + $info.name;
                        on.fire('error', name, p, new Error(reason));
                        if ($sync) {

                            throw reason;
                        }
                        else {

                            $rej(reason);
                        }
                    }
                };

                const doError = $e => {

                    const name = path.basename($path);
                    const p = $path + path.sep + 'index.js';
                    on.fire('detect', name, p);

                    if ($e.code !== 'ENOENT') {
                        on.fire('error', name, p, $e);
                    }

                    // Package.json does not exist... lets look for index.js
                    fs.open(p, 'r', ($err, $fd) => {

                        if ($err) {

                            // This is no module package
                            $rej('Not stupidly Loadable: ' + $path);
                            return;
                        }

                        fs.close($fd);
                        const errn = addSafe.apply(this, [name, path.normalize(path.dirname(require.main.filename) + path.sep + $path) + path.sep + 'index.js']);

                        if (errn === 0) {

                            on.fire('load', name, p, this.libs[name], undefined);
                            this.versions[name] = typeof undefined;
                            this.info[name] = {};
                            if ($sync) {

                                return name;
                            }
                            else {

                                $res(name);
                            }
                        }
                        else if (errn === 1) {

                            const reason = msg.ERR_DUPLICATE_NAME + name;
                            on.fire('error', name, p, new Error(reason));
                            if ($sync) {

                                throw reason;
                            }
                            else {

                                $rej(reason);
                            }
                        }
                        else {

                            const reason = msg.ERR_NOT_LOADABLE + name;
                            on.fire('error', name, p, new Error(reason));
                            if ($sync) {

                                throw reason;
                            }
                            else {

                                $rej(reason);
                            }
                        }
                    });
                };

                let pInfo;
                try {

                    pInfo = this.getPackageInfo($path, $sync);
                }
                catch ($e) {

                    return doError($e);
                }

                if ($sync) {

                    return doAdd(pInfo);
                }
                else {

                    pInfo.then(doAdd, doError);
                }
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
