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
        get currentImg(){

          return this._currentImg;

        },
        set currentImg(img){

          this._currentImg = img;

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

          //on touchleave event
          this.canvas.on('touchleave', function(e) {

            that._handleUp(e);

          });

          ////touchcancel event
          //this.canvas.on('touchcancel', function(e){
          //
          //  that._handleUp(e);
          //
          //});

      },
        /**
         * Method to encapsulate functionality for when mousedown or touchstart event is fired
         * @param e
         * @private
         */
        _handleDown: function(e){

          e.preventDefault();
          var isMobile = (angular.isDefined(e.touches));
          this.currentX = ((isMobile ? (e.touches[0].pageX ? e.touches[0].pageX : e.clientX + window.scrollX)  : e.clientX + window.scrollX) - this.canvasLeftPos);
          this.currentY = ((isMobile ? (e.touches[0].pageY ? e.touches[0].pageY : e.clientY + window.scrollY)  : e.clientY + window.scrollY) - this.canvasTopPos);
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
          this.currentX = ((isMobile ? (e.touches[0].pageX ? e.touches[0].clientX : e.clientX)  : e.clientX) - this.canvasLeftPos);
          this.currentY = ((isMobile ? (e.touches[0].pageY ? e.touches[0].clientY : e.clientY)  : e.clientY) - this.canvasTopPos);

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
          this.cropSelector.resetCorner();
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
          this.context.stroke();

          this.context.beginPath();
          this.context.moveTo(selectorMiddleX, selectorMiddleY-4);
          this.context.lineTo(selectorMiddleX, selectorMiddleY+4);
          this.context.stroke();

          this.context.beginPath();
          this.context.lineWidth = 2;
          this.context.moveTo(this.cropSelector.x + (arrowLength/4), this.cropSelector.y + (arrowLength/4));
          this.context.lineTo(this.cropSelector.x + (arrowLength/2), this.cropSelector.y + (arrowLength/4));
          this.context.lineTo(this.cropSelector.x + (arrowLength/4), this.cropSelector.y + (arrowLength/2));
          this.context.lineTo(this.cropSelector.x + (arrowLength/4), this.cropSelector.y + (arrowLength/4));
          this.context.closePath();
          this.context.fillStyle = this.selectorColor;
          this.context.fill();


        },
        /**
         * Draw the cropped image portion to the result canvas and
         * get resulting image data URL and call callback function
         */
        getCroppedImageData: function(){

          var x = this.cropSelector.x/this.imgScale;
          var y = this.cropSelector.y/this.imgScale;
          var len = this.cropSelector.length/this.imgScale;
          var data = this.resultCanvas.getDataUrl(this.currentImg, x, y,len, this.currentImgOrientation);

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

          this.canvas[0].height = (img.height * this.imgScale);
          this.canvas[0].width = (img.width * this.imgScale);

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
          this.canvas.off('touchcancel',this._handleUp);
          this.canvas.remove();

        }

      }

      return CropCanvas;

    }
);