# Node-Mod-Load

Lazy load modules and create consistent meta-modules

Working with a huge project means maintaining lots of moduls. Sometimes those modules form circular dependencies, which are not bad by default, but bring lots of problems with them (namely code which will not be executed).
In order to solve this problem, modules should be lazy-loaded, meaning they are only required when they are really needed in code;
or alternatively modules should not be included at the top of a script but rather at the beginning of the program and then cached.
That way even circular dependencies between modules will not be a problem as all code in a module can be read entirely.
This module will not solve circular calls. It will only allow circular dependencies and is no excuse for bad programming style and developer's errors!

In addition to regular modules, "meta-modules" can be added and used like every other module in the list of modules. Meta-modules are virtual modules, which are created during runtime.
They do not have a separate file for them and should just be a JS-Object which can be used like a module.
Node-Mod-Load can make use of JS Harmony's Proxy feature to lazy-load modules. If proxies are not available, all modules will be loaded at once.

This module was first created for SHPS, but then separated for easy use by everyone :)

### Version
2.1.1

### Installation
```sh
$ npm i node-mod-load
```

How To Use
----

You will first need to create a list of modules and meta-modules
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

// The next uncommented line will make Node-Mod-Load flush the list of files, directories and meta-modules.
// Normally Node-Mod-Load would only work on that queue when a lib is requested for the first time if Harmony-Proxies are enabled
// If you do not enable Proxies, new entries will directly be worked on, so no flush required
// Do not use this function if not really needed as it destroys lazy-loading
nml.flush();
```

After building the list you can just require Node-Mod-Load anywhere and get the module from it
```js
var libs = require('node-mod-load').libs; // <- the object `libs` will include everything you added

var hellowFun = () => {
  return libs.meta.hellowWorld();
};
```

Version History
----

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
