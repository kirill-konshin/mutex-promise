module.exports = function(config) {

    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai'],
        files: [
            require.resolve('phantomjs-polyfill/bind-polyfill'),
            require.resolve('es6-promise/dist/es6-promise'),
            './index.js',
            './index.spec.js'
        ],
        preprocessors: {
            './index.js': ['coverage']
        },
        coverageReporter: {
            type: 'lcov',
            dir: './build'
        },
        exclude: [],
        reporters: [
            'coverage',
            'mocha'
        ],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        plugins: [
            'karma-chai',
            'karma-coverage',
            'karma-mocha',
            'karma-mocha-reporter',
            'karma-phantomjs-launcher'
        ],
        browsers: [
            'PhantomJS'
        ],
        singleRun: false,
        client: {
            captureConsole: true,
            showDebugMessages: true,
            mocha: {
                ui: "bdd",
                timeout: 5000

            }
        }
    })
};
