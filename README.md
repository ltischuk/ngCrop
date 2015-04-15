# ngCrop
An AngularJS module for image cropping

## Overview
ngCrop is an AngularJS module that provides a directive for image cropping within web browsers using the HTML5 canvas element.
The current version only works on Desktop browsers with Mobile support slated for the future.
The directive operates by inserting an HTML5 canvas on the DOM and drawing an image file that is bound to the isolate scope
of the directive.  The directive watches for new images to update the canvas.  Please use this code at your own discretion.

## Requirements

* AngularJS 1.2.x (Tested with 1.2.28)
* HTML5 supported browsers

## Download/Install Instructions
Download the distribution file or if using Bower, add as a dependency in your bower.json file.  Add ngcrop as a module dependency in your main application
js file and then attach the ngcrop directive to an HTML element in your application.  See the sample test page for an example.  You can view the sample page
by running the <code> gulp serve </code> command.

## Options

* origImage : the HTML image file element of an image
* maxImgDisplayLength: the maximum length that the image should conform to for display on canvas
* croppedImgData: the variable which will be bound to the resulting cropped image data URL
* croppedImgFormat: the text representation of the desired format of cropped image data URL - should be either 'jpeg' or 'png'. Default is png.
* addCanvasBorder: a boolean value of whether or not to turn on a 2px, black border surrounding the canvas
* selectorColor: crop selector color - default is red (#ff0000)
* selectorLineWidth: crop selector line width - default is 2px

