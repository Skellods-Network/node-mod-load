'use strict';

(function () {

    var fs = require('fs');
    var path = require('path');

    var me = module.exports;


    var _prefetch = false;
    var _queue = {};
    var _mods = {};
    
    var _libGetter = function ($target, $name, $receiver) {

        if (_mods[$name]) {

            return _mods[$name];
        }

        if (_queue[$name]) {
            
            _mods[$name] = require(_queue[$name]);
            return _mods[$name];
        }

        return;
    };

    var _init = function () {

        if (typeof Proxy !== 'undefined') {

            if (Proxy.create) {

                me.libs = Proxy.create({

                    get: _libGetter,
                });
            }
            else {

                me.libs = {};
                me.libs = new Proxy({}, {

                    get: _libGetter,
                });
            }
        }
        else {

            _prefetch = true;
            me.libs = _mods;
        }
    };
    
    /**
     * @return Promise($Object)
     */
    var _getPackageInfo 
    = me.getPackageInfo = function ($path) {
        
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
                        
                        $rej($err);
                        fs.close($fd);
                        return;
                    }
                    
                    var buffer = new Buffer($stats.size);
                    fs.read($fd, buffer, 0, buffer.length, null, function ($err, $bytesRead, $buffer) {
                        
                        if ($err) {
                            
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

    var _flush
    = me.flush = function () {

        var i = 0;
        var keys = Object.keys(_queue);
        var l = keys.length;
        var err = {
        
            _count: 0,
        };

        while (i < l) {
            
            try {

                _mods[keys[i]] = require(_queue[keys[i]]);
            }
            catch ($e) {

                err[keys[i]] = $e;
                err._count++;
            }
            finally {

                delete _queue[keys[i]];
                i++;
            }
        }

        return err.count == 0   ? null
                                : err;
    };

    var _addPath
    = me.addPath = function ($path, $sync) {

        var work = function ($res, $rej) {

            var processStats = function ($err, $stats) {

                if ($err) {

                    $rej($err);
                    return;
                }

                let name = '';
                if ($stats.isFile()) {

                    name = path.basename($path, '.js');
                    _queue[name] = $path;
                    $res(name);
                    if (_prefetch) {

                        _flush();
                    }
                }
                else {

                    name = $path;
                    
                    _getPackageInfo($path).then(function ($info) {
                    
                        _queue[$info.name] = $path;
                        $res($info.name);
                    }, function ($err) {

                        // File does not exist... lets look for index.js
                        fs.open($path + path.sep + 'index.js', 'r', function ($err, $fd) {
                            
                            if ($err) {
                                
                                // This is no module package
                                $res($err);
                                return;
                            }
                            
                            var name = path.basename($path);
                            _queue[name] = $path + path.sep + 'index.js';
                            $res(name);
                            if (_prefetch) {
                                
                                _flush();
                            }

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

    var _addDir
    = me.addDir = function ($dir, $sync) {

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

                    var tmpPrefetch = _prefetch;
                    _prefetch = false;

                    while (i < l) {

                        _addPath($files[i], $sync);
                        i++;
                    }

                    _prefetch = tmpPrefetch;
                    if (_prefetch) {

                        _flush();
                    }
                }
                else {

                    var proms = [];
                    var tmpPrefetch = _prefetch;
                    _prefetch = false;
                    while (i < l) {

                        proms.push(_addPath(path.normalize($dir + path.sep) + $files[i], $sync));
                        i++;
                    }

                    Promise.all(proms).then(function ($r) {
                        
                        _prefetch = tmpPrefetch;

                        var err = null;
                        if (_prefetch) {
                            
                            err = _flush();
                        }
                        
                        if (err) {

                            let i = 0;
                            var keys = Object.keys(err);
                            var l = keys.length;
                            while (i < l) {
                                
                                if (keys[i] === '_count') {

                                    i++;
                                    continue;
                                }

                                err[keys[i]].what = keys[i];

                                $r[$r.indexOf(keys[i])] = err[keys[i]];
                                i++;
                            }
                        }

                        $res($r);
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

    var _addMeta
    = me.addMeta = function ($name, $obj) {

        _mods[$name] = $obj;
    };

    // CONSTRUCTOR
    _init();
})();