/**
 * Created by ltischuk on 11/8/14.
 * Directive: cropImage
 */
angular.module('ngcrop').directive('cropImage',
  function(CropCanvas) {
      return {
          restrict: 'E',
          scope: {

            origImage: '=',
            maxImgDisplayLength: '=',
            croppedImgData: '=',
            croppedImgFormat: '@',
            canvasStyle: '@',
            selectorColor: '@',
            selectorLineWidth: '@'

          },
          template: '<canvas class="{{canvasStyle}}"></canvas>',
          link: function (scope, element) {

            // variables assess and set accordingly
            scope.selectorColor = angular.isDefined(scope.selectorColor) ? scope.selectorColor : '#ff0000';
            scope.selectorLineWidth = angular.isDefined(scope.selectorLineWidth) && angular.isNumber(Number(scope.selectorLineWidth)) ? Number(scope.selectorLineWidth) : 2;
            scope.croppedImgFormat = 'image/' + (angular.isDefined(scope.croppedImgFormat) && (scope.croppedImgFormat == 'jpeg' || scope.croppedImgFormat == 'png') ? scope.croppedImgFormat : 'png');
            var canvasLength = angular.isDefined(scope.maxImgDisplayLength) && angular.isNumber(Number(scope.maxImgDisplayLength))? Number(scope.maxImgDisplayLength) : 300;

            //find canvas element on DOM
            var cvs = element.find('canvas');

            //create a new instance of the CropCanvas
            var cropCanvas = new CropCanvas(cvs,canvasLength, scope.selectorLineWidth, scope.selectorColor, scope.croppedImgFormat);

            //watch for changes on the main original image in the controller that contains the image (uploads of new images, etc.)
            scope.$watch(function(scope) { return scope.origImage },
              function(newImage) {

                if(angular.isDefined(newImage)){

                  cropCanvas.processNewImage(newImage, onCropResult);

                }
              }
            );

            /**
             * Callback to call each time a new cropped image result is obtained
             * @param imageData
             */
            function onCropResult(imageData){

              scope.croppedImgData = imageData;

            }


            /**
             * Remove all DOM elements once destroyed
             */
            scope.$on('$destroy', function() {

              cropCanvas.destroy();

            });

          }
      }
  });
