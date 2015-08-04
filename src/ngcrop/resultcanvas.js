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
              //x = -(x/2);
              //y = -(y/2);

              break;

            }

          }

          this.context.drawImage(img, y, x, len, len, -len/2, -len/2,len,len);
          this.context.restore();
          return this.resultCanvas.toDataURL(this.outputImageFormat);
        }

    }

    return ResultCanvas;

  }
);
