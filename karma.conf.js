'use strict';

module.exports = function(config) {

  config.set({
    autoWatch : false,

    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/ngcrop/ngcrop.js',
      'src/ngcrop/exif.js',
      'src/ngcrop/*.js',
      'src/ngcrop/test/**/*.spec.js',
      {pattern: 'sample/*.jpeg', included: false, served: true}

    ],

    browsers : ['PhantomJS'],

    plugins : [
        'karma-phantomjs-launcher',
        'karma-jasmine'
    ]
  });
};
