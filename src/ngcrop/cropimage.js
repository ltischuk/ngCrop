/**
 * Created by ltischuk on 12/29/14.
 * Directive: cropImage
 * Adds functionality to an HTML5 canvas element
 * restricted to elements
 * Receives options:
 * origImage - required input that is two-way bound to controller variable and is an Image object (the image to crop)
 * maxImgDisplayLength - max length in pixels to confine the canvas to in the DOM
 * croppedImgData: required input that is two-way bound to controller variable and is a DataURL of cropped image data
 * addCanvasBorder: boolean value (true or false) to turn on/off a 2px black border around canvas
 * selectorColor: string hex value of color for the selector square
 * selectorLineWidth: number value of border width in pixels
 *
 */
angular.module('ngcrop').directive('cropImage',
  function(CropCanvas,
           $window) {
      return {
          restrict: 'E',
          scope: {

            origImage: '=',
            croppedImgData: '=',
            maxImgDisplayLength: '=?',
            croppedImgFormat: '@?',
            addCanvasBorder: '@?',
            selectorColor: '@?',
            selectorLineWidth: '@?',
            selectorStartX: '@?',
            selectorStartY: '@?',
            selectorStartLength: '@?',
            postCanvasImgProcessCallback: '&?',
            postSelectorMoveCallback: '&?'

          },
          template: '<canvas></canvas>',
          link: function (scope, element) {

            // variables assess and set accordingly
            scope.selectorColor = angular.isDefined(scope.selectorColor) ? scope.selectorColor : '#ff0000';
            scope.selectorLineWidth = angular.isDefined(scope.selectorLineWidth) && angular.isNumber(Number(scope.selectorLineWidth)) ? Number(scope.selectorLineWidth) : 2;
            scope.croppedImgFormat = 'image/' + (angular.isDefined(scope.croppedImgFormat) && (scope.croppedImgFormat == 'jpeg' || scope.croppedImgFormat == 'png') ? scope.croppedImgFormat : 'png');

            //maximum length of the canvas
            var maxCanvasLength = angular.isDefined(scope.maxImgDisplayLength) && angular.isNumber(Number(scope.maxImgDisplayLength))? Number(scope.maxImgDisplayLength) : 300;

            //find canvas element on DOM
            var cvs = element.find('canvas');

            // add a border to the canvas if parameter exists
            if(angular.isDefined(scope.addCanvasBorder) && scope.addCanvasBorder === 'true'){

              cvs.css({
                border: 'solid 2px #000000'
              });

            }

            //create a new instance of the CropCanvas
            var cropCanvas = new CropCanvas(cvs,maxCanvasLength, scope.selectorLineWidth, scope.selectorColor, scope.croppedImgFormat, onCropResult);

            //watch for changes on the main original image in the controller that contains the image (uploads of new images, etc.)
            scope.$watch(function(scope) { return scope.origImage },
              function(newImage) {

                if(angular.isDefined(newImage)){

                  cropCanvas.processNewImage(newImage, scope.selectorStartX,scope.selectorStartY,scope.selectorStartLength );
                  if(angular.isFunction(scope.postCanvasImgProcessCallback)){

                    scope.postCanvasImgProcessCallback({canvasInfo: cropCanvas.getCropCanvasInfo()});

                  }

                }
              }
            );

            /**
             * Function to call on orientation change on mobile/tablet devices
             * Reprocess the image so that the coordinates can be reregistered
             */
            var orientationListener = function(){

              cropCanvas.processNewImage(scope.origImage);
              if(angular.isFunction(scope.postCanvasImgProcessCallback)) {

                scope.postCanvasImgProcessCallback({canvasInfo: cropCanvas.getCropCanvasInfo()});

              }

            }

            //add the orientationchange event listener
            $window.addEventListener('orientationchange', orientationListener, false);

            /**
             * Callback to call each time a new cropped image result is obtained
             * @param imageData
             */
            function onCropResult(imageData){

              scope.croppedImgData = imageData;

              if(angular.isFunction(scope.postSelectorMoveCallback)) {

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
