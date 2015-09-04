/**
 * Created by ltischuk on 2/10/15.
 * Factory: CropCanvas
 * Hosts an HTML5 canvas element and controls behavior such as:
 *  - drawing image and square on top of canvas given input points
 *  - obtaining data URL from a resultCanvas instance
 */
angular.module('ngcrop')
    .factory('CropCanvas',
    function CropCanvasFactory
        (CropSelection,
         ResultCanvas)
    {

      /**
       * Class to control the crop canvas which controls the main canvas and
       * @param canvasElement - the canvasElement to draw on
       * @param maxLength - maximum length of the canvas
       * @param selectorLineWidth - the selector square line width
       * @param selectorColor - the selector square color
       * @param outputImageFormat - the format of the resulting cropped image
       * @param onCropResult - callback to execute after selector square move is complete
       * @constructor
       */
      function CropCanvas(canvasElement, maxLength, selectorLineWidth, selectorColor, outputImageFormat, onCropResult){

        this.canvas = canvasElement;
        this.context = canvasElement[0].getContext('2d');
        this.resultCanvas = angular.isDefined(outputImageFormat) ? new ResultCanvas(outputImageFormat): new ResultCanvas('image/png');
        this.maxLength = maxLength;
        this.cropSelector = new CropSelection(maxLength);
        this.selectorLineWidth = selectorLineWidth;
        this.selectorColor = selectorColor;
        this.selectorStartX = 0;
        this.selectorStartY = 0;
        this.selectorStartLength = 0;
        this.imgScale = 1;
        this.isSelecting = false;
        this.moveCorner = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.corner = 0;
        this.canvasLeftPos = 0;
        this.canvasTopPos = 0;
        this.currentImg = undefined;
        this.onCropResult = onCropResult;
        this._addEventHandlers();
        this.postNewImageProcessingCallback = undefined;

      }


      /**
       * Prototype methods getters/setters for public accessors
       *
       **/
      CropCanvas.prototype = {


        /**
         * adds event handlers to the canvas for mouse events
         * @private
         */
        _addEventHandlers: function(){

          var that = this;

          //on mousedown event
          this.canvas.on('mousedown', function(e) {

            that._handleDown(e);

          });

          //on mouseup event
          this.canvas.on('mouseup', function(e) {

            that._handleUp(e);

          });

          //onmousemove event
          this.canvas.on('mousemove', function(e) {

            that._handleMove(e);

          });

          //onmouseout event
          this.canvas.on('mouseout', function(e){

            that._handleUp(e);

          });

          //on touchstart event
          this.canvas.on('touchstart', function(e) {

            that._handleDown(e);

          });

          //touchmove event
          this.canvas.on('touchmove', function(e) {

            that._handleMove(e);

          });

          //on touchend event
          this.canvas.on('touchend', function(e) {

            that._handleUp(e);

          });

          //on touchleave event
          this.canvas.on('touchleave', function(e) {

            that._handleUp(e);

          });

      },
        /**
         * Method to encapsulate functionality for when mousedown or touchstart event is fired
         * @param e
         * @private
         */
        _handleDown: function(e){

          e.preventDefault();
          console.log('in handle down');
          var currentEvent = angular.isDefined(e.touches) ? e.touches[0] : e;
          var scrollX = document.body && document.body.scrollLeft !== null ? document.body.scrollLeft : document.documentElement.scrollLeft;
          var scrollY = document.body && document.body.scrollTop !== null ? document.body.scrollTop : document.documentElement.scrollTop;;

          this.currentX = ((currentEvent.pageX ? currentEvent.pageX : e.clientX + scrollX) - this.canvasLeftPos);
          this.currentY = ((currentEvent.pageY ? currentEvent.pageY : e.clientY + scrollY) - this.canvasTopPos);

          this.lastX = this.currentX;
          this.lastY = this.currentY;
          this.isSelecting = true;
          this.cropSelector.setCurrentCorner(this.currentX, this.currentY);

          //if in move zone which will move selector horizontally or vertically
          //change cursor and set moveCorner to false
          if(this.cropSelector.isInMoveZone(this.currentX, this.currentY)){

            this.canvas[0].style.cursor = 'move';
            this.moveCorner = false;

          }
          else{

            // we are in corner zone - find nearest corner and set moveCorner to true
            this.canvas[0].style.cursor = 'crosshair';
            this.corner = this.cropSelector.nearestCorner(this.currentX, this.currentY);
            this.moveCorner = true;

          }

        },
        /**
         * Method to encapsulate functionality for when mousemove or touchmove event is fired
         * @param e
         * @private
         */
        _handleMove: function(e){

          e.preventDefault();
          console.log('in handle move');
          var currentEvent = angular.isDefined(e.touches) ? e.touches[0] : e;
          var scrollX = document.body && document.body.scrollLeft !== null ? document.body.scrollLeft : document.documentElement.scrollLeft;
          var scrollY = document.body && document.body.scrollTop !== null ? document.body.scrollTop : document.documentElement.scrollTop;;

          this.currentX = ((currentEvent.pageX ? currentEvent.pageX : e.clientX + scrollX) - this.canvasLeftPos);
          this.currentY = ((currentEvent.pageY ? currentEvent.pageY : e.clientY + scrollY) - this.canvasTopPos);

          //if we are not in isSelecting state yet, assess next move
          if(!this.isSelecting){

            if(this.cropSelector.isInMoveZone(this.currentX, this.currentY)){
              this.canvas[0].style.cursor = 'move';
            }
            else{

              this.canvas[0].style.cursor = 'crosshair';
              this.moveCorner = true;

            }

          }else{

            //we are in isSelecting state, draw the canvas, assess move, then redraw canvas
            this._drawCanvas();

            var xdiff = this.currentX - this.lastX;
            var ydiff = this.currentY - this.lastY;

            this.cropSelector.move(xdiff, ydiff, this.moveCorner, this.corner);
            this.lastX = this.currentX;
            this.lastY = this.currentY;
            this._drawCanvas();
          }

        },
        /**
         * Method to encapsulate functionality for when mouseup or touchend/touchcancel event is fired
         * @private
         */
        _handleUp: function(e){

          e.preventDefault();
          console.log('in handle up');
          //turn selector guide variables off and output cropped image data from current selector location
          this.isSelecting = false;
          this.moveCorner = false;
          this.cropSelector.resetCorner();
          this._drawCanvas();
          this.canvas[0].style.cursor = 'default';
          this.getCroppedImageData();

        },
        /**
         * Method to redraw the canvas, image and selector square
         * @private
         */
        _drawCanvas: function(){

          console.log('drawing canvas');
          //clear the selector rectangle first
          var canvasWidth = this.canvas[0].width;
          var canvasHeight = this.canvas[0].height;
          this.context.clearRect(0, 0, canvasWidth, canvasHeight);

          var x = 0;
          var y = 0;
          var drawWidth = canvasWidth;
          var drawHeight = canvasHeight;
          var selectorMiddleX = this.cropSelector.x + (this.cropSelector.length/2);
          var selectorMiddleY = this.cropSelector.y + (this.cropSelector.length/2);
          var arrowLength = this.cropSelector.length / 4;

          this.context.drawImage(this.currentImg,x,y,drawWidth,drawHeight);

          //then draw the rectangle
          this.context.lineWidth = this.selectorLineWidth;
          this.context.strokeStyle = this.selectorColor;
          this.context.strokeRect(this.cropSelector.x,this.cropSelector.y,this.cropSelector.length,this.cropSelector.length);

          this.context.beginPath();
          this.context.lineWidth = 1;
          this.context.moveTo(selectorMiddleX -4, selectorMiddleY);
          this.context.lineTo(selectorMiddleX + 4, selectorMiddleY);
          this.context.moveTo(selectorMiddleX, selectorMiddleY-4);
          this.context.lineTo(selectorMiddleX, selectorMiddleY+4);
          this.context.stroke();

          //draw an error in the bottom lefthand corner
          this.context.beginPath();
          this.context.lineWidth = 2;
          this.context.moveTo(this.cropSelector.x + (this.cropSelector.length  - (arrowLength/4)), this.cropSelector.y + (this.cropSelector.length  - (arrowLength/4)));
          this.context.lineTo(this.cropSelector.x + (this.cropSelector.length  - (arrowLength/2)), this.cropSelector.y + (this.cropSelector.length  - (arrowLength/4)));
          this.context.lineTo(this.cropSelector.x + (this.cropSelector.length  - (arrowLength/4)), this.cropSelector.y + (this.cropSelector.length  - (arrowLength/2)));
          this.context.lineTo(this.cropSelector.x + (this.cropSelector.length  - (arrowLength/4)), this.cropSelector.y + (this.cropSelector.length  - (arrowLength/4)));
          this.context.closePath();
          this.context.fillStyle = this.selectorColor;
          this.context.fill();


        },
        /**
         * Draw the cropped image portion to the result canvas and
         * get resulting image data URL and call callback function
         */
        getCroppedImageData: function(){

          console.log('get cropped data');
          var x = this.cropSelector.x/this.imgScale;
          var y = this.cropSelector.y/this.imgScale;
          var len = this.cropSelector.length/this.imgScale;
          var data = this.resultCanvas.getDataUrl(this.currentImg, x, y,len);

          //callback draw data
          this.onCropResult(data);

        },
        /**
         * Opportunity to provide an object containing information regarding canvas width and height if needed
         * @returns {width: canvas width, height: canvas height}
         */
        getCropCanvasInfo: function(){

          console.log('get cropepd canvas info');
          return {

              width: this.canvas[0].width,
              height : this.canvas[0].height

          }

        },
        /**
         * Opportunity to return an object with the coordinates of the selector
         * @returns {{x: *, y: *, length: *, scale: *}}
         */
        getCropCanvasSelectorInfo: function(){

          return {

              x: this.cropSelector.x,
              y: this.cropSelector.y,
              length: this.cropSelector.length,
              scale: this.imgScale

            }

        },
        _handleImageOrientation : function(blobURL){

          console.log('handle image orientation');
          var postimgcallback = this._scaleCanvasAndInitializeSelector.bind(this);
          var tempImg = new Image();

          tempImg.onload = function(){


            EXIF.getData(tempImg, function(){

              var orientation = EXIF.getTag(tempImg, 'Orientation');
              if(orientation === 6 || orientation === 8 || orientation === 3){

                //must scale down the image as images over 2048 px will not draw on HTML5 canvas
                var scale = Math.min ((2000 / tempImg.width),(2000/ tempImg.height), 1);
                var tempCanvas = document.createElement('canvas');
                var tempContext = tempCanvas.getContext('2d');
                var height = (orientation == 6 || orientation == 8) ? tempImg.width * scale : tempImg.height * scale;
                var width = (orientation == 6 || orientation == 8) ? tempImg.height * scale : tempImg.width * scale;
                tempCanvas.height = height;
                tempCanvas.width = width;
                var x = 0;
                var y = 0;

                switch(orientation){

                  case 3: {

                    // 180 degrees rotate
                    tempContext.translate(width/2,height/2);
                    tempContext.rotate(Math.PI);
                    //draw the image to the canvas
                    x = -(height/2);
                    y = -(width/2);
                    break;

                  }
                  case 6: {

                    // 90° rotate right
                    tempContext.translate(width/2,height/2);
                    tempContext.rotate(0.5 * Math.PI);
                    //draw the image to the canvas
                    x = -(height/2);
                    y = -(width/2);
                    break;

                  }
                  case 8: {

                    // 90° rotate left
                    tempContext.translate(width/2,height/2);
                    tempContext.rotate(-0.5 * Math.PI);
                    //draw the image to the canvas
                    x = -(height/2);
                    y = -(width/2);
                    break;

                  }

                }


                //draw the image
                tempContext.drawImage(tempImg,x,y,height,width);
                //grab the image data and save as a newAdjustedImage to pass to processNewImage
                var source = tempCanvas.toDataURL();
                var newAdjustedImage = new Image();
                newAdjustedImage.onload = function(){

                  postimgcallback(this);

                }

                newAdjustedImage.src = source;

              }else{

                postimgcallback(tempImg);
              }

            });

          }

          tempImg.src = blobURL;

        },

        /**
         * Process a new image on the canvas and init variables for canvas and cropSelector
         * @param img
         */
        processNewImage: function(blobURL,selectorStartX, selectorStartY, selectorStartLength, callback){

          console.log('process new image');
          this.postNewImageProcessingCallback = callback;
          this.selectorStartX = selectorStartX;
          this.selectorStartY = selectorStartY;
          this.selectorStartLength = selectorStartLength;
          //handle the image orientation
          this._handleImageOrientation(blobURL);

        },
        _scaleCanvasAndInitializeSelector : function(img){

          this.imgScale = Math.min ((this.maxLength / img.width),(this.maxLength/ img.height), 1);

          this.canvas[0].height = (img.height * this.imgScale);
          this.canvas[0].width = (img.width * this.imgScale);

          //initialize cropSelector dimensions
          this.cropSelector.initSelectorDimensions(this.canvas[0].width, this.canvas[0].height,
              this.selectorStartX, this.selectorStartY, this.selectorStartLength);

          //obtain bounds for the rectangle to assess mouse/touch event points
          var rect = this.canvas[0].getBoundingClientRect();
          this.canvasLeftPos = rect.left;
          this.canvasTopPos = rect.top;

          //set currently image variable, draw the canvas
          // then get the cropped image data from current cropSelector position
          this.currentImg = img;
          this._drawCanvas();
          this.getCroppedImageData();
          this.postNewImageProcessingCallback({canvasInfo: this.getCropCanvasInfo()})

        },
        /**
         * When parent scope is destroyed, clean up the DOM and remove elements
         */
        destroy: function(){

          this.canvas.off('mousedown',this._handleDown);
          this.canvas.off('mouseup',this._handleUp);
          this.canvas.off('mouseout',this._handleUp);
          this.canvas.off('mousemove',this._handleMove);
          this.canvas.off('touchstart',this._handleDown);
          this.canvas.off('touchmove',this._handleMove);
          this.canvas.off('touchleave',this._handleUp);
          this.canvas.off('touchend',this._handleUp);
          this.canvas.remove();

        }

      }

      return CropCanvas;

    }
);