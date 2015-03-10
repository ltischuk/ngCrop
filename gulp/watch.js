'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

gulp.task('watch', function () {
  gulp.watch([
    paths.sample + '/*.html',
    'bower.json'
  ]);
});
