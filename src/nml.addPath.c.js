'use strict';

var fs = require('fs');
var path = require('path');

var nml = require('./nml-class.h.js');


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
                self.libs[name] = require(path.normalize(path.dirname(require.main.filename) + path.sep + $path));
                $res(name);
            }
            else {

                name = $path;

                self.getPackageInfo($path).then(function ($info) {

                    self.libs[$info.name] = require(path.normalize(path.dirname(require.main.filename) + path.sep + $path));;
                    $res($info.name);
                }, function ($err) {

                    // Package.json does not exist... lets look for index.js
                    fs.open($path + path.sep + 'index.js', 'r', function ($err, $fd) {

                        if ($err) {
                                
                            // This is no module package
                            $rej('Not stupidly Loadable: ' + $path);
                            return;
                        }

                        var name = path.basename($path);
                        self.libs[name] = require(path.normalize(path.dirname(require.main.filename) + path.sep + $path) + path.sep + 'index.js');
                        $res(name);

                        fs.close($fd);
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
