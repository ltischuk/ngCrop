/**
 * Created by ltischuk on 10/19/14.
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
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
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
        get lastMouseX() {

          return this._lastMouseX;

        },
        set lastMouseX(lastMouseX){

          this._lastMouseX = lastMouseX;

        },
        get lastMouseY() {

          return this._lastMouseY;

        },
        set lastMouseY(lastMouseY){

          this._lastMouseY = lastMouseY;

        },
        get mouseX() {

          return this._mouseX;

        },
        set mouseX(mouseX){

          this._mouseX = mouseX;

        },
        get mouseY() {

          return this._mouseY;

        },
        set mouseY(mouseY){

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

          this.canvas.on('mousedown', function(e) {

            that._handleMouseDown(e);

          });

          this.canvas.on('mouseup', function(e) {

            that._handleMouseUp(e);

          });

          this.canvas.on('mousemove', function(e) {

            that._handleMouseMove(e);

          });

          this.canvas.on('mouseout', function(e){

            that._handleMouseUp(e);

          });

      },
        /**
         * Method to encapsulate functionality for when mousedown event is fired
         * @param e
         * @private
         */
        _handleMouseDown: function(e){

          this.mouseX = e.clientX - this.canvasLeftPos;
          this.mouseY = e.clientY - this.canvasTopPos;
          this.lastMouseX = this.mouseX;
          this.lastMouseY = this.mouseY;
          this.isSelecting = true;
          this.cropSelector.setCurrentCorner(this.mouseX, this.mouseY);
          if(this.cropSelector.isInMoveZone(this.mouseX, this.mouseY)){

            this.canvas[0].style.cursor = 'move';
            this.moveCorner = false;

          }
          else{
            this.canvas[0].style.cursor = 'crosshair';
            this.corner = this.cropSelector.nearestCorner(this.mouseX, this.mouseY);
            this.moveCorner = true;

          }

        },
        /**
         * Method to encapsulate functionality for when mousemove event is fired
         * @param e
         * @private
         */
        _handleMouseMove: function(e){

          this.mouseX = e.clientX - this.canvasLeftPos;
          this.mouseY = e.clientY - this.canvasTopPos;

          if(!this.isSelecting){

            if(this.cropSelector.isInMoveZone(this.mouseX, this.mouseY)){
              this.canvas[0].style.cursor = 'move';
            }
            else{

              this.canvas[0].style.cursor = 'crosshair';
              this.moveCorner = true;

            }

          }else{
            this._drawCanvas();

            var xdiff = this.mouseX - this.lastMouseX;
            var ydiff = this.mouseY - this.lastMouseY;

            this.cropSelector.move(xdiff, ydiff, this.moveCorner, this.corner);
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
            this._drawCanvas();
          }

        },
        /**
         * Method to encapsulate functionality for when mouseup event is fired
         * @private
         */
        _handleMouseUp: function(){

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

          this.context.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);

          //draw the image to the canvas
          this.context.drawImage(this.currentImg,0,0,this.currentImg.width,this.currentImg.height,0,0,this.canvas[0].width,this.canvas[0].height);
          this.context.lineWidth = this.selectorLineWidth;
          this.context.strokeStyle = this.selectorColor;
          this.context.strokeRect(this.cropSelector.x,this.cropSelector.y,this.cropSelector.length,this.cropSelector.length);


        },
        getCroppedImageData: function(){

          var x = this.cropSelector.x/this.imgScale;
          var y = this.cropSelector.y/this.imgScale;
          var len = this.cropSelector.length/this.imgScale;
          var data = this.resultCanvas.getDataUrl(this.currentImg, x, y,len);

          //callback draw data
          this.onCropResult(data);

        },
        processNewImage: function(img){

          this.imgScale = Math.min ((this.maxLength / img.width),(this.maxLength/ img.height), 1);
          this.canvas[0].width = img.width * this.imgScale;
          this.canvas[0].height = img.height * this.imgScale;
          this.cropSelector.initSelectorDimensions(this.canvas[0].width, this.canvas[0].height);
          var rect = this.canvas[0].getBoundingClientRect();
          this.canvasLeftPos = rect.left;
          this.canvasTopPos = rect.top;
          this.currentImg = img;
          this._drawCanvas();
          this.getCroppedImageData();

        },
        destroy: function(){

          this.canvas.off('mousedown',this._handleMouseDown);
          this.canvas.off('mouseup',this._handleMouseUp);
          this.canvas.off('mouseout',this._handleMouseUp);
          this.canvas.off('mousemove',this._handleMouseMove);
          this.canvas.remove();
          this.resultCanvas.destroy();

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
       * @param img
       */
      initSelectorDimensions : function(parentWidth, parentHeight){

        this.maxX = parentWidth - this.outerCushion;
        this.maxY = parentHeight - this.outerCushion;

        //position selector in the center of the parent canvas
        var minLenValue = Math.min(parentWidth, parentHeight);
        this.x = (this.maxX / 2) - (minLenValue/4);
        this.y = (minLenValue/4);
        this.length = minLenValue/2;

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

          //expand or collapse selector square depending on movement and corner
          var movingUp = yMove < 0 ? true: false;
          var movingLeft = xMove < 0 ? true : false;
          var movingDown = yMove > 0 ? true : false;
          var moveAdj = Math.max(Math.abs(xMove),Math.abs(yMove));
          var lenAdj = moveAdj * 2;

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

            if(this._isValidCornerMove(moveAdj,lenAdj)){
              this.x += moveAdj;
              this.y += moveAdj;
              this.length += lenAdj;
            }
          }

        }else{
          //move entire selector square
          this.x = this._isValidXMove(xMove) ? this.x + xMove : this.x;
          this.y = this._isValidYMove(yMove) ? this.y + yMove : this.y;
        }

      },
      /**
       * Find nearest corner given a point on the canvas
       * @param pointX
       * @param pointY
       * @returns {number}
       */
      nearestCorner: function(pointX, pointY){

        var pxFromXLeft = Math.abs(pointX - this.x);
        var pxFromXRight = Math.abs(pointX - (this.x + this.length));
        var pxFromYTop = Math.abs(pointY - this.y);
        var pxFromYBottom = Math.abs(pointY - (this.y + this.length));

        var topLeft = pxFromXLeft + pxFromYTop;
        var topRight = pxFromXRight + pxFromYTop;
        var bottomLeft = pxFromXLeft + pxFromYBottom;
        var bottomRight = pxFromXRight + pxFromYBottom;
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
      setCurrentCorner: function(mouseX, mouseY){

        this.currentCorner = this.nearestCorner(mouseX, mouseY);

      }



    }

    return CropSelection;
  }
);

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
            addCanvasBorder: '@',
            selectorColor: '@',
            selectorLineWidth: '@'

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

                  cropCanvas.processNewImage(newImage);

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

      getDataUrl: function (img, x, y, len) {

        //draw the image to the canvas and pull display info
        this.resultCanvas.height = len;
        this.resultCanvas.width = len;
        this.context.drawImage(img, x, y, len, len, 0, 0,len,len);
        return this.resultCanvas.toDataURL(this.outputImageFormat);
      },
      destroy: function(){

        this.resultCanvas.remove();

      }

    }

    return ResultCanvas;

  }
);
