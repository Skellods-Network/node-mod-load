'use strict';

// Build class from header and code files
// This allows for a clean header and code in separate files for good overview and easy debugging
// Also adding and modifying a method is streight forward
// Only after building the class, objects can be instantiated, or else all methods will throw (because they were not overwritten)
require('./src/nml-class.h.js');
require('./src/nml.addDir.c.js');
require('./src/nml.addMeta.c.js');
require('./src/nml.addPath.c.js');
require('./src/nml.on.c.js');
require('./src/nml.getPackageInfo.c.js');

// This is the main file, which serves as both: a factory function and an object of NML for "static" method usage
// JS is so awesome for allowing things like this little miracle
module.exports = require('./src/nml.h.js');

// The just mentioned function/object/static-thingy still needs to be filled with its "static" methods.
require('./src/nml-static.c.js');

// This feels like some kind of black magic :D
