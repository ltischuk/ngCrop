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

      getDataUrl: function (img, x, y, sLength,drawWidth, drawHeight) {

        //draw the image to the canvas and pull display info
        this.resultCanvas.height = drawHeight;
        this.resultCanvas.width = drawWidth;
        this.context.drawImage(img, x, y, sLength, sLength, 0, 0, drawWidth, drawHeight);
        return this.resultCanvas.toDataURL(this.outputImageFormat);
      },
      destroy: function(){

        this.resultCanvas.remove();

      }

    }

    return ResultCanvas;

  }
);
