'use strict';

module.exports = class {

    constructor() {

        this.libs = {};
        this.versions = {};
        this.info = {};
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
    addDir($dir, $sync) { /** throw 'Not Implemented'; */ };

    /**
     * Add an object directly
     *
     * @param $name string
     * @param $obj Object
     * @result bool
     *   Will be true if the object was added successfully
     *   And the object was not undefined
     */
    addMeta($name, $obj) { /** throw 'Not Implemented'; */ };

    /**
     * Add a module
     *
     * @param $path string
     * @param $sync bool
     *   Set to true if the method should run synchronically
     *   Default: false
     * @result Promise if $sync is false
     */
    addPath($path, $sync) { /** throw 'Not Implemented'; */ };

    /**
     * Read package.json and return the content
     *
     * @param $path string
     * @result Promise(Object)
     */
    getPackageInfo($path) { /** throw 'Not Implemented'; */ };

    /**
     * Attach event-listener to one of the following events.
     * - detect
     *     fired when a module was detected by addPath()
     *     handler: (moduleName, path) => {}
     * - load
     *     fired when a module was loaded by addPath()
     *     handler: (moduleName, path, moduleObject, packageInfo) => {}
     * - error
     *     fired when there was a module could not be loaded by addPath()
     *     handler: (moduleName, path, error) => {}
     *
     * @param {string} $event
     * @param {function} $handler
     */
    on($event, $handler) { /** throw 'Not Implemented'; */ };
};
