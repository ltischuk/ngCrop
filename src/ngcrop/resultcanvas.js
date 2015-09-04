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
          this.context.clearRect(0, 0,  this.resultCanvas.width, this.resultCanvas.height);
          this.resultCanvas.height = len;
          this.resultCanvas.width = len;
          var sX = x;
          var sY = y;
          var drawStartingPoint = 0;
          this.context.drawImage(img, sX, sY, len, len, drawStartingPoint, drawStartingPoint,len,len);
          return this.resultCanvas.toDataURL(this.outputImageFormat);
        }

    }

    return ResultCanvas;

  }
);
