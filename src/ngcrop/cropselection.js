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

      this._x = 0;
      this._y = 0;
      this._length = 0;
      this._outerCushion = 2;
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
      /**
       * Set the selector
       * @param img
       */
      initSelectorDimensions : function(parentWidth, parentHeight){

        this._maxX = parentWidth - this._outerCushion;
        this._maxY = parentHeight - this._outerCushion;

        //position selector in the center of the parent canvas
        var minLenValue = Math.min(parentWidth, parentHeight);
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
        var moveZoneMinBound = this._length / 5;
        var moveZoneMaxBound = this._length - moveZoneMinBound;
        if(pointX >= (this._x + moveZoneMinBound) && pointX <= (this._x + moveZoneMaxBound) &&
          pointY >= (this._y + moveZoneMinBound) && pointY <= (this._y + moveZoneMaxBound)){

          return true;
        }
        return false;
      },
      _isValidCornerMove : function( acc,lenAcc){

        var newX = acc + this._x;
        var newY = acc + this._y;
        var newLen = this._length + lenAcc;
        return (newX >= this._outerCushion && (newX + newLen) < this._maxX &&
                newY >= this._outerCushion && (newY + newLen) < this._maxY &&
                newLen > 10);

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

        var tempX = acc + this._x;
        if(tempX < this._outerCushion || tempX + this._length > this._maxX){
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

        var tempY = acc + this._y;
        if(tempY < this._outerCushion || tempY + this._length > this._maxY){
          return false;
        }
        return true;
      },
      move : function(xMove,yMove, isCorner, cornerPosition){

        if(isCorner){

          //expand or collapse selector square depending on movement and corner
          var movingUp = yMove < 0 ? true: false;
          var movingLeft = xMove < 0 ? true : false;
          var movingDown = yMove > 0 ? true : false;
          var moveAdj = Math.max(Math.abs(xMove),Math.abs(yMove));
          var lenAdj = moveAdj * 2;

          if(this._currentCorner == cornerPosition){

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
              this._x += moveAdj;
              this._y += moveAdj;
              this._length += lenAdj;
            }
          }

        }else{
          //move entire selector square
          this._x = this._isValidXMove(xMove) ? this._x + xMove : this._x;
          this._y = this._isValidYMove(yMove) ? this._y + yMove : this._y;
        }

      },
      nearestCorner: function(pointX, pointY){

        var pxFromXLeft = Math.abs(pointX - this._x);
        var pxFromXRight = Math.abs(pointX - (this._x + this._length));
        var pxFromYTop = Math.abs(pointY - this._y);
        var pxFromYBottom = Math.abs(pointY - (this._y + this._length));

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
