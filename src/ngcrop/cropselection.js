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

      this.x = 0;
      this.y = 0;
      this.length = 0;
      this.outerCushion = 2;
      this.maxX = 0;
      this.maxY = 0;
      this.currentCorner = 0;

    }

    //  /**
    //   * Prototype functions
    //   **/
    //CropSelection.prototype = {
    //
    //  //accessor methods
    //  get x(){
    //
    //    return this._x;
    //
    //  },
    //  set x(x){
    //
    //    this._x = x;
    //
    //  },
    //  get y(){
    //
    //    return this._y;
    //
    //  },
    //  set y(value){
    //
    //    this._y = value;
    //
    //  },
    //  get length(){
    //
    //    return this._length;
    //
    //  },
    //  set length(value){
    //
    //    this._length = value;
    //
    //  },
    //  get outerCushion(){
    //
    //    return this._outerCushion;
    //
    //  },
    //  set outerCushion(value){
    //
    //    this._outerCushion = value;
    //
    //  },
    //  get maxX(){
    //
    //    return this._maxX;
    //
    //  },
    //  set maxX(value){
    //
    //    this._maxX = value;
    //
    //  },
    //  get maxY(){
    //
    //    return this._maxY;
    //
    //  },
    //  set maxY(value){
    //
    //    this._maxY = value;
    //
    //  },
    //  get currentCorner(){
    //
    //    return this._currentCorner;
    //
    //  },
    //  set currentCorner(value){
    //
    //    this._currentCorner = value;
    //
    //  },
      /**
       * Set the selector dimensions given a new canvas (parent) width and height
       * @param parentWidth
       * @param parentHeight
       * @param (optional) startX - starting value of X within the canvas dimensions
       * @param (optional) startY - starting value of Y within the canvas dimensions
       * @param (optional) startLength - starting value of length within the canvas dimensions
       *
       */
      CropSelection.prototype.initSelectorDimensions = function(parentWidth, parentHeight, startX, startY, startLength) {

        this.maxX = parentWidth - this.outerCushion;
        this.maxY = parentHeight - this.outerCushion;

        startX = Number(startX);
        startY = Number(startY);
        startLength = Number(startLength);

        if (angular.isDefined(startX) && angular.isDefined(startY) && angular.isDefined(startLength) &&
            isFinite(startX), isFinite(startY), isFinite(startLength) && startLength > 0) {

          this.x = startX;
          this.y = startY;
          this.length = startLength;

        } else {

          //position selector in the center of the parent canvas
          var minLenValue = Math.min(parentWidth, parentHeight);
          this.x = (this.maxX / 2) - (minLenValue / 4);
          this.y = (minLenValue / 4);
          this.length = minLenValue / 2;

        }

      }
      /**
       * Calculate whether or not the point is in the center move zone to move the entire selector in any direction
       * @param pointX
       * @param pointY
       * @returns {boolean}
       */
      CropSelection.prototype.isInMoveZone = function(pointX, pointY){

        //find if point is in moveable territory and not in expandable/collapsable areas near corners
        var moveZoneMinBound = this.length / 12;
        var moveZoneMaxBound = this.length - moveZoneMinBound;
        if(pointX >= (this.x + moveZoneMinBound) && pointX <= (this.x + moveZoneMaxBound) &&
          pointY >= (this.y + moveZoneMinBound) && pointY <= (this.y + moveZoneMaxBound)){

          return true;
        }
        return false;
      }
      /**
       * isValidCornerMove - checks if the move is valid given an increment for x and y and length increment
       * @param increment for x and y
       * @param lenIncrement for the length
       * @returns {boolean}
       * @private
       */
      CropSelection.prototype.isValidCornerMove = function( increment,lenIncrement){

        var newX = increment + this.x;
        var newY = increment + this.y;
        var newLen = this.length + lenIncrement;
        return (newX >= this.outerCushion && (newX + newLen) < this.maxX &&
                newY >= this.outerCushion && (newY + newLen) < this.maxY &&
                newLen > 10);

      }
      ///**
      // * Determines whether a given potential increment is allowed for length
      // * @param acc
      // * @returns {boolean}
      // * @private
      // */
      //CropSelection.prototype._isValidLengthMove = function(acc){
      //
      //  var tempLength = (this.length + acc);
      //  if((this.x + tempLength > this.maxX) || (this.y + tempLength > this.maxY)
      //      || tempLength < 10){
      //    return false;
      //
      //  }
      //  return true;
      //
      //}
    //  /**
    //   * Determine whether a given potential increment can be applied to X
    //   * @param acc
    //   * @returns {boolean}
    //   * @private
    //   */
    //  _isValidXMove : function(acc){
    //
    //    var tempX = acc + this.x;
    //    if(tempX < this.outerCushion || tempX + this.length > this.maxX){
    //      return false;
    //    }
    //    return true;
    //
    //  },
    //  /**
    //   * Determine whether a given potential increment can be applied to Y
    //   * @param acc
    //   * @returns {boolean}
    //   * @private
    //   */
    //  _isValidYMove : function(acc){
    //
    //    var tempY = acc + this.y;
    //    if(tempY < this.outerCushion || tempY + this.length > this.maxY){
    //      return false;
    //    }
    //    return true;
    //  },
    //  /**
    //   * Move the selector x, y coordinates given a move increment and compute new length if necessary
    //   * @param xMove
    //   * @param yMove
    //   * @param isCorner
    //   * @param cornerPosition
    //   */
    //  move : function(xMove,yMove, isCorner, cornerPosition){
    //
    //    if(isCorner){
    //
    //      // assess the direction of the current move, then normalize the adjustments so we maintain
    //      // smoothness in movement
    //      var movingUp = yMove < 0 ? true: false;
    //      var movingLeft = xMove < 0 ? true : false;
    //      var movingDown = yMove > 0 ? true : false;
    //      var moveAdj = Math.max(Math.abs(xMove),Math.abs(yMove));
    //      var lenAdj = moveAdj * 2;
    //
    //      //if the corner passed in is the same as the currentCorner from the mousedown event,
    //      // calculate the move and length adjustment to expand and/or collapse square
    //      if(this.currentCorner == cornerPosition){
    //
    //        switch(cornerPosition) {
    //
    //          case ngCropConstants.POSITIONS.TOP_LEFT:
    //          {
    //
    //            lenAdj *= movingLeft || movingUp ? 1 : -1;
    //            moveAdj *= movingLeft || movingUp ? -1 : 1;
    //            break;
    //
    //          }
    //          case ngCropConstants.POSITIONS.TOP_RIGHT:
    //          {
    //
    //            lenAdj *=  movingDown || movingLeft ? -1 : 1;
    //            moveAdj *=  movingDown || movingLeft ? 1 : -1;
    //            break;
    //
    //          }
    //          case ngCropConstants.POSITIONS.BOTTOM_LEFT:
    //          {
    //
    //            lenAdj *=  movingDown || movingLeft ? 1 : -1;
    //            moveAdj *=  movingDown || movingLeft ? -1 : 1;
    //            break;
    //          }
    //          default:
    //          {
    //
    //            lenAdj *= movingLeft || movingUp ? -1 : 1;
    //            moveAdj *= movingLeft || movingUp ? 1 : -1;
    //            break;
    //
    //          }
    //        }
    //
    //        //if its a valid move, then adjust x,y and length
    //        if(this._isValidCornerMove(moveAdj,lenAdj)){
    //          this.x += moveAdj;
    //          this.y += moveAdj;
    //          this.length += lenAdj;
    //        }
    //      }
    //
    //    }else{
    //      //otherwise move entire selector square as it is not a corner move
    //      this.x = this._isValidXMove(xMove) ? this.x + xMove : this.x;
    //      this.y = this._isValidYMove(yMove) ? this.y + yMove : this.y;
    //    }
    //
    //  },
    //  /**
    //   * Find nearest corner given a point on the canvas
    //   * @param pointX
    //   * @param pointY
    //   * @private
    //   * @returns {number}
    //   */
    //  nearestCorner: function(pointX, pointY){
    //
    //    //assess the number of pixels from the given points
    //    var pxFromXLeft = Math.abs(pointX - this.x);
    //    var pxFromXRight = Math.abs(pointX - (this.x + this.length));
    //    var pxFromYTop = Math.abs(pointY - this.y);
    //    var pxFromYBottom = Math.abs(pointY - (this.y + this.length));
    //
    //    //calibrate the corners given the pixels from the points
    //    var topLeft = pxFromXLeft + pxFromYTop;
    //    var topRight = pxFromXRight + pxFromYTop;
    //    var bottomLeft = pxFromXLeft + pxFromYBottom;
    //    var bottomRight = pxFromXRight + pxFromYBottom;
    //
    //    //figure out the nearest corner given the smallest value from the calibrated corners
    //    var chosen = Math.min(topLeft, topRight, bottomLeft, bottomRight);
    //
    //    var corner = 0;
    //
    //    if(chosen == topLeft){
    //
    //      corner = 1;
    //
    //    } else if(chosen == topRight){
    //
    //      corner = 2;
    //
    //    }else if(chosen == bottomLeft){
    //
    //      corner = 3;
    //
    //    }else{
    //
    //      corner = 4;
    //
    //    }
    //    return corner;
    //
    //  },
    //  /**
    //   * Lock the current corner given an X and Y point
    //   * @param mouseX
    //   * @param mouseY
    //   */
    //  setCurrentCorner: function(mouseX, mouseY){
    //
    //    this.currentCorner = this.nearestCorner(mouseX, mouseY);
    //
    //  },
    //  resetCorner: function(){
    //
    //    this.currentCorner = 0;
    //
    //  }
    //
    //
    //}

    return CropSelection;
  }
);
