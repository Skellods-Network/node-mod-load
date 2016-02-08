'use static';

var fs = require('fs');
var path = require('path');

var nml = require('./nml-class.h.js');


nml.prototype.getPackageInfo = function f_nml_getPackageInfo($path) {

    return new Promise(function ($res, $rej) {

        // Let's see if the given directory is a package module
        fs.open($path + path.sep + 'package.json', 'r', function ($err, $fd) {

            if ($err) {

                $rej($err);
                return;
            }

            // YaY, there is a package.json. Let's read it to find out the name of the module-package
            fs.fstat($fd, function ($err, $stats) {

                if ($err) {

                    fs.close($fd);
                    $rej($err);
                    return;
                }

                var buffer = new Buffer($stats.size);
                fs.read($fd, buffer, 0, buffer.length, null, function ($err, $bytesRead, $buffer) {

                    if ($err) {

                        fs.close($fd);
                        $rej($err);
                        return;
                    }

                    var offset = 0;
                    if (buffer[0] === 239) {

                        offset = 3;
                    }

                    var data = buffer.toString("utf8", offset, buffer.length);
                    try {
                            
                        // Carefully parse the file... it might be malformed.
                        var conf = JSON.parse(data);
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
