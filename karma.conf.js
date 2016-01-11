module.exports = function(config) {
    config.set({

        basePath: '',
        frameworks: ['browserify', 'jasmine'],

        files: [
            'test/modules/*.js'
        ],

        plugins: [
            'karma-browserify',
            'karma-jasmine',
            'karma-phantomjs-launcher'
        ],

        preprocessors: {
            'test/modules/*.js': ['browserify']
        },

        browserify: {
            debug: true,
            transform: [ 'babelify' ]
        },

        browsers: ['PhantomJS']

        // define reporters, port, logLevel, browsers etc.
    });
};