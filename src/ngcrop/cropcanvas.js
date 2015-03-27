/**
 * Created by ltischuk on 2/10/15.
 */
angular.module('ngcrop')
    .factory('CropCanvas',
    function CropCanvasFactory
        (CropSelection,
         ResultCanvas)
    {

      var isSelecting = false;
      var moveCorner = false;
      var lastMouseX = 0;
      var lastMouseY = 0;
      var mouseX = 0;
      var mouseY = 0;
      var corner = 0;

      function CropCanvas(canvasElement, maxLength, selectorWidth, selectorColor){

        this._canvas = canvasElement;
        this._context = this._canvas[0].getContext('2d');
        this._resultCanvas = undefined;
        this._maxLength = maxLength;
        this._cropSelector = new CropSelection(maxLength);
        this._selectorLineWidth = selectorWidth;
        this._selectorColor = selectorColor;
        this._imgScale = 1;
        this.currentImg = undefined;
        this.onDrawResult = undefined;
        this.addEventHandlers();

      }

      CropCanvas.prototype.setResultCanvasDataFormat = function(format){
        this._resultCanvas = new ResultCanvas(format);
      }

      /**
       * Handles the event for mouse down on the main canvas
       * @param e
       */
      CropCanvas.prototype.handleMouseDown = function(e){

        mouseX = e.offsetX;
        mouseY = e.offsetY;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        isSelecting = true;
        this._cropSelector.setCurrentCorner(mouseX, mouseY);
        if(this._cropSelector.isInMoveZone(mouseX, mouseY)){

          this._canvas[0].style.cursor = 'move';
          moveCorner = false;

        }
        else{
          this._canvas[0].style.cursor = 'crosshair';
          corner = this._cropSelector.nearestCorner(mouseX, mouseY);
          moveCorner = true;

        }

      }

      /**
       * Handles the even for mouse move on the main canvas
       * @param e
       */
      CropCanvas.prototype.handleMouseMove = function(e){

        mouseX = e.offsetX;
        mouseY = e.offsetY;

        if(!isSelecting){

          if(this._cropSelector.isInMoveZone(mouseX, mouseY)){
            this._canvas[0].style.cursor = 'move';
          }
          else{

            this._canvas[0].style.cursor = 'crosshair';
            moveCorner = true;

          }

        }else{
          this.drawImageOnCanvas();

          var xdiff = mouseX - lastMouseX;
          var ydiff = mouseY - lastMouseY;

          this._cropSelector.move(xdiff, ydiff, moveCorner, corner);
          lastMouseX = mouseX;
          lastMouseY = mouseY;
          this.drawImageOnCanvas();
        }

      }

      /**
       * Handles mouseUp (or mouseOut) event on the main canvas
       * @param e
       */
      CropCanvas.prototype.handleMouseUp = function(e){
        isSelecting = false;
        moveCorner = false;
        this.drawImageOnCanvas();
        this._canvas[0].style.cursor = 'default';
        this.getCroppedImageData();
      }

      CropCanvas.prototype.addEventHandlers = function(){

        var self = this;

        this._canvas.on('mousedown', function(e) {

          self.handleMouseDown(e);

        });

        this._canvas.on('mouseup', function(e) {

          self.handleMouseUp(e);

        });

        this._canvas.on('mousemove', function(e) {

          self.handleMouseMove(e);

        });

        this._canvas.on('mouseout', function(e){

          self.handleMouseUp(e);

        });

      }

      CropCanvas.prototype.processNewImage = function(img, onDrawResult){

        this._imgScale = Math.min ((this._maxLength / img.width),(this._maxLength/ img.height));
        this._canvas[0].width = img.width * this._imgScale;
        this._canvas[0].height = img.width * this._imgScale;
        this._cropSelector.initSelectorDimensions(this._canvas[0].width, this._canvas[0].height);
        this.currentImg = img;
        this.onDrawResult = onDrawResult;
        this.drawImageOnCanvas();
        this.getCroppedImageData();

      }

      /**
       * Method: drawImageOnCanvas
       * draws the image and the selector square on top of the image dynamically
       */
      CropCanvas.prototype.drawImageOnCanvas = function(){

        this._context.clearRect(0, 0, this._canvas[0].width, this._canvas[0].height);

        var sX =  0;
        var sY =  0;
        var sWidth =  this.currentImg.width;
        var sHeight =  this.currentImg.height;
        var drawWidth = this._canvas[0].width;
        var drawHeight = this._canvas[0].height;

        //draw the image to the canvas
        this._context.drawImage(this.currentImg,sX,sY,sWidth,sHeight,0,0,drawWidth,drawHeight);
        this._context.lineWidth = this._selectorLineWidth;
        this._context.strokeStyle = this._selectorColor;
        this._context.strokeRect(this._cropSelector.x,this._cropSelector.y,this._cropSelector.length,this._cropSelector.length);

      }

      /**
       * Obtains the cropped image data URL by drawing the cropped image on
       * a private resultCanvas instance and calling toDataURL
       */
      CropCanvas.prototype.getCroppedImageData = function(){

        var x = this._cropSelector.x/this._imgScale;
        var y = this._cropSelector.y/this._imgScale;
        var len = this._cropSelector.length/this._imgScale;

        var data = this._resultCanvas.getDataUrl(this.currentImg, x, y,len, this._canvas[0].width, this._canvas[0].height);

        //callback draw data
        this.onDrawResult(data);

      }


      /**
       * Remove from DOM
       */
      CropCanvas.prototype.destroy = function(){

        this._canvas.off('mousedown',this.handleMouseDown);
        this._canvas.off('mouseup',this.handleMouseUp);
        this._canvas.off('mouseout',this.handleMouseUp);
        this._canvas.off('mousemove',this.handleMouseMove);
        this._canvas.remove();
        this._resultCanvas.destroy();

      }

      return CropCanvas;

    }
);