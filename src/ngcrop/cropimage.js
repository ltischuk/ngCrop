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

            scope.selectorColor = angular.isDefined(scope.selectorColor) ? scope.selectorColor : '#ff0000';
            scope.selectorLineWidth = angular.isDefined(scope.selectorLineWidth) && angular.isNumber(Number(scope.selectorLineWidth)) ? Number(scope.selectorLineWidth) : 2;
            scope.croppedImgFormat = 'image/' + (angular.isDefined(scope.croppedImgFormat) && (scope.croppedImgFormat == 'jpeg' || scope.croppedImgFormat == 'png') ? scope.croppedImgFormat : 'png');

            var canvasLength = angular.isDefined(scope.maxImgDisplayLength) && angular.isNumber(Number(scope.maxImgDisplayLength))? Number(scope.maxImgDisplayLength) : 300;
            var cvs = element.find('canvas');
            var cropCanvas = new CropCanvas(cvs,canvasLength, scope.selectorLineWidth, scope.selectorColor);
            cropCanvas.setResultCanvasDataFormat(scope.croppedImgFormat);

              //watch for changes on the image in the controller that contains the image
            scope.$watch(function(scope) { return scope.origImage },
              function(newImage) {

                if(angular.isDefined(newImage)){

                  cropCanvas.processNewImage(newImage, onCropResult);

                }
              }
            );

            function onCropResult(imageData){

              scope.croppedImgData = imageData;

            }


            scope.$on('$destroy', function() {

              cropCanvas.destroy();

            });

          }
      }
  });
