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

          //on touchleave event
          this.canvas.on('touchleave', function(e) {

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
            this._orientation = 6;

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