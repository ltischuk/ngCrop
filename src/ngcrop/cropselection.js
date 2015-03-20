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
    function CropSelection(maxLength){

      this._x = 0;
      this._y = 0;
      this._length = 0;
      this._outerCushion = 2;
      this._ratio = 1;
      this._parentWidth = 1;
      this._parentHeight = 1;
      this._maxAllowedLength = maxLength;
      this._maxX = 0;
      this._maxY = 0;
      this._currentCorner = 0;

    }

      /**
       * Prototype functions
       **/
    CropSelection.prototype = {

      get x(){

        return this._x;

      },
      get y(){

        return this._y;

      },
      get length(){

        return this._length;

      },
      get ratio(){

        return this._ratio;

      },
      get parentWidth(){

        return this._parentWidth;

      },
      get parentHeight(){

        return this._parentHeight;
      },

      get scaledX(){

        return this._x/this._ratio;
      },
      get scaledY(){

        return this._y/this._ratio;

      },
      get scaledLength(){

        return this._length/this._ratio;

      },
      /**
       * Set the selector
       * @param img
       */
      setSelectorDimensions : function(img){

        //compute the ratio of the image to scale down to maxAllowedLength and set variables accordingly
        var imgRatio = Math.min ((this._maxAllowedLength / img.width),(this._maxAllowedLength/ img.height));
        this._ratio = imgRatio > 1 ? 1 : imgRatio;
        this._parentWidth = img.width * this._ratio;
        this._parentHeight = img.height * this._ratio;
        this._maxX = this._parentWidth - this._outerCushion;
        this._maxY = this._parentHeight - this._outerCushion;

        //position selector in the center of the parent canvas
        var minLenValue = Math.min(this._parentWidth,this._parentHeight);
        this._x = (this._maxX / 2) - (minLenValue/4);
        this._y = (minLenValue/4);
        this._length = minLenValue/2;

      },
      /**
       * Calculate whether or not the point is in the center move zone to move the entire selector in any direction
       * @param pointX
       * @param pointY
       * @returns {boolean}
       */
      isInMoveZone : function(pointX, pointY){

        //find if point is in moveable territory and not in expandable/collapsable areas near corners
        var moveZoneMinBound = this._length / 6;
        var moveZoneMaxBound = this._length - moveZoneMinBound;
        if(pointX >= (this._x + moveZoneMinBound) && pointX <= (this._x + moveZoneMaxBound) &&
          pointY >= (this._y + moveZoneMinBound) && pointY <= (this._y + moveZoneMaxBound)){

          return true;
        }
        return false;
      },
      /**
       * Determines whether a given potential increment is allowed for length
       * @param acc
       * @returns {boolean}
       * @private
       */
      _isValidLengthMove: function(acc){

        var tempLength = (this._length + acc);
        if(this._x + tempLength > this._maxX || this._y + tempLength > this._maxY
            || tempLength < 0){
          return false;

        }
        return true;

      },
      /**
       * Determine whether a given potential increment is allowed for X
       * @param acc
       * @returns {boolean}
       * @private
       */
      _isValidXMove : function(acc){

        var tempX = acc + this._x;
        if(tempX < this._outerCushion || tempX + this._length > this._maxX){
          return false;
        }
        return true;

      },
      _isValidYMove : function(acc){

        var tempY = acc + this._y;
        if(tempY < this._outerCushion || tempY + this._length > this._maxY ||
          (this._length - Math.abs(acc)) <= 0){
          return false;
        }
        return true;
      },
      move : function(xMove,yMove, isCorner, cornerPosition){

        if(isCorner){

          //expand or collapse selector square depending on movement and corner
          var move = 0;
          var len = 0;

          if(this._currentCorner == cornerPosition){

            switch(cornerPosition) {

              case ngCropConstants.POSITIONS.TOP_LEFT:
              {

                move = Math.max(xMove, yMove) > 0 ? Math.max(xMove, yMove) : Math.min(xMove, yMove);
                len = -(move * 2);
                this._x = this._isValidXMove(move) ? this._x + move : this._x;
                this._y = this._isValidXMove(move) ? this._y + move : this._y;
                break;

              }
              case ngCropConstants.POSITIONS.TOP_RIGHT:
              {

                var moveRight = (xMove > 0 || yMove < 0);
                move = Math.max(Math.abs(xMove),Math.abs(yMove));
                len = moveRight ? (move * 2) : -(move *2);
                this._x = moveRight && this._isValidXMove(-move) ? this._x - move : this._isValidXMove(move) ?  this._x + move : this._x ;
                this._y = moveRight && this._isValidYMove(-move) ? this._y - move : this._isValidYMove(move) ? this._y + move : this._y;
                break;
              }
              case ngCropConstants.POSITIONS.BOTTOM_LEFT:
              {

                var moveLeft = (xMove < 0 || yMove > 0);
                move = Math.max(Math.abs(xMove),Math.abs(yMove));
                len = moveLeft ? (move * 2) : -(move *2);
                this._x = (moveLeft && this._isValidXMove(-move)) ? this._x - move : this._isValidXMove(move) ?  this._x + move : this._x ;
                this._y = (moveLeft && this._isValidYMove(-move)) ? this._y - move : this._isValidYMove(move) ? this._y + move : this._y;
                break;
              }
              default:
              {

                move = Math.max(xMove, yMove) > 0 ? Math.max(xMove, yMove) : Math.min(xMove, yMove);
                len = move * 2;
                this._x = this._isValidXMove(-move) ? this._x - move : this._x;
                this._y = this._isValidYMove(-move) ? this._y - move : this._y;
                break;

              }
            }
            this._length = (this._isValidLengthMove(len) ? (this._length + len) : this._length);
          }

        }else{
          //move entire selector square
          this._x = this._isValidXMove(xMove) ? this._x + xMove : this._x;
          this._y = this._isValidYMove(yMove) ? this._y + yMove : this._y;
        }

      },
      nearestCorner: function(mouseX, mouseY){

        var pxFromXLeft = Math.abs(mouseX - this._x);
        var pxFromXRight = Math.abs(mouseX - (this._x + this._length));
        var pxFromYTop = Math.abs(mouseY - this._y);
        var pxFromYBottom = Math.abs(mouseY - (this._y + this._length));

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

        this._currentCorner = this.nearestCorner(mouseX, mouseY);

      }



    }

    return CropSelection;
  }
);
