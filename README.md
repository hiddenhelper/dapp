# Web DEXTF Ðapp

### Project structure

```
dapp-web
  + docs
  + jsdoc
  + node_modules
  + public
  + src
  ...
```

### Project setup

```
yarn install
```

See the **Troubleshooting** in case of errors.

### Compiles and hot-reloads for development & starts backend server

```
yarn run start
```

### Compiles and minifies for production

To compile:

```
yarn run build
```

For the minification:

Due to a bug in the SetProtocol modules we cannot minify everything (or the Kyber operationds fail). For this reason we minify "manually" all chunks except the vendors chunk.

Run this to create the minification statements:

```
cd ./dist/js
for file in *.js; do printf '%s\n' "'minify': 'minify ./dist/js/$file > ./dist/js/minified/$file',"; done
```

Add the statements to the _scripts_ section of the `package.json` (except the `chunk-vendors*.js` file):

```
"scripts": {
  "minify1": "minify ./dist/js/app.300d8bdc.js > ./dist/js/minified/app.300d8bdc.js",
  "minify2": "minify ./dist/js/chunk-27f3efef.2ba9367f.js > ./dist/js/minified/chunk-27f3efef.2ba9367f.js",
  ...
}
```

Next do the minifications:

```
yarn minify1
yarn minify2
...
```

Finally copy the minified files and get rid of the `minified` folder.

See the **Troubleshooting** in case of errors.

### Run your tests

```
yarn run test
```

### Lints and fixes files

```
yarn run lint
```

### VueJS configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## API documentation

We use [JSDoc 3](https://jsdoc.app/) to generate the API documentation.

To install **globally**:

`yarn global add jsdoc`

JSDoc comments should generally be placed immediately before the code being documented. Each comment must start with a `/**` sequence in order to be recognized by the JSDoc parser. Comments beginning with `/*`, `/***`, or more than 3 stars will be ignored. This is a feature to allow you to suppress parsing of comment blocks.

Special [JSDoc tags](https://devdocs.io/jsdoc-tags/) can be used to give more information.

Example:

```
/**
  * Set the focus on an element after a given delay.
  * Note: if the element is disabled the focus is not set.
  * @param {string} elementName element to focus
  * @param {*} [ms=200] delay in milliseconds
  * @example:
  * setFocus('btnInvest', 100)
  */
  setFocus(elementName, ms = 200) {
  ...
```

We use [better-docs](https://www.npmjs.com/package/better-docs) as "documentation toolbox" (template), and it needs to be added to the `jsdoc.json` files:

```
"opts": {
  "template": "node_modules/better-docs"
}
```

### Documentation website generation

`yarn run generate-docs`

The website will be generated in the `docs` folder.

## Troubleshooting

### node-gyp on new macOS versions

The latest version of the Command Line Tools for Xcode is required.

Check the version of the Command Line Tools as follows:

```
pkgutil --pkg-info=com.apple.pkg.CLTools_Executables
```

If necessary, install the latest version of Xcode and the Command Line Tools (Xcode > Open Developer Tool > More Developer Tools).

If this does not work refer to these [installations notes](https://github.com/nodejs/node-gyp/blob/master/macOS_Catalina.md). In particular conduct the _acid test_ and then look for the **Solutions** chapter.

### Start/Serve errors

If the port 8080 is already in use:

```
sudo lsof -i :8080
kill -9 <PID>
```

### Install errors

#### ethereum/web3.js issue [#2913](https://github.com/ethereum/web3.js/issues/2913)

`setprotocol.ls` uses `web3.js-1.0.0-beta.36` which uses `web3-eth-accounts` which uses `scrypt.js` that is a wrapper around `scrypt` (native code) with a fallback to `scryptsy` (pure JS).

> `scrypt` is not maintained anymore and is incompatible with `node 12`.

During package installation with `yarn` lots of nasty errors are printed to the terminal even though `scrypt.js` installation will actually succeed since `scrypt` is an optional dependency.
Note: compiling with `npm` does not throw any error, just because it enforces "engines" only at the top-level of the project (the project/repo you're working on, i.e. not with respect to its dependencies), while `yarn` enforces at any level in a project's dependency tree (i.e. with respect to its dependencies too).

General solutions:

1. once available, use a most recent version of `setprotocol.js` which uses a newer version of `web3` (>= 1.2.1 - see [pull #2938](https://github.com/ethereum/web3.js/pull/2938)) or
1. downgrade to `node 10` or
1. use the minified browser version of `web3` ([here](https://cdn.jsdelivr.net/gh/ethereum/web3.js@1.0.0-beta.36/dist/web3.min.js)) and avoid compilation

Currently, in the context of this project (that depends on `setprotocol.js`) the only option is 2.

### Build runs out of memory

The build process with `yarn` might end up with a:

```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

To solve this issue we need to:

1. Use `npm` ([Node Version Manager](npm)) Switch to `node 12` that has a better memory management:

```
nvm use 12
```

2. Set the `NODE_OPTIONS` environment variable and configure the JS Engine ([V8](https://v8.dev/)) to limit the amount of 'unused' space that is held in memory:

```
export NODE_OPTIONS=--max_old_space_size=4096
```

Notes:

> `NODE_OPTIONS` allows to set `node`'s options; among them some allow to configure the underlying [V8](https://v8.dev/) Javascript engine (run `node --v8-options` for a list).

> "Old space" is the biggest and most configurable section of V8's managed (aka garbage-collected) heap (i.e. where the JavaScript objects live), and the `--max-old-space-size` flag controls its maximum size. As memory consumption approaches the limit, V8 will spend more time on garbage collection in an effort to free unused memory.
> If heap memory consumption (i.e. live objects that the GC cannot free) exceeds the limit, V8 will crash your process (for lack of alternative), so you don't want to set it too low. Of course, if you set it too high, then the additional heap usage that V8 will allow might cause your overall system to run out of memory (and either swap or kill random processes, for lack of alternative).

3. If/when developing with TypeScript, webpack uses a specialized type-checker plugin (`fork-ts-checker-webpack-lugin` - [here](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin)).
   This [article](https://stackoverflow.com/questions/55258355/vue-clis-type-checking-service-ignores-memory-limits/55810460) explains how to customize Vue CLI's built-in `webpack.config` to increase the Node.js memory limit:

```
// in the vue.config.js

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const os = require('os');

const totalMem = os.totalmem() / 1024 / 1024;
const maxMem = totalMem / 2; // half of the memory to build fast
console.log(
  'Total Memory is',
  totalMem,
  'MB',
  ' => Set memory limit to',
  maxMem,
  'MB'
);

module.exports = {
  //......,
  chainWebpack: config => {
    config.plugin('fork-ts-checker').tap(args => {
      // modify the option with our value
      args[0].memoryLimit = maxMem;
      return args;
    });
  },
  //......
};
```

### Node.js memory allocation failure (during `yarn serve`)

The serve process with `yarn` might end up with a memory allocation failure and an error like this:

```
<--- Last few GCs --->
31681 ms: Mark-sweep 654.1 (666.5) -> 492.5 (509.8) MB, 267.5 / 0.0 ms [allocation failure] [GC in old space requested].
31839 ms: Mark-sweep 492.5 (509.8) -> 492.2 (506.8) MB, 157.5 / 0.0 ms [allocation failure] [GC in old space requested].
31985 ms: Mark-sweep 492.2 (506.8) -> 492.2 (497.8) MB, 146.2 / 0.0 ms [last resort gc]. 32122 ms: Mark-sweep 492.2 (497.8) -> 492.2 (497.8) MB, 136.8 / 0.0 ms [last resort gc]. <--- JS stacktrace --->
```

In that case setting the `NODE_OPTIONS` environment variable might help:

```
export NODE_OPTIONS=--max_old_space_size=8000
```
