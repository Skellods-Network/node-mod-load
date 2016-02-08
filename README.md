# Node-Mod-Load

[![Join the chat at https://gitter.im/Skellods-Network/node-mod-load](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Skellods-Network/node-mod-load?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Semver](http://img.shields.io/SemVer/2.0.0.png)](http://semver.org/spec/v2.0.0.html)
[![MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

Lazy load modules and create consistent meta-modules

Working with a huge project means maintaining lots of moduls. Sometimes those modules form circular dependencies, which are not bad by default, but bring lots of problems with them (namely code which will not be executed).
In order to solve this problem, modules should be lazy-loaded, meaning they are only required when they are really needed in code;
or alternatively modules should not be included at the top of a script but rather at the beginning of the program and then cached.
That way even circular dependencies between modules will not be a problem as all code in a module can be read entirely.
This module will not solve circular calls. It will only allow circular dependencies and is no excuse for bad programming style and developer's errors!

In addition to regular modules, "meta-modules" can be added and used like every other module in the list of modules. Meta-modules are virtual modules, which are created during runtime.
They do not have a separate file for them and should just be a JS-Object which can be used like a module.

This module was first created for SHPS, but then separated for easy use by everyone :)

### Version
3.0.0

### Installation
```sh
$ npm i node-mod-load
```

Interface
----
```js
class NML {

    constructor($namespace) {

        this.libs = {};
        this.versions = {};
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
     * @result bool
     *   Will be true if the object was added successfully
     *   And the object was not undefined
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
```

How To Use
----

You will first need to create a list of modules and meta-modules.
The following code will use NML statically, which stores everything into the namespace `_default`
```js
var nml = require('node-mod-load');

// Node Mod Load is able to read package information and return an object containing said information
var packageConfig = nml.getPackageInfo('./plugins/demo');
console.log('Plugin found: ' + packageConfig.name);

// This will add a single module or module-package to the list
// addPath will return a promise
nml.addPath('./some-module.js');
nml.addPath('./my-functionality');

// If you need addPath to be sync, just set the second parameter to true
nml.addPath('./somePackage', true);

// This will add all .js modules and all module-packages in the directory "./libs" to the list
// addDir used like this will return a Promise
nml.addDir('./libs');

// addDir can also be used as a sync function by adding a true as second parameter
nml.addDir('./modules', true);

// This will add a meta-module to the list
nml.addMeta('meta', { hellowWorld: () => { console.log('Hey there!'); } });
```

After building the list you can just require Node-Mod-Load anywhere and get the module from it
```js
var libs = require('node-mod-load').libs; // <- the object `libs` will include everything you added

var hellowFun = () => {
  return libs.meta.hellowWorld();
};
```

Instead of using NML statically, you can also use namespaces to improve overview by a great deal and separate different parts of your application transparently in the code.<br>
Please understand that due to Node.JS's nature, all modules can only be added once. If they are required a second time, they will be added from Node.JS's cache.
```js
var nml = require('node-mod-load');
var myNamespacedNML = nml('myNamespace');

myNamespacedNML.addDir('./subMod/src');
myNamespacedNML.libs.foo('bar');

// The following will throw, even thought we might have added nml.libs.meta object with that particular method earlier
myNamespacedNML.libs.meta.hellowWorld();
```

When adding a module package (folder with `package.json`), the version may be retrived from the `nml.versions` object (depending on your namespace!)
```js
console.log('Version of foo: ' + myNamespacedNML.versions['foo']);
```

Version History
----

- 3.0.0
  - [SEMVER MAJOR] deprecate ES6 Proxies (they are not stable yet and frankly at the moment a pain to maintain)
  - [SEMVER MINOR] add namespaces (SHPS requirement)
  - [SEMVER PATCH] restructure internals for better overview and debugging (works like black magic)
- 2.1.1
  - [SEMVER PATCH] fixed non-proxy version
  - [SEMVER PATCH] moved TODO list into github-issues
- 2.1.0
  - [SEMVER MINOR] exposed `getPackageInfo()`
- 2.0.0
  - [SEMVER MAJOR] missing package.json and index.json will not reject the promise any more
  - [SEMVER PATCH] fixed problems with BOM
- 1.0.1 - Added Keywords

License
----

MIT

**Free Software, Hell Yeah!**
