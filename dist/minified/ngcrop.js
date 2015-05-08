angular.module("ngcrop",[]).constant("ngCropConstants",{POSITIONS:{TOP_LEFT:1,TOP_RIGHT:2,BOTTOM_LEFT:3,BOTTOM_RIGHT:4}}),angular.module("ngcrop").factory("CropCanvas",["CropSelection","ResultCanvas",function(t,e){function s(s,i,n,o,c,r){this.canvas=s,this.context=s[0].getContext("2d"),this.resultCanvas=new e(angular.isDefined(c)?c:"image/png"),this.maxLength=i,this.cropSelector=new t(i),this.selectorLineWidth=n,this.selectorColor=o,this.imgScale=1,this.isSelecting=!1,this.moveCorner=!1,this.lastMouseX=0,this.lastMouseY=0,this.mouseX=0,this.mouseY=0,this.corner=0,this.canvasLeftPos=0,this.canvasTopPos=0,this.currentImg=void 0,this.onCropResult=r,this._addEventHandlers()}return s.prototype={get canvas(){return this._canvas},set canvas(t){this._canvas=t},get context(){return this._context},set context(t){this._context=t},get resultCanvas(){return this._resultCanvas},set resultCanvas(t){this._resultCanvas=t},get maxLength(){return this._maxLength},set maxLength(t){this._maxLength=t},get cropSelector(){return this._cropSelector},set cropSelector(t){this._cropSelector=t},get selectorLineWidth(){return this._selectorLineWidth},set selectorLineWidth(t){this._selectorLineWidth=t},get selectorColor(){return this._selectorColor},set selectorColor(t){this._selectorColor=t},get imgScale(){return this._imgScale},set imgScale(t){this._imgScale=t},get isSelecting(){return this._isSelecting},set isSelecting(t){this._isSelecting=t},get moveCorner(){return this._moveCorner},set moveCorner(t){this._moveCorner=t},get lastMouseX(){return this._lastMouseX},set lastMouseX(t){this._lastMouseX=t},get lastMouseY(){return this._lastMouseY},set lastMouseY(t){this._lastMouseY=t},get mouseX(){return this._mouseX},set mouseX(t){this._mouseX=t},get mouseY(){return this._mouseY},set mouseY(t){this._mouseY=t},get corner(){return this._corner},set corner(t){this._corner=t},get canvasLeftPos(){return this._canvasLeftPos},set canvasLeftPos(t){this._canvasLeftPos=t},get canvasTopPos(){return this._canvasTopPos},set canvasTopPos(t){this._canvasTopPos=t},_addEventHandlers:function(){var t=this;this.canvas.on("mousedown",function(e){t._handleMouseDown(e)}),this.canvas.on("mouseup",function(e){t._handleMouseUp(e)}),this.canvas.on("mousemove",function(e){t._handleMouseMove(e)}),this.canvas.on("mouseout",function(e){t._handleMouseUp(e)})},_handleMouseDown:function(t){this.mouseX=t.clientX-this.canvasLeftPos,this.mouseY=t.clientY-this.canvasTopPos,this.lastMouseX=this.mouseX,this.lastMouseY=this.mouseY,this.isSelecting=!0,this.cropSelector.setCurrentCorner(this.mouseX,this.mouseY),this.cropSelector.isInMoveZone(this.mouseX,this.mouseY)?(this.canvas[0].style.cursor="move",this.moveCorner=!1):(this.canvas[0].style.cursor="crosshair",this.corner=this.cropSelector.nearestCorner(this.mouseX,this.mouseY),this.moveCorner=!0)},_handleMouseMove:function(t){if(this.mouseX=t.clientX-this.canvasLeftPos,this.mouseY=t.clientY-this.canvasTopPos,this.isSelecting){this._drawCanvas();var e=this.mouseX-this.lastMouseX,s=this.mouseY-this.lastMouseY;this.cropSelector.move(e,s,this.moveCorner,this.corner),this.lastMouseX=this.mouseX,this.lastMouseY=this.mouseY,this._drawCanvas()}else this.cropSelector.isInMoveZone(this.mouseX,this.mouseY)?this.canvas[0].style.cursor="move":(this.canvas[0].style.cursor="crosshair",this.moveCorner=!0)},_handleMouseUp:function(){this.isSelecting=!1,this.moveCorner=!1,this._drawCanvas(),this.canvas[0].style.cursor="default",this.getCroppedImageData()},_drawCanvas:function(){this.context.clearRect(0,0,this.canvas[0].width,this.canvas[0].height),this.context.drawImage(this.currentImg,0,0,this.currentImg.width,this.currentImg.height,0,0,this.canvas[0].width,this.canvas[0].height),this.context.lineWidth=this.selectorLineWidth,this.context.strokeStyle=this.selectorColor,this.context.strokeRect(this.cropSelector.x,this.cropSelector.y,this.cropSelector.length,this.cropSelector.length)},getCroppedImageData:function(){var t=this.cropSelector.x/this.imgScale,e=this.cropSelector.y/this.imgScale,s=this.cropSelector.length/this.imgScale,i=this.resultCanvas.getDataUrl(this.currentImg,t,e,s);this.onCropResult(i)},processNewImage:function(t){this.imgScale=Math.min(this.maxLength/t.width,this.maxLength/t.height,1),this.canvas[0].width=t.width*this.imgScale,this.canvas[0].height=t.height*this.imgScale,this.cropSelector.initSelectorDimensions(this.canvas[0].width,this.canvas[0].height);var e=this.canvas[0].getBoundingClientRect();this.canvasLeftPos=e.left,this.canvasTopPos=e.top,this.currentImg=t,this._drawCanvas(),this.getCroppedImageData()},destroy:function(){this.canvas.off("mousedown",this._handleMouseDown),this.canvas.off("mouseup",this._handleMouseUp),this.canvas.off("mouseout",this._handleMouseUp),this.canvas.off("mousemove",this._handleMouseMove),this.canvas.remove(),this.resultCanvas.destroy()}},s}]),angular.module("ngcrop").factory("CropSelection",["ngCropConstants",function(t){function e(){this.x=0,this.y=0,this.length=0,this.outerCushion=2,this.maxX=0,this.maxY=0,this.currentCorner=0}return e.prototype={get x(){return this._x},set x(t){this._x=t},get y(){return this._y},set y(t){this._y=t},get length(){return this._length},set length(t){this._length=t},get outerCushion(){return this._outerCushion},set outerCushion(t){this._outerCushion=t},get maxX(){return this._maxX},set maxX(t){this._maxX=t},get maxY(){return this._maxY},set maxY(t){this._maxY=t},get currentCorner(){return this._currentCorner},set currentCorner(t){this._currentCorner=t},initSelectorDimensions:function(t,e){this.maxX=t-this.outerCushion,this.maxY=e-this.outerCushion;var s=Math.min(t,e);this.x=this.maxX/2-s/4,this.y=s/4,this.length=s/2},isInMoveZone:function(t,e){var s=this.length/5,i=this.length-s;return t>=this.x+s&&t<=this.x+i&&e>=this.y+s&&e<=this.y+i?!0:!1},_isValidCornerMove:function(t,e){var s=t+this.x,i=t+this.y,n=this.length+e;return s>=this.outerCushion&&s+n<this.maxX&&i>=this.outerCushion&&i+n<this.maxY&&n>10},_isValidLengthMove:function(t){var e=this.length+t;return this.x+e>this.maxX||this.y+e>this.maxY||10>e?!1:!0},_isValidXMove:function(t){var e=t+this.x;return e<this.outerCushion||e+this.length>this.maxX?!1:!0},_isValidYMove:function(t){var e=t+this.y;return e<this.outerCushion||e+this.length>this.maxY?!1:!0},move:function(e,s,i,n){if(i){var o=0>s?!0:!1,c=0>e?!0:!1,r=s>0?!0:!1,h=Math.max(Math.abs(e),Math.abs(s)),a=2*h;if(this.currentCorner==n){switch(n){case t.POSITIONS.TOP_LEFT:a*=c||o?1:-1,h*=c||o?-1:1;break;case t.POSITIONS.TOP_RIGHT:a*=r||c?-1:1,h*=r||c?1:-1;break;case t.POSITIONS.BOTTOM_LEFT:a*=r||c?1:-1,h*=r||c?-1:1;break;default:a*=c||o?-1:1,h*=c||o?1:-1}this._isValidCornerMove(h,a)&&(this.x+=h,this.y+=h,this.length+=a)}}else this.x=this._isValidXMove(e)?this.x+e:this.x,this.y=this._isValidYMove(s)?this.y+s:this.y},nearestCorner:function(t,e){var s=Math.abs(t-this.x),i=Math.abs(t-(this.x+this.length)),n=Math.abs(e-this.y),o=Math.abs(e-(this.y+this.length)),c=s+n,r=i+n,h=s+o,a=i+o,u=Math.min(c,r,h,a),l=0;return l=u==c?1:u==r?2:u==h?3:4},setCurrentCorner:function(t,e){this.currentCorner=this.nearestCorner(t,e)}},e}]),angular.module("ngcrop").directive("cropImage",["CropCanvas",function(t){return{restrict:"E",scope:{origImage:"=",maxImgDisplayLength:"=",croppedImgData:"=",croppedImgFormat:"@",addCanvasBorder:"@",selectorColor:"@",selectorLineWidth:"@"},template:"<canvas></canvas>",link:function(e,s){function i(t){e.croppedImgData=t}e.selectorColor=angular.isDefined(e.selectorColor)?e.selectorColor:"#ff0000",e.selectorLineWidth=angular.isDefined(e.selectorLineWidth)&&angular.isNumber(Number(e.selectorLineWidth))?Number(e.selectorLineWidth):2,e.croppedImgFormat="image/"+(!angular.isDefined(e.croppedImgFormat)||"jpeg"!=e.croppedImgFormat&&"png"!=e.croppedImgFormat?"png":e.croppedImgFormat);var n=angular.isDefined(e.maxImgDisplayLength)&&angular.isNumber(Number(e.maxImgDisplayLength))?Number(e.maxImgDisplayLength):300,o=s.find("canvas");angular.isDefined(e.addCanvasBorder)&&"true"===e.addCanvasBorder&&o.css({border:"solid 2px #000000"});var c=new t(o,n,e.selectorLineWidth,e.selectorColor,e.croppedImgFormat,i);e.$watch(function(t){return t.origImage},function(t){angular.isDefined(t)&&c.processNewImage(t)}),e.$on("$destroy",function(){c.destroy()})}}}]),angular.module("ngcrop").factory("ResultCanvas",function(){function t(t){this.resultCanvas=document.createElement("canvas"),this.context=this.resultCanvas.getContext("2d"),this.outputImageFormat=t}return t.prototype={getDataUrl:function(t,e,s,i){return this.resultCanvas.height=i,this.resultCanvas.width=i,this.context.drawImage(t,e,s,i,i,0,0,i,i),this.resultCanvas.toDataURL(this.outputImageFormat)},destroy:function(){this.resultCanvas.remove()}},t});