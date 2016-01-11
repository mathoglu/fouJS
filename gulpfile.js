var gulp = require('gulp');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var browserify = require('gulp-browserify');
var babelify = require('babelify');
var concat = require('gulp-concat');

var paths = {
    source: './src/',
    bower: './bower_components/',
    dist: './dist/',
    test: './test/',
    tmp: './.tmp/'
};

gulp.task('watch', function() {
    gulp.watch([paths.source + 'modules/*.js', paths.source + '*.js'], ['scripts']);
});

gulp.task('scripts', function () {
    return gulp.src([paths.source + 'fou.js'])
        .pipe(babel())
        .pipe(browserify({debug: true, transform: babelify}))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('benchmark', function () {
    return gulp.src([paths.test + 'benchmark/*.js'])
        .pipe(babel())
        .pipe(browserify({debug: true, transform: babelify}))
        .pipe(gulp.dest(paths.tmp + 'benchmark/'));
});

gulp.task('build', ['scripts']);
gulp.task('develop', ['build', 'watch']);