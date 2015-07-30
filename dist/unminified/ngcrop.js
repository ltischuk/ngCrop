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
        this._orientation = 1;
        this._addEventHandlers();

      }


      /**
       * Prototype methods getters/setters for public accessors
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
          var x = 0;
          var y = 0;
          var drawWidth = this.canvas[0].width;
          var drawHeight = this.canvas[0].height;

          switch(this._orientation){

            //for iphones
            case 6: {

              this.context.save();

              // 90° rotate right
              this.context.translate(this.canvas[0].width/2,this.canvas[0].height/2);
              this.context.rotate(0.5 * Math.PI);
              //draw the image to the canvas
              x = -(this.canvas[0].height/2);
              y = -(this.canvas[0].width/2);
              drawWidth = this.canvas[0].height;
              drawHeight = this.canvas[0].width;
              break;

            }

          }

          this.context.drawImage(this.currentImg,x,y,drawWidth,drawHeight);
          this.context.restore();

          //draw the image to the canvas
        //  this.context.drawImage(this.currentImg,0,0,this.currentImg.width,this.currentImg.height,0,0,this.canvas[0].width,this.canvas[0].height);

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
          var data = this.resultCanvas.getDataUrl(this.currentImg, x, y,len, this._orientation);

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
        processNewImage: function(img,selectorStartX, selectorStartY, selectorStartLength, finalCallback){

          this.imgScale = Math.min ((this.maxLength / img.width),(this.maxLength/ img.height), 1);
          EXIF.getData(img, function(){

            var orientation = EXIF.getTag(img, 'Orientation');
            this._orientation = (angular.isDefined(orientation) && orientation > 1) ? orientation : this._orientation;

            this.canvas[0].height = this._orientation == 6 ? (img.width * this.imgScale) : (img.height * this.imgScale);
            this.canvas[0].width = this._orientation == 6 ? (img.height * this.imgScale) : (img.width * this.imgScale);
           // alert('orientation: ' + orientation + 'height: ' + this.canvas[0].height + 'width: ' + this.canvas[0].width);

            //initialize cropSelector dimensions
            this.cropSelector.initSelectorDimensions(this.canvas[0].width, this.canvas[0].height,
                selectorStartX, selectorStartY, selectorStartLength);

            //obtain bounds for the rectangle to assess mouse/touch event points
            var rect = this.canvas[0].getBoundingClientRect();
            this.canvasLeftPos = rect.left;
            this.canvasTopPos = rect.top;

            //set currently image variable, draw the canvas
            // then get the cropped image data from current cropSelector position
            this.currentImg = img;
            this._drawCanvas();
            this.getCroppedImageData();
            finalCallback({canvasInfo: this.getCropCanvasInfo()})

          }.bind(this));

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

                  cropCanvas.processNewImage(newImage, scope.selectorStartX,scope.selectorStartY,scope.selectorStartLength, scope.postCanvasImgProcessCallback);
                  //if(angular.isFunction(scope.postCanvasImgProcessCallback)){
                  //
                  //  scope.postCanvasImgProcessCallback({canvasInfo: cropCanvas.getCropCanvasInfo()});
                  //
                  //}

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
        getDataUrl: function (img, x, y, len, orientation) {

          //draw the image to the canvas and pull display info
          this.resultCanvas.height = len;
          this.resultCanvas.width = len;

          switch(orientation){

            //for iphones
            case 6: {

              this.context.save();

              // 90° rotate right
              this.context.translate(len/2,len/2);
              this.context.rotate(0.5 * Math.PI);
              //draw the image to the canvas
              x = -(len/2);
              y = -(len/2);

              break;

            }

          }

          this.context.drawImage(img, x, y, len, len, 0, 0,len,len);
          this.context.restore();
          return this.resultCanvas.toDataURL(this.outputImageFormat);
        }

    }

    return ResultCanvas;

  }
);

/**
 * Using Library Copyright (c) 2008 Jacob Seidelin
 * https://github.com/exif-js/exif-js/blob/master/exif.js
 */
(function() {

    var debug = false;

    var root = this;

    var EXIF = function(obj) {
        if (obj instanceof EXIF) return obj;
        if (!(this instanceof EXIF)) return new EXIF(obj);
        this.EXIFwrapped = obj;
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = EXIF;
        }
        exports.EXIF = EXIF;
    } else {
        root.EXIF = EXIF;
    }

    var ExifTags = EXIF.Tags = {

        // version tags
        0x9000 : "ExifVersion",             // EXIF version
        0xA000 : "FlashpixVersion",         // Flashpix format version

        // colorspace tags
        0xA001 : "ColorSpace",              // Color space information tag

        // image configuration
        0xA002 : "PixelXDimension",         // Valid width of meaningful image
        0xA003 : "PixelYDimension",         // Valid height of meaningful image
        0x9101 : "ComponentsConfiguration", // Information about channels
        0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

        // user information
        0x927C : "MakerNote",               // Any desired information written by the manufacturer
        0x9286 : "UserComment",             // Comments by user

        // related file
        0xA004 : "RelatedSoundFile",        // Name of related sound file

        // date and time
        0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
        0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
        0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
        0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
        0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

        // picture-taking conditions
        0x829A : "ExposureTime",            // Exposure time (in seconds)
        0x829D : "FNumber",                 // F number
        0x8822 : "ExposureProgram",         // Exposure program
        0x8824 : "SpectralSensitivity",     // Spectral sensitivity
        0x8827 : "ISOSpeedRatings",         // ISO speed rating
        0x8828 : "OECF",                    // Optoelectric conversion factor
        0x9201 : "ShutterSpeedValue",       // Shutter speed
        0x9202 : "ApertureValue",           // Lens aperture
        0x9203 : "BrightnessValue",         // Value of brightness
        0x9204 : "ExposureBias",            // Exposure bias
        0x9205 : "MaxApertureValue",        // Smallest F number of lens
        0x9206 : "SubjectDistance",         // Distance to subject in meters
        0x9207 : "MeteringMode",            // Metering mode
        0x9208 : "LightSource",             // Kind of light source
        0x9209 : "Flash",                   // Flash status
        0x9214 : "SubjectArea",             // Location and area of main subject
        0x920A : "FocalLength",             // Focal length of the lens in mm
        0xA20B : "FlashEnergy",             // Strobe energy in BCPS
        0xA20C : "SpatialFrequencyResponse",    //
        0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
        0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
        0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
        0xA214 : "SubjectLocation",         // Location of subject in image
        0xA215 : "ExposureIndex",           // Exposure index selected on camera
        0xA217 : "SensingMethod",           // Image sensor type
        0xA300 : "FileSource",              // Image source (3 == DSC)
        0xA301 : "SceneType",               // Scene type (1 == directly photographed)
        0xA302 : "CFAPattern",              // Color filter array geometric pattern
        0xA401 : "CustomRendered",          // Special processing
        0xA402 : "ExposureMode",            // Exposure mode
        0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
        0xA404 : "DigitalZoomRation",       // Digital zoom ratio
        0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
        0xA406 : "SceneCaptureType",        // Type of scene
        0xA407 : "GainControl",             // Degree of overall image gain adjustment
        0xA408 : "Contrast",                // Direction of contrast processing applied by camera
        0xA409 : "Saturation",              // Direction of saturation processing applied by camera
        0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
        0xA40B : "DeviceSettingDescription",    //
        0xA40C : "SubjectDistanceRange",    // Distance to subject

        // other tags
        0xA005 : "InteroperabilityIFDPointer",
        0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
    };

    var TiffTags = EXIF.TiffTags = {
        0x0100 : "ImageWidth",
        0x0101 : "ImageHeight",
        0x8769 : "ExifIFDPointer",
        0x8825 : "GPSInfoIFDPointer",
        0xA005 : "InteroperabilityIFDPointer",
        0x0102 : "BitsPerSample",
        0x0103 : "Compression",
        0x0106 : "PhotometricInterpretation",
        0x0112 : "Orientation",
        0x0115 : "SamplesPerPixel",
        0x011C : "PlanarConfiguration",
        0x0212 : "YCbCrSubSampling",
        0x0213 : "YCbCrPositioning",
        0x011A : "XResolution",
        0x011B : "YResolution",
        0x0128 : "ResolutionUnit",
        0x0111 : "StripOffsets",
        0x0116 : "RowsPerStrip",
        0x0117 : "StripByteCounts",
        0x0201 : "JPEGInterchangeFormat",
        0x0202 : "JPEGInterchangeFormatLength",
        0x012D : "TransferFunction",
        0x013E : "WhitePoint",
        0x013F : "PrimaryChromaticities",
        0x0211 : "YCbCrCoefficients",
        0x0214 : "ReferenceBlackWhite",
        0x0132 : "DateTime",
        0x010E : "ImageDescription",
        0x010F : "Make",
        0x0110 : "Model",
        0x0131 : "Software",
        0x013B : "Artist",
        0x8298 : "Copyright"
    };

    var GPSTags = EXIF.GPSTags = {
        0x0000 : "GPSVersionID",
        0x0001 : "GPSLatitudeRef",
        0x0002 : "GPSLatitude",
        0x0003 : "GPSLongitudeRef",
        0x0004 : "GPSLongitude",
        0x0005 : "GPSAltitudeRef",
        0x0006 : "GPSAltitude",
        0x0007 : "GPSTimeStamp",
        0x0008 : "GPSSatellites",
        0x0009 : "GPSStatus",
        0x000A : "GPSMeasureMode",
        0x000B : "GPSDOP",
        0x000C : "GPSSpeedRef",
        0x000D : "GPSSpeed",
        0x000E : "GPSTrackRef",
        0x000F : "GPSTrack",
        0x0010 : "GPSImgDirectionRef",
        0x0011 : "GPSImgDirection",
        0x0012 : "GPSMapDatum",
        0x0013 : "GPSDestLatitudeRef",
        0x0014 : "GPSDestLatitude",
        0x0015 : "GPSDestLongitudeRef",
        0x0016 : "GPSDestLongitude",
        0x0017 : "GPSDestBearingRef",
        0x0018 : "GPSDestBearing",
        0x0019 : "GPSDestDistanceRef",
        0x001A : "GPSDestDistance",
        0x001B : "GPSProcessingMethod",
        0x001C : "GPSAreaInformation",
        0x001D : "GPSDateStamp",
        0x001E : "GPSDifferential"
    };

    var StringValues = EXIF.StringValues = {
        ExposureProgram : {
            0 : "Not defined",
            1 : "Manual",
            2 : "Normal program",
            3 : "Aperture priority",
            4 : "Shutter priority",
            5 : "Creative program",
            6 : "Action program",
            7 : "Portrait mode",
            8 : "Landscape mode"
        },
        MeteringMode : {
            0 : "Unknown",
            1 : "Average",
            2 : "CenterWeightedAverage",
            3 : "Spot",
            4 : "MultiSpot",
            5 : "Pattern",
            6 : "Partial",
            255 : "Other"
        },
        LightSource : {
            0 : "Unknown",
            1 : "Daylight",
            2 : "Fluorescent",
            3 : "Tungsten (incandescent light)",
            4 : "Flash",
            9 : "Fine weather",
            10 : "Cloudy weather",
            11 : "Shade",
            12 : "Daylight fluorescent (D 5700 - 7100K)",
            13 : "Day white fluorescent (N 4600 - 5400K)",
            14 : "Cool white fluorescent (W 3900 - 4500K)",
            15 : "White fluorescent (WW 3200 - 3700K)",
            17 : "Standard light A",
            18 : "Standard light B",
            19 : "Standard light C",
            20 : "D55",
            21 : "D65",
            22 : "D75",
            23 : "D50",
            24 : "ISO studio tungsten",
            255 : "Other"
        },
        Flash : {
            0x0000 : "Flash did not fire",
            0x0001 : "Flash fired",
            0x0005 : "Strobe return light not detected",
            0x0007 : "Strobe return light detected",
            0x0009 : "Flash fired, compulsory flash mode",
            0x000D : "Flash fired, compulsory flash mode, return light not detected",
            0x000F : "Flash fired, compulsory flash mode, return light detected",
            0x0010 : "Flash did not fire, compulsory flash mode",
            0x0018 : "Flash did not fire, auto mode",
            0x0019 : "Flash fired, auto mode",
            0x001D : "Flash fired, auto mode, return light not detected",
            0x001F : "Flash fired, auto mode, return light detected",
            0x0020 : "No flash function",
            0x0041 : "Flash fired, red-eye reduction mode",
            0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
            0x0047 : "Flash fired, red-eye reduction mode, return light detected",
            0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059 : "Flash fired, auto mode, red-eye reduction mode",
            0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod : {
            1 : "Not defined",
            2 : "One-chip color area sensor",
            3 : "Two-chip color area sensor",
            4 : "Three-chip color area sensor",
            5 : "Color sequential area sensor",
            7 : "Trilinear sensor",
            8 : "Color sequential linear sensor"
        },
        SceneCaptureType : {
            0 : "Standard",
            1 : "Landscape",
            2 : "Portrait",
            3 : "Night scene"
        },
        SceneType : {
            1 : "Directly photographed"
        },
        CustomRendered : {
            0 : "Normal process",
            1 : "Custom process"
        },
        WhiteBalance : {
            0 : "Auto white balance",
            1 : "Manual white balance"
        },
        GainControl : {
            0 : "None",
            1 : "Low gain up",
            2 : "High gain up",
            3 : "Low gain down",
            4 : "High gain down"
        },
        Contrast : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        Saturation : {
            0 : "Normal",
            1 : "Low saturation",
            2 : "High saturation"
        },
        Sharpness : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        SubjectDistanceRange : {
            0 : "Unknown",
            1 : "Macro",
            2 : "Close view",
            3 : "Distant view"
        },
        FileSource : {
            3 : "DSC"
        },

        Components : {
            0 : "",
            1 : "Y",
            2 : "Cb",
            3 : "Cr",
            4 : "R",
            5 : "G",
            6 : "B"
        }
    };

    function addEvent(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    }

    function imageHasData(img) {
        return !!(img.exifdata);
    }


    function base64ToArrayBuffer(base64, contentType) {
        contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        var binary = atob(base64);
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

    function objectURLToBlob(url, callback) {
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.responseType = "blob";
        http.onload = function(e) {
            if (this.status == 200 || this.status === 0) {
                callback(this.response);
            }
        };
        http.send();
    }

    function getImageData(img, callback) {
        function handleBinaryFile(binFile) {
            var data = findEXIFinJPEG(binFile);
            var iptcdata = findIPTCinJPEG(binFile);
            img.exifdata = data || {};
            img.iptcdata = iptcdata || {};
            if (callback) {
                callback.call(img);
            }
        }

        if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
                var arrayBuffer = base64ToArrayBuffer(img.src);
                handleBinaryFile(arrayBuffer);

            } else if (/^blob\:/i.test(img.src)) { // Object URL
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    handleBinaryFile(e.target.result);
                };
                objectURLToBlob(img.src, function (blob) {
                    fileReader.readAsArrayBuffer(blob);
                });
            } else {
                var http = new XMLHttpRequest();
                http.onload = function() {
                    if (this.status == 200 || this.status === 0) {
                        handleBinaryFile(http.response);
                    } else {
                        throw "Could not load image";
                    }
                    http = null;
                };
                http.open("GET", img.src, true);
                http.responseType = "arraybuffer";
                http.send(null);
            }
        } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                if (debug) console.log("Got file of length " + e.target.result.byteLength);
                handleBinaryFile(e.target.result);
            };

            fileReader.readAsArrayBuffer(img);
        }
    }

    function findEXIFinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength,
            marker;

        while (offset < length) {
            if (dataView.getUint8(offset) != 0xFF) {
                if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
                return false; // not a valid marker, something is wrong
            }

            marker = dataView.getUint8(offset + 1);
            if (debug) console.log(marker);

            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data

            if (marker == 225) {
                if (debug) console.log("Found 0xFFE1 marker");

                return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

                // offset += 2 + file.getShortAt(offset+2, true);

            } else {
                offset += 2 + dataView.getUint16(offset+2);
            }

        }

    }

    function findIPTCinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength;


        var isFieldSegmentStart = function(dataView, offset){
            return (
                dataView.getUint8(offset) === 0x38 &&
                dataView.getUint8(offset+1) === 0x42 &&
                dataView.getUint8(offset+2) === 0x49 &&
                dataView.getUint8(offset+3) === 0x4D &&
                dataView.getUint8(offset+4) === 0x04 &&
                dataView.getUint8(offset+5) === 0x04
            );
        };

        while (offset < length) {

            if ( isFieldSegmentStart(dataView, offset )){

                // Get the length of the name header (which is padded to an even number of bytes)
                var nameHeaderLength = dataView.getUint8(offset+7);
                if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
                // Check for pre photoshop 6 format
                if(nameHeaderLength === 0) {
                    // Always 4
                    nameHeaderLength = 4;
                }

                var startOffset = offset + 8 + nameHeaderLength;
                var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

                return readIPTCData(file, startOffset, sectionLength);

                break;

            }


            // Not the marker, continue searching
            offset++;

        }

    }
    var IptcFieldMap = {
        0x78 : 'caption',
        0x6E : 'credit',
        0x19 : 'keywords',
        0x37 : 'dateCreated',
        0x50 : 'byline',
        0x55 : 'bylineTitle',
        0x7A : 'captionWriter',
        0x69 : 'headline',
        0x74 : 'copyright',
        0x0F : 'category'
    };
    function readIPTCData(file, startOffset, sectionLength){
        var dataView = new DataView(file);
        var data = {};
        var fieldValue, fieldName, dataSize, segmentType, segmentSize;
        var segmentStartPos = startOffset;
        while(segmentStartPos < startOffset+sectionLength) {
            if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
                segmentType = dataView.getUint8(segmentStartPos+2);
                if(segmentType in IptcFieldMap) {
                    dataSize = dataView.getInt16(segmentStartPos+3);
                    segmentSize = dataSize + 5;
                    fieldName = IptcFieldMap[segmentType];
                    fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
                    // Check if we already stored a value with this name
                    if(data.hasOwnProperty(fieldName)) {
                        // Value already stored with this name, create multivalue field
                        if(data[fieldName] instanceof Array) {
                            data[fieldName].push(fieldValue);
                        }
                        else {
                            data[fieldName] = [data[fieldName], fieldValue];
                        }
                    }
                    else {
                        data[fieldName] = fieldValue;
                    }
                }

            }
            segmentStartPos++;
        }
        return data;
    }



    function readTags(file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getUint16(dirStart, !bigEnd),
            tags = {},
            entryOffset, tag,
            i;

        for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
            tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
        }
        return tags;
    }


    function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getUint16(entryOffset+2, !bigEnd),
            numValues = file.getUint32(entryOffset+4, !bigEnd),
            valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }

            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return getStringFromDB(file, offset, numValues-1);

            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                    }
                    return vals;
                }

            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 5:    // rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset+4, !bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                        denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                    }
                    return vals;
                }
        }
    }

    function getStringFromDB(buffer, start, length) {
        var outstr = "";
        for (n = start; n < start+length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
        }
        return outstr;
    }

    function readEXIFData(file, start) {
        if (getStringFromDB(file, start, 4) != "Exif") {
            if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
            return false;
        }

        var bigEnd,
            tags, tag,
            exifData, gpsData,
            tiffOffset = start + 6;

        // test for TIFF validity and endianness
        if (file.getUint16(tiffOffset) == 0x4949) {
            bigEnd = false;
        } else if (file.getUint16(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        } else {
            if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }

        if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
            if (debug) console.log("Not valid TIFF data! (no 0x002A)");
            return false;
        }

        var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

        if (firstIFDOffset < 0x00000008) {
            if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
            return false;
        }

        tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

        if (tags.ExifIFDPointer) {
            exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource" :
                    case "Flash" :
                    case "MeteringMode" :
                    case "ExposureProgram" :
                    case "SensingMethod" :
                    case "SceneCaptureType" :
                    case "SceneType" :
                    case "CustomRendered" :
                    case "WhiteBalance" :
                    case "GainControl" :
                    case "Contrast" :
                    case "Saturation" :
                    case "Sharpness" :
                    case "SubjectDistanceRange" :
                    case "FileSource" :
                        exifData[tag] = StringValues[tag][exifData[tag]];
                        break;

                    case "ExifVersion" :
                    case "FlashpixVersion" :
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;

                    case "ComponentsConfiguration" :
                        exifData[tag] =
                            StringValues.Components[exifData[tag][0]] +
                            StringValues.Components[exifData[tag][1]] +
                            StringValues.Components[exifData[tag][2]] +
                            StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }

        if (tags.GPSInfoIFDPointer) {
            gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID" :
                        gpsData[tag] = gpsData[tag][0] +
                            "." + gpsData[tag][1] +
                            "." + gpsData[tag][2] +
                            "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }

        return tags;
    }

    EXIF.getData = function(img, callback) {
        if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;

        if (!imageHasData(img)) {
            getImageData(img, callback);
        } else {
            if (callback) {
                callback.call(img);
            }
        }
        return true;
    }

    EXIF.getTag = function(img, tag) {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }

    EXIF.getAllTags = function(img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.exifdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    EXIF.pretty = function(img) {
        if (!imageHasData(img)) return "";
        var a,
            data = img.exifdata,
            strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    } else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                } else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    }

    EXIF.readFromBinaryFile = function(file) {
        return findEXIFinJPEG(file);
    }

    if (typeof define === 'function' && define.amd) {
        define('exif-js', [], function() {
            return EXIF;
        });
    }
}.call(this));

