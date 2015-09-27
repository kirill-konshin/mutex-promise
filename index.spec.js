(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./index'), require('chai'));
    } else {
        factory(MutexPromise, chai);
    }
}(this, function(MutexPromise, chai) {

    var expect = chai.expect,
        delayCompensation = 4; // ms

    MutexPromise.interval = 0;
    MutexPromise.timeout = 10;

    /**
     * @return {MutexPromise}
     */
    function createMutex(options) {
        return new MutexPromise(Math.random().toString(), options);
    }

    describe('MutexPromise()', function() {

        it('throws an exception if no key provided', function() {
            expect(function() {
                new MutexPromise();
            }).to.throw(Error);
        });

        it('can be used as function', function() {
            expect(MutexPromise('foo')).to.be.instanceOf(MutexPromise);
        });

    });

    describe('time()', function() {

        it('returns zero if mutex was never locked', function() {
            expect(createMutex().time()).to.be.equal(0);
        });

        it('returns zero if mutex was unlocked', function() {
            expect(createMutex().lock().unlock().time()).to.be.equal(0);
        });

        it('returns the expiration time when mutex was locked', function() {
            expect(createMutex().lock().time()).to.be.above(Date.now());
        });

    });

    describe('locked()', function() {

        it('returns false for newly created mutex', function() {
            expect(createMutex().locked()).to.be.false;
        });

        it('returns true for newly created and locked mutex', function() {
            expect(createMutex().lock().locked()).to.be.true;
        });

    });

    describe('promise()', function() {

        it('returns a promise that is resolved with mutex after timeout', function() {
            return createMutex()
                .lock()
                .promise()
                .then(function(m) {
                    expect(m).to.be.instanceOf(MutexPromise);
                    expect(m.time()).to.be.equal(0);
                });
        });

        it('returns a promise that is resolved when mutex is unlocked before timeout', function() {
            var m = createMutex({timeout: this.timeout()});
            setTimeout(function() { m.unlock(); });
            return m.lock().promise();
        });

        it('ensures sequential execution for chains', function() {
            var array = [];
            createMutex()
                .promise()
                .then(function(mutex) {
                    array.push(1);
                    return mutex.lock().promise();
                })
                .then(function(mutex) {
                    array.push(2);
                    return mutex.lock().promise();
                })
                .then(function(mutex) {
                    array.push(3);
                    return mutex.lock().promise();
                })
                .then(function(mutex) {
                    expect(mutex.lock()).to.be.false;
                    expect(array).to.equal([1, 2, 3]);
                });
        });

        it('ensures sequential execution for separate calls', function() {
            var mutex = createMutex().lock(),
                array = [];
            mutex.promise().then(function(mutex){
                mutex.lock();
                array.push(1);
            });
            mutex.promise().then(function(mutex){
                mutex.lock();
                array.push(2);
            });
            mutex.promise().then(function(mutex){
                mutex.lock();
                array.push(3);
            });
            mutex.promise().then(function(mutex){
                expect(mutex.lock()).to.be.false;
                expect(array).to.equal([1, 2, 3]);
            });
            mutex.unlock();
        });

    });

}));