# ngCrop

An AngularJS module for image cropping

## Overview

ngCrop is an AngularJS module that provides a directive for image cropping within web browsers using the HTML5 canvas element.
The directive operates by inserting an HTML5 canvas on the DOM and drawing an image file that is bound to the isolate scope
of the directive.  The directive watches for new images to update the canvas.  Please use this code at your own discretion.
<br><b>UPDATE: This module now is now fully featured to support cropping on both desktop and mobile devices.</b>

## Requirements

* AngularJS 1.2.x (Tested with 1.2.28)
* HTML5 supported browsers

## Download/Install Instructions
Download the distribution file or if using Bower, add as a dependency in your bower.json file.  
Add ngcrop as a module dependency in your main application js file and then attach the ngcrop directive to an HTML element in your application.  
See the sample test page for an example.  You can view the sample page by running the <code> gulp serve </code> command.

## Options

* origImage : the HTML image file element of an image
* croppedImgData: the variable which will be bound to the resulting cropped image data URL
* maxImgDisplayLength: (optional) the maximum length that the image should conform to for display on canvas in pixels
* croppedImgFormat: (optional) the text representation of the desired format of cropped image data URL - should be either 'jpeg' or 'png'. Default is png.
* addCanvasBorder: (optional) a boolean value of whether or not to turn on a 2px, black border surrounding the canvas
* selectorColor: (optional) crop selector color - default is red (#ff0000)
* selectorLineWidth: (optional) crop selector line width - default is 2px
* selectorStartX: (optional) initial x coordinate on canvas to draw the selector square (useful is saving off previous value from callback to redraw later)
* selectorStartY: (optional) initial y coordinate on canvas to draw the selector square
* selectorStartLength: (optional) initial length coordinate on canvas to draw the selector square
* startCanvasImgProcessCallback: (optional) function to call once a new image is detected and processing starts to draw the image on canvas
* postCanvasImgProcessCallback: (optional) function to call once the canvas has processed and drawn a new image with the selector square on top of it.<br>
 Additionally, returns a convenience object containing properties: width and height of the shown canvas
* postSelectorMoveCallback: (optional) function to call once the selector is drawn and/or changed on the canvas 
 Additionally, returns a convenience object containing properties:<br>
 	* x: the left property of the selector square<br>
 	* y: the top property of the selector square<br>
 	* length: the length of the square<br>
 	* scale: the scale ratio of the original image to the resized image displaying in the canvas

## Demo

For a demo of this library, visit this Plunker: http://plnkr.co/edit/nPHBVzIdgwhZYlFOCFPD?p=preview.
Alternatively, you can download this project locally and in the root directory, run the command <code> gulp build </code> followed by <code> gulp serve </code>.  
The later command will launch a browser at url: localhost:3000 with a demo.