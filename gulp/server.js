'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var util = require('util');

var browserSync = require('browser-sync');

function browserSyncInit(baseDir, files, browser) {
  browser = browser === undefined ? 'default' : browser;

  var routes = null;
  if(baseDir === paths.sample || (util.isArray(baseDir) && baseDir.indexOf(paths.sample) !== -1)) {
    routes = {
      '/bower_components': 'bower_components',
      '/dist' : 'dist'
    };
  }

  browserSync.instance = browserSync.init(files, {
    startPath: '/',
    server: {
      baseDir: baseDir,
      routes: routes
    },
    browser: browser
  });
}

gulp.task('serve', ['watch'], function () {
  browserSyncInit(
    paths.sample, [
    paths.sample + '*.html'
  ]);
});
