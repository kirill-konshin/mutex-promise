(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return (root.MutexPromise = factory(root.Promise, root.localStorage));
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(typeof Promise !== 'undefined' ? Promise : require('es6-promise'));
    } else {
        root.MutexPromise = factory(root.Promise, root.localStorage);
    }
}(this, function(Promise, localStorage) {

    var simpleStorage = {
        store: {},
        setItem: function(key, item) {
            this.store[key] = item;
        },
        getItem: function(key, item) {
            return this.store[key] || null;
        },
        removeItem: function(key) {
            delete this.store[key];
        }
    };

    /**
     * @name MutexPromise
     * @param key
     * @param [options]
     * @param [options.interval]
     * @param [options.timeout]
     * @constructor
     */
    function MutexPromise(key, options) {

        if (!(this instanceof MutexPromise)) return new MutexPromise(key, options);
        if (!key) throw Error('Key is mandatory');

        options = options || {};

        this._key = key;
        this._interval = options.interval || MutexPromise.interval;
        this._timeout = options.timeout || MutexPromise.timeout;

    }

    MutexPromise.version = '0.1.0';

    // Dependencies
    MutexPromise.localStorage = localStorage || simpleStorage;
    MutexPromise.Promise = Promise;

    // Default
    MutexPromise.interval = 250;
    MutexPromise.timeout = 5000;

    /**
     * @return {boolean}
     */
    MutexPromise.prototype.locked = function() {
        return (Date.now() < this.time());
    };

    /**
     * @return {int}
     */
    MutexPromise.prototype.time = function() {
        var time = MutexPromise.localStorage.getItem(this._key);
        return (!!time) ? parseInt(time, 10) : 0;
    };

    /**
     * @return {MutexPromise}
     */
    MutexPromise.prototype.lock = function() {
        MutexPromise.localStorage.setItem(this._key, Date.now() + this._timeout);
        return this;
    };

    /**
     * @return {MutexPromise}
     */
    MutexPromise.prototype.unlock = function() {
        MutexPromise.localStorage.removeItem(this._key);
        return this;
    };

    /**
     * @param {function} resolve
     * @param {function} reject
     * @private
     */
    MutexPromise.prototype._poll = function(resolve, reject) {
        if (!this.locked()) {
            this.unlock();
            return resolve(this);
        }
        setTimeout(this._poll.bind(this, resolve, reject), this._interval);
    };

    /**
     * @return {Promise}
     */
    MutexPromise.prototype.promise = function() {
        return new MutexPromise.Promise(this._poll.bind(this));
    };

    return MutexPromise;

}));
