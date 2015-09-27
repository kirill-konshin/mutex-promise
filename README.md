Promise Mutex
=============

A simple JS Mutex library that works both in browser and NodeJS. Library ensures that asynchronous code will wait until
the mutex is unlocked, even if it was locked from another tab.

The usual use-case is when you need to do a server request and you'd like to make sure that only one concurrent request
will be executed, others will wait until the mutex is unlocked, no matter which tab has created the request.

Installation
------------

### Browser

```sh
$ bower install promise-mutex
```

Or download the [raw file](https://github.com/kirill-konshin/promise-mutex/blob/master/index.js).

### NodeJS

```sh
$ npm install mutex
```

API
---

```js
var MutexPromise = require('mutex-promise'); // in NodeJS, in browser this is not needed

var mutex = new MutexPromise('key', {...options}); // key will be used for localStorage, so it should be unique enough
```

Options:

- `timeout` &mdash; mutex will be automatically unlocked after timeout
- `interval` &mdash; how frequently to poll the storage for changes

```
// Lock the mutex
mutex.lock();

// Get a promise that resolves when mutex is unlocked or expired
mutex.promise().then(function(mutex){ ... });

// Unlock the mutex
mutex.unlock();
```

Example
-------

The function ensures that only one concurrent request may be executed.

```js
var mutex = new MutexPromise('some-very-unique-key');

function doStuffExclusively(mutex) {
    return mutex.promise()
        .then(function(mutex){
            mutex.lock();
            return fetch('http://localhost', {method: 'PUT', body: ...});
        })
        .then(function(res){
            mutex.unlock();
            return res;
        })
        .catch(function(e){
            mutex.unlock();
            throw e;
        });
}

doStuffExclusively(mutex);
doStuffExclusively(mutex);
doStuffExclusively(mutex);
```

Dependencies
------------

Library uses Promises, modern browsers these days have native implementation, for old ones you can use any polyfill.

To store data library uses LocalStorage in browser and a simple Storage object in NodeJS. Keep in mind, that library's
built-in NodeJS storage is not persistent, nothing is shared between processes or script runs. If you need to have
persistent mutexes you can inject a persistent Storage implementation via DI. Implementation must have at least
`getValue(key, value)`, `setValue(key)` and `removeValue(key)` methods, which has to be synchronous. 

To inject custom implementations of Promise or Storage:
 
```js
MutexPromise.Promise = ...;
MutexPromise.localStorage = ...;
```