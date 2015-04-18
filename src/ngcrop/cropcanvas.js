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