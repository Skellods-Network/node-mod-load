'use strict';

module.exports = class NML {

    constructor($namespace) {

        this.libs = {};
    }

    /**
     * Search a directory for modules and add all
     *
     * @param $dir string
     * @param $sync bool
     *   Set to true if the method should run synchronically
     *   Default: false
     * @result Promise if $sync is false
     */
    addDir($dir, $sync) { throw 'Not Implemented'; };

    /**
     * Add an object directly
     *
     * @param $name string
     * @param $obj Object
     */
    addMeta($name, $obj) { throw 'Not Implemented'; };

    /**
     * Add a module
     *
     * @param $path string
     * @param $sync bool
     *   Set to true if the method should run synchronically
     *   Default: false
     * @result Promise if $sync is false
     */
    addPath($path, $sync) { throw 'Not Implemented'; };

    /**
     * Read package.json and return the content
     *
     * @param $path string
     * @result Promise(Object)
     */
    getPackageInfo($path) { throw 'Not Implemented'; };
};
