'use strict';

const fs = require('fs');
const path = require('path');

const nml = require('./nml-class.h.js');


nml.prototype.getPackageInfo = function f_nml_getPackageInfo($path, $sync) {

    const confPath = $path + path.sep + 'package.json';

    if ($sync) {

        return require(confPath);
    }

    return new Promise(($res, $rej) => {

        // Let's see if the given directory is a package module
        fs.open(confPath, 'r', ($err, $fd) => {

            if ($err) {

                $rej($err);
                return;
            }

            // YaY, there is a package.json. Let's read it to find out the name of the module-package
            fs.fstat($fd, ($err, $stats) => {

                if ($err) {

                    fs.close($fd);
                    $rej($err);
                    return;
                }

                const buffer = new Buffer($stats.size);
                fs.read($fd, buffer, 0, buffer.length, null, $err => {

                    if ($err) {

                        fs.close($fd);
                        $rej($err);
                        return;
                    }

                    // Handling BOMs
                    const offset = buffer[0] === 239 ? 3 : 0;
                    const data = buffer.toString("utf8", offset, buffer.length);
                    try {
                            
                        // Carefully parse the file... it might be malformed.
                        const conf = JSON.parse(data);
                        $res(conf);
                    }
                    catch ($e) {

                        $rej($e);
                    }
                    finally {

                        fs.close($fd);
                    }
                });
            });
        });
    });
};
