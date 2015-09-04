/**
 * Created by ltischuk on 12/29/14.
 * Directive: cropImage
 * Adds functionality to an HTML5 canvas element
 * restricted to elements
 * Receives options:
 * origImageData: a data URL that is two-way bound to controller variable
 * maxImgDisplayLength: (optional) max length in pixels to confine the canvas to in the DOM
 * croppedImgData: (optional) required input that is two-way bound to controller variable and is a DataURL of cropped image data
 * addCanvasBorder: (optional) boolean value (true or false) to turn on/off a 2px black border around canvas
 * selectorColor: (optional)string hex value of color for the selector square
 * selectorLineWidth: (optional) number value of border width in pixels
 * selectorStartX: (optional) placement x coordinate to draw the selector square - useful if saving coordinates for redrawing
 * selectorStartY: (optional) placement y coordinate to draw the selector square - useful if saving coordinates for redrawing
 * selectorStartLength: (optional) length of selector square to adhere to - useful if saving coordinates for redrawing
 * startCanvasImgProcessCallback: (optional) upon processing a new image, this is a function to call
 * postCanvasImgProcessCallback: (optional) upon finishing processing an image, this is a function to call
 *  - this function will return an object with width, height coordinates of the canvas
 * postSelectorMoveCallback: (optional) callback function to execute on each move of the selector square
 *  - this function will return an object with x,y,length and scale of the selector square.
 *  - The scale is the relation of the size of the square to the original image, since the image may be scaled down for drawing on the canvas
 *
 */
angular.module('ngcrop').directive('cropImage',
  function(CropCanvas,
           $window) {
      return {
          restrict: 'E',
          scope: {

            origImageFile: '=',
            croppedImgData: '=',
            maxImgDisplayLength: '=?',
            croppedImgFormat: '@?',
            addCanvasBorder: '@?',
            selectorColor: '@?',
            selectorLineWidth: '@?',
            selectorStartX: '@?',
            selectorStartY: '@?',
            selectorStartLength: '@?',
            startCanvasImgProcessCallback: '&?',
            postCanvasImgProcessCallback: '&?',
            postSelectorMoveCallback: '&?'

          },
          template: '<canvas></canvas>',
          link: function (scope, element, attrs) {

            // variables assess and set accordingly
            scope.selectorColor = angular.isDefined(attrs.selectorColor) ? scope.selectorColor : '#ff0000';
            scope.selectorLineWidth = angular.isDefined(attrs.selectorLineWidth) && angular.isNumber(Number(scope.selectorLineWidth)) ? Number(scope.selectorLineWidth) : 2;
            scope.croppedImgFormat = 'image/' + (angular.isDefined(attrs.croppedImgFormat) && (scope.croppedImgFormat == 'jpeg' || scope.croppedImgFormat == 'png') ? scope.croppedImgFormat : 'png');

            var _URL = $window.URL || $window.webkitURL;
            var blobURL = undefined;

            //maximum length of the canvas
            var maxCanvasLength = angular.isDefined(attrs.maxImgDisplayLength) && angular.isNumber(Number(scope.maxImgDisplayLength))? Number(scope.maxImgDisplayLength) : 300;

            //find canvas element on DOM
            var cvs = element.find('canvas');

            // add a border to the canvas if parameter exists
            if(angular.isDefined(attrs.addCanvasBorder) && scope.addCanvasBorder === 'true'){

              cvs.css({
                border: 'solid 2px #000000'
              });

            }

            //create a new instance of the CropCanvas
            var cropCanvas = new CropCanvas(cvs,maxCanvasLength, scope.selectorLineWidth, scope.selectorColor, scope.croppedImgFormat, onCropResult);

            //watch for changes on the main original image in the controller that contains the image (uploads of new images, etc.)
            scope.$watch(function(scope) { return scope.origImageFile },
              function(newFile) {

                if(angular.isDefined(newFile)){

                  if(angular.isDefined(attrs.startCanvasImgProcessCallback) && angular.isFunction(scope.startCanvasImgProcessCallback)){
                    //call function in parent if required for starting to process image
                    scope.startCanvasImgProcessCallback();

                  }

                  if(angular.isDefined(blobURL)){

                    _URL.revokeObjectURL(blobURL);

                  }
                  blobURL = _URL.createObjectURL(newFile);
                  cropCanvas.processNewImage(blobURL, scope.selectorStartX, scope.selectorStartY, scope.selectorStartLength, scope.postCanvasImgProcessCallback);

                }
              }
            );


            /**
             * Function to call on orientation change on mobile/tablet devices
             * Reprocess the image so that the coordinates can be reregistered
             */
            var orientationListener = function(){

              //android returns wrong values so we must set a timeout so that it properly orients screen
              //otherwise wrong points for selector square are set and touch events act strange
              setTimeout(function(){
                cropCanvas.processNewImage(scope.origImageData,scope.selectorStartX, scope.selectorStartY, scope.selectorStartLength, scope.postCanvasImgProcessCallback);
              },200);


            }


            //add the orientationchange event listener
            $window.addEventListener('orientationchange', orientationListener, false);

            /**
             * Callback to call each time a new cropped image result is obtained
             * @param imageData
             */
            function onCropResult(imageData){

              scope.croppedImgData = imageData;

              if(angular.isDefined(attrs.postSelectorMoveCallback) && angular.isFunction(scope.postSelectorMoveCallback)) {

                scope.postSelectorMoveCallback({selectorInfo: cropCanvas.getCropCanvasSelectorInfo()});

              }

            }


            /**
             * Remove all DOM elements once destroyed
             */
            scope.$on('$destroy', function() {

              //remove orientationchange event listener and destroy the cropCanvas
              $window.removeEventListener('orientationchange',orientationListener, false);
              cropCanvas.destroy();

            });

          }
      }
  });
