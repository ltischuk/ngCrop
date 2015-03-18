/**
 * Created by ltischuk on 11/8/14.
 * Directive: cropImage
 */
angular.module('ngcrop').directive('cropImage',
  function(CropSelection,
           CropCanvas) {
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
          link: function (scope, element, attrs) {

            var cvs = element.find('canvas');
            var canvasLength = angular.isDefined(scope.maxImgDisplayLength) && angular.isNumber(Number(scope.maxImgDisplayLength))? Number(scope.maxImgDisplayLength) : 300;
            var ctx = cvs[0].getContext('2d');
            var selector = new CropSelection(canvasLength);
            var cropCanvas = new CropCanvas();
            var isSelecting = false;
            var moveCorner = false;
            var lastMouseX = 0;
            var lastMouseY = 0;
            var mouseX = 0;
            var mouseY = 0;
            scope.selectorColor = angular.isDefined(scope.selectorColor) ? scope.selectorColor : '#ff0000';
            scope.selectorLineWidth = angular.isDefined(scope.selectorLineWidth) && angular.isNumber(Number(scope.selectorLineWidth)) ? Number(scope.selectorLineWidth) : 2;
            scope.croppedImgFormat = 'image/' + (angular.isDefined(scope.croppedImgFormat) && (scope.croppedImgFormat == 'jpeg' || scope.croppedImgFormat == 'png') ? scope.croppedImgFormat : 'png');


              //watch for changes on the image in the controller that contains the image
            scope.$watch(function(scope) { return scope.origImage },
              function(newImage) {

                if(angular.isDefined(newImage)){

                  selector.setScalesToImage(newImage);
                  cvs[0].width = selector.scaledWidth;
                  cvs[0].height = selector.scaledHeight;
                  drawImageOnCanvas();
                  calibrateCroppedImageData();

                }
              }
            );

            function validateInputs(){


            }

            /**
             * Method: drawImageOnCanvas
             * draws the image and the selector square on top of the image dynamically
             */
            function drawImageOnCanvas(){

              ctx.clearRect(0, 0, element.width, element.height);

              var sX =  0;
              var sY =  0;
              var sWidth =  scope.origImage.width;
              var sHeight =  scope.origImage.height;
              var drawWidth = selector.scaledWidth;
              var drawHeight = selector.scaledHeight;

              //draw the image to the canvas
              ctx.drawImage(scope.origImage,sX,sY,sWidth,sHeight,0,0,drawWidth,drawHeight);
              ctx.lineWidth = scope.selectorLineWidth;
              ctx.strokeStyle = scope.selectorColor;
              ctx.strokeRect(selector.x,selector.y,selector.length,selector.length);

            }

            /**
             * Obtains the cropped image data URL by drawing the cropped image on
             * a private cropCanvas instance and calling toDataURL
             */
            function calibrateCroppedImageData(){

              scope.croppedImgData = cropCanvas.getDataUrl(scope.origImage,
                selector.scaledX, selector.scaledY, selector.scaledLength , selector.scaledWidth, selector.scaledHeight);

            }

            /**
             * Handles the event for mouse down on the main canvas
             * @param e
             */
            function handleMouseDown(e){

              mouseX = e.offsetX;
              mouseY = e.offsetY;
              lastMouseX = mouseX;
              lastMouseY = mouseY;
              isSelecting = true;
              selector.setCurrentCorner(mouseX, mouseY);

            }

            /**
             * Handles the even for mouse move on the main canvas
             * @param e
             */
            function handleMouseMove(e){

              var corner = 0;
              mouseX = e.offsetX;
              mouseY = e.offsetY;

              if(selector.isInMoveZone(mouseX, mouseY)){
                cvs[0].style.cursor = 'move';
                moveCorner = false;
              }
              else{
                cvs[0].style.cursor = 'crosshair';
                corner = selector.nearestCorner(mouseX, mouseY);
                moveCorner = true;

              }

              if (isSelecting) {

                drawImageOnCanvas(false);

                var xdiff = mouseX - lastMouseX;
                var ydiff = mouseY - lastMouseY;

                selector.move(xdiff, ydiff, moveCorner, corner);
                lastMouseX = mouseX;
                lastMouseY = mouseY;
                drawImageOnCanvas(false);
              }

            }

            /**
             * Handles mouseUp (or mouseOut) event on the main canvas
             * @param e
             */
            function handleMouseUp(e){
              isSelecting = false;
              moveCorner = false;
              drawImageOnCanvas();
              cvs[0].style.cursor = 'default';
              calibrateCroppedImageData();
            }

            cvs.on('mousedown', function(e) {

                handleMouseDown(e);

            });

            cvs.on('mouseup', function(e) {

                handleMouseUp(e);

            });

            cvs.on('mousemove', function(e) {

                handleMouseMove(e);

            });

            cvs.on('mouseout', function(e){

              handleMouseUp(e);

            });


            scope.$on('$destroy', function() {

              cropCanvas.destroy();
              cvs.off('mousedown',handleMouseDown);
              cvs.off('mouseup',handleMouseUp);
              cvs.off('mouseout',handleMouseUp);
              cvs.off('mousemove',handleMouseMove);
              cvs.remove();

            });

          }
      }
  });
