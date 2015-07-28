/**
 * Created by ltischuk on 1/19/15.
 */
angular
    .module('ngcrop', [])
    .constant("ngCropConstants", {
      POSITIONS:{
        TOP_LEFT: 1,
        TOP_RIGHT: 2,
        BOTTOM_LEFT: 3,
        BOTTOM_RIGHT :4
      }
    });

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
       * @param canvasElement
       * @param maxLength
       * @param selectorWidth
       * @param selectorColor
       * @param outputImageFormat
       * @constructor
       */
      function CropCanvas(canvasElement, maxLength, selectorWidth, selectorColor, outputImageFormat, onCropResult){

        this.canvas = canvasElement;
        this.context = canvasElement[0].getContext('2d');
        this.resultCanvas = angular.isDefined(outputImageFormat) ? new ResultCanvas(outputImageFormat): new ResultCanvas('image/png');
        this.maxLength = maxLength;
        this.cropSelector = new CropSelection(maxLength);
        this.selectorLineWidth = selectorWidth;
        this.selectorColor = selectorColor;
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

      }


      /**
       * Prototype methods
       *
       **/
      CropCanvas.prototype = {

        //accessor methods for variables

        get canvas() {

          return this._canvas;

        },
        set canvas(cvs){

          this._canvas = cvs;

        },
        get context() {

          return this._context;

        },
        set context(context){

          this._context = context;

        },
        get resultCanvas() {

          return this._resultCanvas;

        },
        set resultCanvas(resultCanvas){

          this._resultCanvas = resultCanvas;

        },
        get maxLength() {

          return this._maxLength;

        },
        set maxLength(maxLength){

          this._maxLength = maxLength;

        },
        get cropSelector() {

          return this._cropSelector;

        },
        set cropSelector(cropSelector){

          this._cropSelector = cropSelector;

        },
        get selectorLineWidth() {

          return this._selectorLineWidth;

        },
        set selectorLineWidth(selectorLineWidth){

          this._selectorLineWidth = selectorLineWidth;

        },
        get selectorColor() {

          return this._selectorColor;

        },
        set selectorColor(selectorColor){

          this._selectorColor = selectorColor;

        },
        get imgScale() {

          return this._imgScale;

        },
        set imgScale(imgScale){

          this._imgScale = imgScale;

        },
        get isSelecting() {

          return this._isSelecting;

        },
        set isSelecting(isSelecting){

          this._isSelecting = isSelecting;

        },
        get moveCorner() {

          return this._moveCorner;

        },
        set moveCorner(moveCorner){

          this._moveCorner = moveCorner;

        },
        get lastX() {

          return this._lastMouseX;

        },
        set lastX(lastMouseX){

          this._lastMouseX = lastMouseX;

        },
        get lastY() {

          return this._lastMouseY;

        },
        set lastY(lastMouseY){

          this._lastMouseY = lastMouseY;

        },
        get currentX() {

          return this._mouseX;

        },
        set currentX(mouseX){

          this._mouseX = mouseX;

        },
        get currentY() {

          return this._mouseY;

        },
        set currentY(mouseY){

          this._mouseY = mouseY;

        },
        get corner() {

          return this._corner;

        },
        set corner(corner){

          this._corner = corner;

        },
        get canvasLeftPos(){

          return this._canvasLeftPos;

        },
        set canvasLeftPos(left){

          this._canvasLeftPos = left;

        },
        get canvasTopPos(){

          return this._canvasTopPos;

        },
        set canvasTopPos(top){

          this._canvasTopPos = top;

        },
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

          //touchcancel event
          this.canvas.on('touchcancel', function(e){

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
          var isMobile = (angular.isDefined(e.touches));
          this.currentX = ((isMobile ? e.touches[0].clientX : e.clientX) - this.canvasLeftPos);
          this.currentY = ((isMobile ? e.touches[0].clientY : e.clientY) - this.canvasTopPos);
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
          var isMobile = (angular.isDefined(e.touches));
          this.currentX = ((isMobile ? e.touches[0].clientX  : e.clientX) - this.canvasLeftPos);
          this.currentY = ((isMobile ? e.touches[0].clientY  : e.clientY) - this.canvasTopPos);

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
          //turn selector guide variables off and output cropped image data from current selector location
          this.isSelecting = false;
          this.moveCorner = false;
          this._drawCanvas();
          this.canvas[0].style.cursor = 'default';
          this.getCroppedImageData();

        },
        /**
         * Method to redraw the canvas
         * @private
         */
        _drawCanvas: function(){

          //clear the selector rectangle first
          this.context.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);

          //draw the image to the canvas
          this.context.drawImage(this.currentImg,0,0,this.currentImg.width,this.currentImg.height,0,0,this.canvas[0].width,this.canvas[0].height);

          //then draw the rectangle
          this.context.lineWidth = this.selectorLineWidth;
          this.context.strokeStyle = this.selectorColor;
          this.context.strokeRect(this.cropSelector.x,this.cropSelector.y,this.cropSelector.length,this.cropSelector.length);


        },
        /**
         * Draw the cropped image portion to the result canvas and
         * get resulting image data URL and call callback function
         */
        getCroppedImageData: function(){

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
        /**
         * Process a new image on the canvas and init variables for canvas and cropSelector
         * @param img
         */
        processNewImage: function(img,selectorStartX, selectorStartY, selectorStartLength){

          //obtain image scale and set canvas dimensions
          this.imgScale = Math.min ((this.maxLength / img.width),(this.maxLength/ img.height), 1);
          this.canvas[0].width = img.width * this.imgScale;
          this.canvas[0].height = img.height * this.imgScale;

          //initialize cropSelector dimensions
          this.cropSelector.initSelectorDimensions(this.canvas[0].width, this.canvas[0].height,
              selectorStartX, selectorStartY, selectorStartLength);

          //obtain bounds for the rectangle to assess mouse event points
          var rect = this.canvas[0].getBoundingClientRect();
          this.canvasLeftPos = rect.left;
          this.canvasTopPos = rect.top;

          //set currently image variable, draw the canvas
          // then get the cropped image data from current cropSelector position
          this.currentImg = img;
          this._drawCanvas();
          this.getCroppedImageData();

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
          this.canvas.off('touchmove',this._handleUp);
          this.canvas.off('touchend',this._handleUp);
          this.canvas.off('touchcancel',this._handleMove);
          this.canvas.remove();

        }

      }

      return CropCanvas;

    }
);
/**
 * Created by ltischuk on 2/7/15.
 */
angular.module('ngcrop')
  .factory('CropSelection', function CropSelectionFactory(ngCropConstants) {

    /**
     * CropSelection
     * A class to support the movement of a square selector on top of a canvas
      * @param maxLength
     * @constructor
     */
    function CropSelection(){

      this.x = 0;
      this.y = 0;
      this.length = 0;
      this.outerCushion = 2;
      this.maxX = 0;
      this.maxY = 0;
      this.currentCorner = 0;

    }

      /**
       * Prototype functions
       **/
    CropSelection.prototype = {

      //accessor methods
      get x(){

        return this._x;

      },
      set x(x){

        this._x = x;

      },
      get y(){

        return this._y;

      },
      set y(y){

        this._y = y;

      },
      get length(){

        return this._length;

      },
      set length(length){

        this._length = length;

      },
      get outerCushion(){

        return this._outerCushion;

      },
      set outerCushion(outerCushion){

        this._outerCushion = outerCushion;

      },
      get maxX(){

        return this._maxX;

      },
      set maxX(maxX){

        this._maxX = maxX;

      },
      get maxY(){

        return this._maxY;

      },
      set maxY(maxY){

        this._maxY = maxY;

      },
      get currentCorner(){

        return this._currentCorner;

      },
      set currentCorner(currentCorner){

        this._currentCorner = currentCorner;

      },
      /**
       * Set the selector dimensions given a new canvas (parent) width and height
       * @param parentWidth
       * @param parentHeight
       * @param (optional) startX - starting value of X within the canvas dimensions
       * @param (optional) startY - starting value of Y within the canvas dimensions
       * @param (optional) startLength - starting value of length within the canvas dimensions
       *
       */
      initSelectorDimensions : function(parentWidth, parentHeight, startX, startY, startLength){

        this.maxX = parentWidth - this.outerCushion;
        this.maxY = parentHeight - this.outerCushion;

        startX = Number(startX);
        startY = Number(startY);
        startLength = Number(startLength);

        if(angular.isDefined(startX) && angular.isDefined(startY) && angular.isDefined(startLength) &&
        isFinite(startX), isFinite(startY), isFinite(startLength) && startLength > 0){

          this.x = startX;
          this.y = startY;
          this.length = startLength;

        }else{

          //position selector in the center of the parent canvas
          var minLenValue = Math.min(parentWidth, parentHeight);
          this.x = (this.maxX / 2) - (minLenValue/4);
          this.y = (minLenValue/4);
          this.length = minLenValue/2;

        }

      },
      /**
       * Calculate whether or not the point is in the center move zone to move the entire selector in any direction
       * @param pointX
       * @param pointY
       * @returns {boolean}
       */
      isInMoveZone : function(pointX, pointY){

        //find if point is in moveable territory and not in expandable/collapsable areas near corners
        var moveZoneMinBound = this.length / 5;
        var moveZoneMaxBound = this.length - moveZoneMinBound;
        if(pointX >= (this.x + moveZoneMinBound) && pointX <= (this.x + moveZoneMaxBound) &&
          pointY >= (this.y + moveZoneMinBound) && pointY <= (this.y + moveZoneMaxBound)){

          return true;
        }
        return false;
      },
      /**
       * isValidCornerMove - checks if the move is valid given an increment for x and y and length increment
       * @param increment for x and y
       * @param lenIncrement for the length
       * @returns {boolean}
       * @private
       */
      _isValidCornerMove : function( increment,lenIncrement){

        var newX = increment + this.x;
        var newY = increment + this.y;
        var newLen = this.length + lenIncrement;
        return (newX >= this.outerCushion && (newX + newLen) < this.maxX &&
                newY >= this.outerCushion && (newY + newLen) < this.maxY &&
                newLen > 10);

      },
      /**
       * Determines whether a given potential increment is allowed for length
       * @param acc
       * @returns {boolean}
       * @private
       */
      _isValidLengthMove: function(acc){

        var tempLength = (this.length + acc);
        if(this.x + tempLength > this.maxX || this.y + tempLength > this.maxY
            || tempLength < 10){
          return false;

        }
        return true;

      },
      /**
       * Determine whether a given potential increment can be applied to X
       * @param acc
       * @returns {boolean}
       * @private
       */
      _isValidXMove : function(acc){

        var tempX = acc + this.x;
        if(tempX < this.outerCushion || tempX + this.length > this.maxX){
          return false;
        }
        return true;

      },
      /**
       * Determine whether a given potential increment can be applied to Y
       * @param acc
       * @returns {boolean}
       * @private
       */
      _isValidYMove : function(acc){

        var tempY = acc + this.y;
        if(tempY < this.outerCushion || tempY + this.length > this.maxY){
          return false;
        }
        return true;
      },
      /**
       * Move the selector x, y coordinates given a move increment and compute new length if necessary
       * @param xMove
       * @param yMove
       * @param isCorner
       * @param cornerPosition
       */
      move : function(xMove,yMove, isCorner, cornerPosition){

        if(isCorner){

          // assess the direction of the current move, then normalize the adjustments so we maintain
          // smoothness in movement
          var movingUp = yMove < 0 ? true: false;
          var movingLeft = xMove < 0 ? true : false;
          var movingDown = yMove > 0 ? true : false;
          var moveAdj = Math.max(Math.abs(xMove),Math.abs(yMove));
          var lenAdj = moveAdj * 2;

          //if the corner passed in is the same as the currentCorner from the mousedown event,
          // calculate the move and length adjustment to expand and/or collapse square
          if(this.currentCorner == cornerPosition){

            switch(cornerPosition) {

              case ngCropConstants.POSITIONS.TOP_LEFT:
              {

                lenAdj *= movingLeft || movingUp ? 1 : -1;
                moveAdj *= movingLeft || movingUp ? -1 : 1;
                break;

              }
              case ngCropConstants.POSITIONS.TOP_RIGHT:
              {

                lenAdj *=  movingDown || movingLeft ? -1 : 1;
                moveAdj *=  movingDown || movingLeft ? 1 : -1;
                break;

              }
              case ngCropConstants.POSITIONS.BOTTOM_LEFT:
              {

                lenAdj *=  movingDown || movingLeft ? 1 : -1;
                moveAdj *=  movingDown || movingLeft ? -1 : 1;
                break;
              }
              default:
              {

                lenAdj *= movingLeft || movingUp ? -1 : 1;
                moveAdj *= movingLeft || movingUp ? 1 : -1;
                break;

              }
            }

            //if its a valid move, then adjust x,y and length
            if(this._isValidCornerMove(moveAdj,lenAdj)){
              this.x += moveAdj;
              this.y += moveAdj;
              this.length += lenAdj;
            }
          }

        }else{
          //otherwise move entire selector square as it is not a corner move
          this.x = this._isValidXMove(xMove) ? this.x + xMove : this.x;
          this.y = this._isValidYMove(yMove) ? this.y + yMove : this.y;
        }

      },
      /**
       * Find nearest corner given a point on the canvas
       * @param pointX
       * @param pointY
       * @private
       * @returns {number}
       */
      nearestCorner: function(pointX, pointY){

        //assess the number of pixels from the given points
        var pxFromXLeft = Math.abs(pointX - this.x);
        var pxFromXRight = Math.abs(pointX - (this.x + this.length));
        var pxFromYTop = Math.abs(pointY - this.y);
        var pxFromYBottom = Math.abs(pointY - (this.y + this.length));

        //calibrate the corners given the pixels from the points
        var topLeft = pxFromXLeft + pxFromYTop;
        var topRight = pxFromXRight + pxFromYTop;
        var bottomLeft = pxFromXLeft + pxFromYBottom;
        var bottomRight = pxFromXRight + pxFromYBottom;

        //figure out the nearest corner given the smallest value from the calibrated corners
        var chosen = Math.min(topLeft, topRight, bottomLeft, bottomRight);

        var corner = 0;

        if(chosen == topLeft){

          corner = 1;

        } else if(chosen == topRight){

          corner = 2;

        }else if(chosen == bottomLeft){

          corner = 3;

        }else{

          corner = 4;

        }
        return corner;

      },
      /**
       * Lock the current corner given an X and Y point
       * @param mouseX
       * @param mouseY
       */
      setCurrentCorner: function(mouseX, mouseY){

        this.currentCorner = this.nearestCorner(mouseX, mouseY);

      }

    }

    return CropSelection;
  }
);

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

/**
 * Created by ltischuk on 2/10/15.
 */
angular.module('ngcrop')
  .factory('ResultCanvas', function ResultCanvasFactory() {

    /**
     * Class to draw the cropped result data to a private canvas on DOM and then obtain image data URL
     * @param format of the result, i.e. jpeg or png - defaults to png
     * @constructor
     */
    function ResultCanvas(format){

      this.resultCanvas = document.createElement('canvas');
      this.context = this.resultCanvas.getContext('2d');
      this.outputImageFormat = format;

    }

      /**
       * Result Canvas prototype functions
       * @type {{getDataUrl: Function, destroy: Function}}
       */
      ResultCanvas.prototype = {

        /**
         * Given an image and clipped points, draw image to private canvas and get data URL
         * @param img
         * @param x
         * @param y
         * @param len
         * @returns {*}
         */
        getDataUrl: function (img, x, y, len) {

          //draw the image to the canvas and pull display info
          this.resultCanvas.height = len;
          this.resultCanvas.width = len;
          this.context.drawImage(img, x, y, len, len, 0, 0,len,len);
          return this.resultCanvas.toDataURL(this.outputImageFormat);
        }

    }

    return ResultCanvas;

  }
);
