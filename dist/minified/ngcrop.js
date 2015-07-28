angular.module("ngcrop",[]).constant("ngCropConstants",{POSITIONS:{TOP_LEFT:1,TOP_RIGHT:2,BOTTOM_LEFT:3,BOTTOM_RIGHT:4}}),angular.module("ngcrop").factory("CropCanvas",["CropSelection","ResultCanvas",function(t,e){function s(s,n,i,o,c,r){this.canvas=s,this.context=s[0].getContext("2d"),this.resultCanvas=new e(angular.isDefined(c)?c:"image/png"),this.maxLength=n,this.cropSelector=new t(n),this.selectorLineWidth=i,this.selectorColor=o,this.imgScale=1,this.isSelecting=!1,this.moveCorner=!1,this.lastX=0,this.lastY=0,this.currentX=0,this.currentY=0,this.corner=0,this.canvasLeftPos=0,this.canvasTopPos=0,this.currentImg=void 0,this.onCropResult=r,this._addEventHandlers()}return s.prototype={get canvas(){return this._canvas},set canvas(t){this._canvas=t},get context(){return this._context},set context(t){this._context=t},get resultCanvas(){return this._resultCanvas},set resultCanvas(t){this._resultCanvas=t},get maxLength(){return this._maxLength},set maxLength(t){this._maxLength=t},get cropSelector(){return this._cropSelector},set cropSelector(t){this._cropSelector=t},get selectorLineWidth(){return this._selectorLineWidth},set selectorLineWidth(t){this._selectorLineWidth=t},get selectorColor(){return this._selectorColor},set selectorColor(t){this._selectorColor=t},get imgScale(){return this._imgScale},set imgScale(t){this._imgScale=t},get isSelecting(){return this._isSelecting},set isSelecting(t){this._isSelecting=t},get moveCorner(){return this._moveCorner},set moveCorner(t){this._moveCorner=t},get lastX(){return this._lastMouseX},set lastX(t){this._lastMouseX=t},get lastY(){return this._lastMouseY},set lastY(t){this._lastMouseY=t},get currentX(){return this._mouseX},set currentX(t){this._mouseX=t},get currentY(){return this._mouseY},set currentY(t){this._mouseY=t},get corner(){return this._corner},set corner(t){this._corner=t},get canvasLeftPos(){return this._canvasLeftPos},set canvasLeftPos(t){this._canvasLeftPos=t},get canvasTopPos(){return this._canvasTopPos},set canvasTopPos(t){this._canvasTopPos=t},_addEventHandlers:function(){var t=this;this.canvas.on("mousedown",function(e){t._handleDown(e)}),this.canvas.on("mouseup",function(e){t._handleUp(e)}),this.canvas.on("mousemove",function(e){t._handleMove(e)}),this.canvas.on("mouseout",function(e){t._handleUp(e)}),this.canvas.on("touchstart",function(e){t._handleDown(e)}),this.canvas.on("touchmove",function(e){t._handleMove(e)}),this.canvas.on("touchend",function(e){t._handleUp(e)}),this.canvas.on("touchcancel",function(e){t._handleUp(e)})},_handleDown:function(t){t.preventDefault();var e=angular.isDefined(t.touches);this.currentX=(e?t.touches[0].clientX:t.clientX)-this.canvasLeftPos,this.currentY=(e?t.touches[0].clientY:t.clientY)-this.canvasTopPos,this.lastX=this.currentX,this.lastY=this.currentY,this.isSelecting=!0,this.cropSelector.setCurrentCorner(this.currentX,this.currentY),this.cropSelector.isInMoveZone(this.currentX,this.currentY)?(this.canvas[0].style.cursor="move",this.moveCorner=!1):(this.canvas[0].style.cursor="crosshair",this.corner=this.cropSelector.nearestCorner(this.currentX,this.currentY),this.moveCorner=!0)},_handleMove:function(t){t.preventDefault();var e=angular.isDefined(t.touches);if(this.currentX=(e?t.touches[0].clientX:t.clientX)-this.canvasLeftPos,this.currentY=(e?t.touches[0].clientY:t.clientY)-this.canvasTopPos,this.isSelecting){this._drawCanvas();var s=this.currentX-this.lastX,n=this.currentY-this.lastY;this.cropSelector.move(s,n,this.moveCorner,this.corner),this.lastX=this.currentX,this.lastY=this.currentY,this._drawCanvas()}else this.cropSelector.isInMoveZone(this.currentX,this.currentY)?this.canvas[0].style.cursor="move":(this.canvas[0].style.cursor="crosshair",this.moveCorner=!0)},_handleUp:function(t){t.preventDefault(),this.isSelecting=!1,this.moveCorner=!1,this._drawCanvas(),this.canvas[0].style.cursor="default",this.getCroppedImageData()},_drawCanvas:function(){this.context.clearRect(0,0,this.canvas[0].width,this.canvas[0].height),this.context.drawImage(this.currentImg,0,0,this.currentImg.width,this.currentImg.height,0,0,this.canvas[0].width,this.canvas[0].height),this.context.lineWidth=this.selectorLineWidth,this.context.strokeStyle=this.selectorColor,this.context.strokeRect(this.cropSelector.x,this.cropSelector.y,this.cropSelector.length,this.cropSelector.length)},getCroppedImageData:function(){var t=this.cropSelector.x/this.imgScale,e=this.cropSelector.y/this.imgScale,s=this.cropSelector.length/this.imgScale,n=this.resultCanvas.getDataUrl(this.currentImg,t,e,s);this.onCropResult(n)},getCropCanvasInfo:function(){return{width:this.canvas[0].width,height:this.canvas[0].height}},getCropCanvasSelectorInfo:function(){return{x:this.cropSelector.x,y:this.cropSelector.y,length:this.cropSelector.length,scale:this.imgScale}},processNewImage:function(t,e,s,n){this.imgScale=Math.min(this.maxLength/t.width,this.maxLength/t.height,1),this.canvas[0].width=t.width*this.imgScale,this.canvas[0].height=t.height*this.imgScale,this.cropSelector.initSelectorDimensions(this.canvas[0].width,this.canvas[0].height,e,s,n);var i=this.canvas[0].getBoundingClientRect();this.canvasLeftPos=i.left,this.canvasTopPos=i.top,this.currentImg=t,this._drawCanvas(),this.getCroppedImageData()},destroy:function(){this.canvas.off("mousedown",this._handleDown),this.canvas.off("mouseup",this._handleUp),this.canvas.off("mouseout",this._handleUp),this.canvas.off("mousemove",this._handleMove),this.canvas.off("touchstart",this._handleDown),this.canvas.off("touchmove",this._handleUp),this.canvas.off("touchend",this._handleUp),this.canvas.off("touchcancel",this._handleMove),this.canvas.remove()}},s}]),angular.module("ngcrop").factory("CropSelection",["ngCropConstants",function(t){function e(){this.x=0,this.y=0,this.length=0,this.outerCushion=2,this.maxX=0,this.maxY=0,this.currentCorner=0}return e.prototype={get x(){return this._x},set x(t){this._x=t},get y(){return this._y},set y(t){this._y=t},get length(){return this._length},set length(t){this._length=t},get outerCushion(){return this._outerCushion},set outerCushion(t){this._outerCushion=t},get maxX(){return this._maxX},set maxX(t){this._maxX=t},get maxY(){return this._maxY},set maxY(t){this._maxY=t},get currentCorner(){return this._currentCorner},set currentCorner(t){this._currentCorner=t},initSelectorDimensions:function(t,e,s,n,i){if(this.maxX=t-this.outerCushion,this.maxY=e-this.outerCushion,s=Number(s),n=Number(n),i=Number(i),angular.isDefined(s)&&angular.isDefined(n)&&angular.isDefined(i)&&isFinite(s),isFinite(n),isFinite(i))this.x=s,this.y=n,this.length=i;else{var o=Math.min(t,e);this.x=this.maxX/2-o/4,this.y=o/4,this.length=o/2}},isInMoveZone:function(t,e){var s=this.length/5,n=this.length-s;return t>=this.x+s&&t<=this.x+n&&e>=this.y+s&&e<=this.y+n?!0:!1},_isValidCornerMove:function(t,e){var s=t+this.x,n=t+this.y,i=this.length+e;return s>=this.outerCushion&&s+i<this.maxX&&n>=this.outerCushion&&n+i<this.maxY&&i>10},_isValidLengthMove:function(t){var e=this.length+t;return this.x+e>this.maxX||this.y+e>this.maxY||10>e?!1:!0},_isValidXMove:function(t){var e=t+this.x;return e<this.outerCushion||e+this.length>this.maxX?!1:!0},_isValidYMove:function(t){var e=t+this.y;return e<this.outerCushion||e+this.length>this.maxY?!1:!0},move:function(e,s,n,i){if(n){var o=0>s?!0:!1,c=0>e?!0:!1,r=s>0?!0:!1,a=Math.max(Math.abs(e),Math.abs(s)),h=2*a;if(this.currentCorner==i){switch(i){case t.POSITIONS.TOP_LEFT:h*=c||o?1:-1,a*=c||o?-1:1;break;case t.POSITIONS.TOP_RIGHT:h*=r||c?-1:1,a*=r||c?1:-1;break;case t.POSITIONS.BOTTOM_LEFT:h*=r||c?1:-1,a*=r||c?-1:1;break;default:h*=c||o?-1:1,a*=c||o?1:-1}this._isValidCornerMove(a,h)&&(this.x+=a,this.y+=a,this.length+=h)}}else this.x=this._isValidXMove(e)?this.x+e:this.x,this.y=this._isValidYMove(s)?this.y+s:this.y},nearestCorner:function(t,e){var s=Math.abs(t-this.x),n=Math.abs(t-(this.x+this.length)),i=Math.abs(e-this.y),o=Math.abs(e-(this.y+this.length)),c=s+i,r=n+i,a=s+o,h=n+o,u=Math.min(c,r,a,h),l=0;return l=u==c?1:u==r?2:u==a?3:4},setCurrentCorner:function(t,e){this.currentCorner=this.nearestCorner(t,e)}},e}]),angular.module("ngcrop").directive("cropImage",["CropCanvas","$window",function(t,e){return{restrict:"E",scope:{origImage:"=",croppedImgData:"=",maxImgDisplayLength:"=?",croppedImgFormat:"@?",addCanvasBorder:"@?",selectorColor:"@?",selectorLineWidth:"@?",selectorStartX:"@?",selectorStartY:"@?",selectorStartLength:"@?",postCanvasImgProcessCallback:"&?",postSelectorMoveCallback:"&?"},template:"<canvas></canvas>",link:function(s,n){function i(t){s.croppedImgData=t,angular.isFunction(s.postSelectorMoveCallback)&&s.postSelectorMoveCallback({selectorInfo:r.getCropCanvasSelectorInfo()})}s.selectorColor=angular.isDefined(s.selectorColor)?s.selectorColor:"#ff0000",s.selectorLineWidth=angular.isDefined(s.selectorLineWidth)&&angular.isNumber(Number(s.selectorLineWidth))?Number(s.selectorLineWidth):2,s.croppedImgFormat="image/"+(!angular.isDefined(s.croppedImgFormat)||"jpeg"!=s.croppedImgFormat&&"png"!=s.croppedImgFormat?"png":s.croppedImgFormat);var o=angular.isDefined(s.maxImgDisplayLength)&&angular.isNumber(Number(s.maxImgDisplayLength))?Number(s.maxImgDisplayLength):300,c=n.find("canvas");angular.isDefined(s.addCanvasBorder)&&"true"===s.addCanvasBorder&&c.css({border:"solid 2px #000000"});var r=new t(c,o,s.selectorLineWidth,s.selectorColor,s.croppedImgFormat,i);s.$watch(function(t){return t.origImage},function(t){angular.isDefined(t)&&(r.processNewImage(t,s.selectorStartX,s.selectorStartY,s.selectorStartLength),angular.isFunction(s.postCanvasImgProcessCallback)&&s.postCanvasImgProcessCallback({canvasInfo:r.getCropCanvasInfo()}))});var a=function(){r.processNewImage(s.origImage),angular.isFunction(s.postCanvasImgProcessCallback)&&s.postCanvasImgProcessCallback({canvasInfo:r.getCropCanvasInfo()})};e.addEventListener("orientationchange",a,!1),s.$on("$destroy",function(){e.removeEventListener("orientationchange",a,!1),r.destroy()})}}}]),angular.module("ngcrop").factory("ResultCanvas",function(){function t(t){this.resultCanvas=document.createElement("canvas"),this.context=this.resultCanvas.getContext("2d"),this.outputImageFormat=t}return t.prototype={getDataUrl:function(t,e,s,n){return this.resultCanvas.height=n,this.resultCanvas.width=n,this.context.drawImage(t,e,s,n,n,0,0,n,n),this.resultCanvas.toDataURL(this.outputImageFormat)}},t});