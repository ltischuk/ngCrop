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
