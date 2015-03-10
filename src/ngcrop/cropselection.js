/**
 * Created by ltischuk on 2/7/15.
 */
angular.module('ngcrop')
  .factory('CropSelection', function CropSelectionFactory(ngCropConstants) {

    function CropSelection(maxLength){

      this._x = 0;
      this._y = 0;
      this._length = 0;
      this._paddedPixels = 2;
      this._ratio = 1;
      this._scaledWidth = 1;
      this._scaledHeight = 1;
      this._maxLength = maxLength;
      this._maxX = 0;
      this._maxY = 0;
      this._currentCorner = 0;

    }

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
      get scaledWidth(){

        return this._scaledWidth;

      },
      get scaledHeight(){

        return this._scaledHeight;
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
      setScalesToImage : function(img){

        var imgRatio = Math.min ((this._maxLength / img.width),(this._maxLength/ img.height));
        this._ratio = imgRatio > 1 ? 1 : imgRatio;
        this._scaledWidth = img.width * this._ratio;
        this._scaledHeight = img.height * this._ratio;
        this._maxX = this._scaledWidth - this._paddedPixels;
        this._maxY = this._scaledHeight - this._paddedPixels;
        var dim = Math.min(this._scaledWidth,this._scaledHeight);
        var qtrDim = dim/4;
        this._x = (this._maxX / 2) - qtrDim;
        this._y = qtrDim;
        this._length = dim/2;

      },
      isInMoveZone : function(pointX, pointY){

        //a 6th of the square length from each side will
        var partial = this._length /6;
        var maxBound = this._length - partial;
        if(pointX >= (this._x + partial) && pointX <= (this._x + maxBound) &&
          pointY >= (this._y + partial) && pointY <= (this._y + maxBound)){

          return true;
        }
        return false;
      },
      _allowedLengthMove: function(acc){
        if(this._x + (this._length + acc) > (this._maxX) || this._y + (this._length + acc) > (this._maxY) ||
          this._length + acc < 0 ){
          return false;

        }
        return true;
      },
      _allowedXMove : function(acc){
        if((acc + this._x) < this._paddedPixels || (this._x + acc + this._length) > this._maxX){
          return false;
        }
        return true;
      },
      _allowedYMove : function(acc){
        if((acc + this._y) < this._paddedPixels || (this._y + acc + this._length) > this._maxY ||
          (this._length - Math.abs(acc)) <= 0){
          return false;
        }
        return true;
      },
      move : function(xMove,yMove, isCorner, cornerPosition){

        if(isCorner){

          //expand or collapse selector square depending on movement and which corner
          var move = 0;
          var len = 0;

          if(this._currentCorner == cornerPosition){

            switch(cornerPosition) {

              case ngCropConstants.POSITIONS.TOP_LEFT:
              {

                move = Math.max(xMove, yMove) > 0 ? Math.max(xMove, yMove) : Math.min(xMove, yMove);
                len = -(move * 2);
                this._x = this._allowedXMove(move) ? this._x + move : this._x;
                this._y = this._allowedYMove(move) ? this._y + move : this._y;
                break;

              }
              case ngCropConstants.POSITIONS.TOP_RIGHT:
              {

                var moveRight = (xMove > 0 || yMove < 0);
                move = Math.max(Math.abs(xMove),Math.abs(yMove));
                len = moveRight ? (move * 2) : -(move *2);
                this._x = moveRight && this._allowedXMove(-move) ? this._x - move : this._allowedXMove(move) ?  this._x + move : this._x ;
                this._y = moveRight && this._allowedYMove(-move) ? this._y - move : this._allowedYMove(move) ? this._y + move : this._y;
                break;
              }
              case ngCropConstants.POSITIONS.BOTTOM_LEFT:
              {

                var moveLeft = (xMove < 0 || yMove > 0);
                move = Math.max(Math.abs(xMove),Math.abs(yMove));
                len = moveLeft ? (move * 2) : -(move *2);
                this._x = (moveLeft && this._allowedXMove(-move)) ? this._x - move : this._allowedXMove(move) ?  this._x + move : this._x ;
                this._y = (moveLeft && this._allowedYMove(-move)) ? this._y - move : this._allowedYMove(move) ? this._y + move : this._y;
                break;
              }
              default:
              {

                move = Math.max(xMove, yMove) > 0 ? Math.max(xMove, yMove) : Math.min(xMove, yMove);
                len = move * 2;
                this._x = this._allowedXMove(-move) ? this._x - move : this._x;
                this._y = this._allowedYMove(-move) ? this._y - move : this._y;
                break;

              }
            }
            this._length = (this._allowedLengthMove(len) ? (this._length + len) : this._length);
          }

        }else{
          //move entire selector square
          this._x = this._allowedXMove(xMove) ? this._x + xMove : this._x;
          this._y = this._allowedYMove(yMove) ? this._y + yMove : this._y;
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
