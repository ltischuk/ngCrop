angular.module("ngcrop",[]).constant("ngCropConstants",{POSITIONS:{TOP_LEFT:1,TOP_RIGHT:2,BOTTOM_LEFT:3,BOTTOM_RIGHT:4}}),angular.module("ngcrop").factory("CropCanvas",["CropSelection","ResultCanvas",function(t,e){function n(n,o,i,r,s,a){this.canvas=n,this.context=n[0].getContext("2d"),this.resultCanvas=new e(angular.isDefined(s)?s:"image/png"),this.maxLength=o,this.cropSelector=new t(o),this.selectorLineWidth=i,this.selectorColor=r,this.imgScale=1,this.isSelecting=!1,this.moveCorner=!1,this.lastX=0,this.lastY=0,this.currentX=0,this.currentY=0,this.corner=0,this.canvasLeftPos=0,this.canvasTopPos=0,this.currentImg=void 0,this.onCropResult=a,this._addEventHandlers()}return n.prototype={get canvas(){return this._canvas},set canvas(t){this._canvas=t},get context(){return this._context},set context(t){this._context=t},get resultCanvas(){return this._resultCanvas},set resultCanvas(t){this._resultCanvas=t},get maxLength(){return this._maxLength},set maxLength(t){this._maxLength=t},get cropSelector(){return this._cropSelector},set cropSelector(t){this._cropSelector=t},get selectorLineWidth(){return this._selectorLineWidth},set selectorLineWidth(t){this._selectorLineWidth=t},get selectorColor(){return this._selectorColor},set selectorColor(t){this._selectorColor=t},get imgScale(){return this._imgScale},set imgScale(t){this._imgScale=t},get isSelecting(){return this._isSelecting},set isSelecting(t){this._isSelecting=t},get moveCorner(){return this._moveCorner},set moveCorner(t){this._moveCorner=t},get lastX(){return this._lastMouseX},set lastX(t){this._lastMouseX=t},get lastY(){return this._lastMouseY},set lastY(t){this._lastMouseY=t},get currentX(){return this._mouseX},set currentX(t){this._mouseX=t},get currentY(){return this._mouseY},set currentY(t){this._mouseY=t},get corner(){return this._corner},set corner(t){this._corner=t},get canvasLeftPos(){return this._canvasLeftPos},set canvasLeftPos(t){this._canvasLeftPos=t},get canvasTopPos(){return this._canvasTopPos},set canvasTopPos(t){this._canvasTopPos=t},get currentImg(){return this._currentImg},set currentImg(t){this._currentImg=t},_addEventHandlers:function(){var t=this;this.canvas.on("mousedown",function(e){t._handleDown(e)}),this.canvas.on("mouseup",function(e){t._handleUp(e)}),this.canvas.on("mousemove",function(e){t._handleMove(e)}),this.canvas.on("mouseout",function(e){t._handleUp(e)}),this.canvas.on("touchstart",function(e){t._handleDown(e)}),this.canvas.on("touchmove",function(e){t._handleMove(e)}),this.canvas.on("touchend",function(e){t._handleUp(e)}),this.canvas.on("touchleave",function(e){t._handleUp(e)})},_handleDown:function(t){t.preventDefault();var e=angular.isDefined(t.touches)?t.touches[0]:t,n=document.body&&null!==document.body.scrollLeft?document.body.scrollLeft:document.documentElement.scrollLeft,o=document.body&&null!==document.body.scrollTop?document.body.scrollTop:document.documentElement.scrollTop;this.currentX=(e.pageX?e.pageX:t.clientX+n)-this.canvasLeftPos,this.currentY=(e.pageY?e.pageY:t.clientY+o)-this.canvasTopPos,this.lastX=this.currentX,this.lastY=this.currentY,this.isSelecting=!0,this.cropSelector.setCurrentCorner(this.currentX,this.currentY),this.cropSelector.isInMoveZone(this.currentX,this.currentY)?(this.canvas[0].style.cursor="move",this.moveCorner=!1):(this.canvas[0].style.cursor="crosshair",this.corner=this.cropSelector.nearestCorner(this.currentX,this.currentY),this.moveCorner=!0)},_handleMove:function(t){t.preventDefault();var e=angular.isDefined(t.touches)?t.touches[0]:t,n=document.body&&null!==document.body.scrollLeft?document.body.scrollLeft:document.documentElement.scrollLeft,o=document.body&&null!==document.body.scrollTop?document.body.scrollTop:document.documentElement.scrollTop;if(this.currentX=(e.pageX?e.pageX:t.clientX+n)-this.canvasLeftPos,this.currentY=(e.pageY?e.pageY:t.clientY+o)-this.canvasTopPos,this.isSelecting){this._drawCanvas();var i=this.currentX-this.lastX,r=this.currentY-this.lastY;this.cropSelector.move(i,r,this.moveCorner,this.corner),this.lastX=this.currentX,this.lastY=this.currentY,this._drawCanvas()}else this.cropSelector.isInMoveZone(this.currentX,this.currentY)?this.canvas[0].style.cursor="move":(this.canvas[0].style.cursor="crosshair",this.moveCorner=!0)},_handleUp:function(t){t.preventDefault(),this.isSelecting=!1,this.moveCorner=!1,this.cropSelector.resetCorner(),this._drawCanvas(),this.canvas[0].style.cursor="default",this.getCroppedImageData()},_drawCanvas:function(){var t=this.canvas[0].width,e=this.canvas[0].height;this.context.clearRect(0,0,t,e);var n=0,o=0,i=t,r=e,s=this.cropSelector.x+this.cropSelector.length/2,a=this.cropSelector.y+this.cropSelector.length/2,c=this.cropSelector.length/4;this.context.drawImage(this.currentImg,n,o,i,r),this.context.lineWidth=this.selectorLineWidth,this.context.strokeStyle=this.selectorColor,this.context.strokeRect(this.cropSelector.x,this.cropSelector.y,this.cropSelector.length,this.cropSelector.length),this.context.beginPath(),this.context.lineWidth=1,this.context.moveTo(s-4,a),this.context.lineTo(s+4,a),this.context.stroke(),this.context.beginPath(),this.context.moveTo(s,a-4),this.context.lineTo(s,a+4),this.context.stroke(),this.context.beginPath(),this.context.lineWidth=2,this.context.moveTo(this.cropSelector.x+c/4,this.cropSelector.y+c/4),this.context.lineTo(this.cropSelector.x+c/2,this.cropSelector.y+c/4),this.context.lineTo(this.cropSelector.x+c/4,this.cropSelector.y+c/2),this.context.lineTo(this.cropSelector.x+c/4,this.cropSelector.y+c/4),this.context.closePath(),this.context.fillStyle=this.selectorColor,this.context.fill(),this.context.beginPath(),this.context.lineWidth=2,this.context.moveTo(this.cropSelector.x+(c-c/4),this.cropSelector.y+(c-c/4)),this.context.lineTo(this.cropSelector.x+(c-c/2),this.cropSelector.y+(c-c/4)),this.context.lineTo(this.cropSelector.x+(c-c/4),this.cropSelector.y+(c-c/2)),this.context.lineTo(this.cropSelector.x+(c-c/4),this.cropSelector.y+(c-c/4)),this.context.closePath(),this.context.fillStyle=this.selectorColor,this.context.fill()},getCroppedImageData:function(){var t=this.cropSelector.x/this.imgScale,e=this.cropSelector.y/this.imgScale,n=this.cropSelector.length/this.imgScale,o=this.resultCanvas.getDataUrl(this.currentImg,t,e,n,this.currentImgOrientation);this.onCropResult(o)},getCropCanvasInfo:function(){return{width:this.canvas[0].width,height:this.canvas[0].height}},getCropCanvasSelectorInfo:function(){return{x:this.cropSelector.x,y:this.cropSelector.y,length:this.cropSelector.length,scale:this.imgScale}},processNewImage:function(t,e,n,o,i){this.imgScale=Math.min(this.maxLength/t.width,this.maxLength/t.height,1),this.canvas[0].height=t.height*this.imgScale,this.canvas[0].width=t.width*this.imgScale,this.cropSelector.initSelectorDimensions(this.canvas[0].width,this.canvas[0].height,e,n,o);var r=this.canvas[0].getBoundingClientRect();this.canvasLeftPos=r.left,this.canvasTopPos=r.top,this.currentImg=t,this._drawCanvas(),this.getCroppedImageData(),i({canvasInfo:this.getCropCanvasInfo()})},destroy:function(){this.canvas.off("mousedown",this._handleDown),this.canvas.off("mouseup",this._handleUp),this.canvas.off("mouseout",this._handleUp),this.canvas.off("mousemove",this._handleMove),this.canvas.off("touchstart",this._handleDown),this.canvas.off("touchmove",this._handleMove),this.canvas.off("touchleave",this._handleUp),this.canvas.off("touchend",this._handleUp),this.canvas.remove()}},n}]),angular.module("ngcrop").factory("CropSelection",["ngCropConstants",function(t){function e(){this.x=0,this.y=0,this.length=0,this.outerCushion=2,this.maxX=0,this.maxY=0,this.currentCorner=0}return e.prototype={get x(){return this._x},set x(t){this._x=t},get y(){return this._y},set y(t){this._y=t},get length(){return this._length},set length(t){this._length=t},get outerCushion(){return this._outerCushion},set outerCushion(t){this._outerCushion=t},get maxX(){return this._maxX},set maxX(t){this._maxX=t},get maxY(){return this._maxY},set maxY(t){this._maxY=t},get currentCorner(){return this._currentCorner},set currentCorner(t){this._currentCorner=t},initSelectorDimensions:function(t,e,n,o,i){if(this.maxX=t-this.outerCushion,this.maxY=e-this.outerCushion,n=Number(n),o=Number(o),i=Number(i),angular.isDefined(n)&&angular.isDefined(o)&&angular.isDefined(i)&&isFinite(n),isFinite(o),isFinite(i)&&i>0)this.x=n,this.y=o,this.length=i;else{var r=Math.min(t,e);this.x=this.maxX/2-r/4,this.y=r/4,this.length=r/2}},isInMoveZone:function(t,e){var n=this.length/12,o=this.length-n;return t>=this.x+n&&t<=this.x+o&&e>=this.y+n&&e<=this.y+o?!0:!1},_isValidCornerMove:function(t,e){var n=t+this.x,o=t+this.y,i=this.length+e;return n>=this.outerCushion&&n+i<this.maxX&&o>=this.outerCushion&&o+i<this.maxY&&i>10},_isValidLengthMove:function(t){var e=this.length+t;return this.x+e>this.maxX||this.y+e>this.maxY||10>e?!1:!0},_isValidXMove:function(t){var e=t+this.x;return e<this.outerCushion||e+this.length>this.maxX?!1:!0},_isValidYMove:function(t){var e=t+this.y;return e<this.outerCushion||e+this.length>this.maxY?!1:!0},move:function(e,n,o,i){if(o){var r=0>n?!0:!1,s=0>e?!0:!1,a=n>0?!0:!1,c=Math.max(Math.abs(e),Math.abs(n)),h=2*c;if(this.currentCorner==i){switch(i){case t.POSITIONS.TOP_LEFT:h*=s||r?1:-1,c*=s||r?-1:1;break;case t.POSITIONS.TOP_RIGHT:h*=a||s?-1:1,c*=a||s?1:-1;break;case t.POSITIONS.BOTTOM_LEFT:h*=a||s?1:-1,c*=a||s?-1:1;break;default:h*=s||r?-1:1,c*=s||r?1:-1}this._isValidCornerMove(c,h)&&(this.x+=c,this.y+=c,this.length+=h)}}else this.x=this._isValidXMove(e)?this.x+e:this.x,this.y=this._isValidYMove(n)?this.y+n:this.y},nearestCorner:function(t,e){var n=Math.abs(t-this.x),o=Math.abs(t-(this.x+this.length)),i=Math.abs(e-this.y),r=Math.abs(e-(this.y+this.length)),s=n+i,a=o+i,c=n+r,h=o+r,l=Math.min(s,a,c,h),u=0;return u=l==s?1:l==a?2:l==c?3:4},setCurrentCorner:function(t,e){this.currentCorner=this.nearestCorner(t,e)},resetCorner:function(){this.currentCorner=0}},e}]),angular.module("ngcrop").directive("cropImage",["CropCanvas","$window",function(t,e){return{restrict:"E",scope:{origImage:"=",croppedImgData:"=",maxImgDisplayLength:"=?",croppedImgFormat:"@?",addCanvasBorder:"@?",selectorColor:"@?",selectorLineWidth:"@?",selectorStartX:"@?",selectorStartY:"@?",selectorStartLength:"@?",startCanvasImgProcessCallback:"&?",postCanvasImgProcessCallback:"&?",postSelectorMoveCallback:"&?"},template:"<canvas></canvas>",link:function(n,o,i){function r(t){n.croppedImgData=t,angular.isDefined(i.postSelectorMoveCallback)&&angular.isFunction(n.postSelectorMoveCallback)&&n.postSelectorMoveCallback({selectorInfo:h.getCropCanvasSelectorInfo()})}function s(t){EXIF.getData(t,function(){var e=EXIF.getTag(t,"Orientation");if(6===e){var o=Math.min(2e3/t.width,2e3/t.height,1),i=document.createElement("canvas"),r=i.getContext("2d"),s=6==e?t.width*o:t.height*o,a=6==e?t.height*o:t.width*o;i.height=s,i.width=a,r.translate(a/2,s/2),r.rotate(.5*Math.PI);var c=-(s/2),l=-(a/2);r.drawImage(t,c,l,s,a);var u=i.toDataURL(),g=new Image;g.onload=function(){h.processNewImage(this,n.selectorStartX,n.selectorStartY,n.selectorStartLength,n.postCanvasImgProcessCallback)},g.src=u}else h.processNewImage(t,n.selectorStartX,n.selectorStartY,n.selectorStartLength,n.postCanvasImgProcessCallback)})}n.selectorColor=angular.isDefined(i.selectorColor)?n.selectorColor:"#ff0000",n.selectorLineWidth=angular.isDefined(i.selectorLineWidth)&&angular.isNumber(Number(n.selectorLineWidth))?Number(n.selectorLineWidth):2,n.croppedImgFormat="image/"+(!angular.isDefined(i.croppedImgFormat)||"jpeg"!=n.croppedImgFormat&&"png"!=n.croppedImgFormat?"png":n.croppedImgFormat);var a=angular.isDefined(i.maxImgDisplayLength)&&angular.isNumber(Number(n.maxImgDisplayLength))?Number(n.maxImgDisplayLength):300,c=o.find("canvas");angular.isDefined(i.addCanvasBorder)&&"true"===n.addCanvasBorder&&c.css({border:"solid 2px #000000"});var h=new t(c,a,n.selectorLineWidth,n.selectorColor,n.croppedImgFormat,r);n.$watch(function(t){return t.origImage},function(t){angular.isDefined(t)&&(angular.isDefined(i.startCanvasImgProcessCallback)&&angular.isFunction(n.startCanvasImgProcessCallback)&&n.startCanvasImgProcessCallback(),s(t))});var l=function(){setTimeout(function(){s(n.origImage)},200)};e.addEventListener("orientationchange",l,!1),n.$on("$destroy",function(){e.removeEventListener("orientationchange",l,!1),h.destroy()})}}}]),angular.module("ngcrop").factory("ResultCanvas",function(){function t(t){this.resultCanvas=document.createElement("canvas"),this.context=this.resultCanvas.getContext("2d"),this.outputImageFormat=t}return t.prototype={getDataUrl:function(t,e,n,o){this.resultCanvas.height=o,this.resultCanvas.width=o;var i=e,r=n,s=0;return this.context.drawImage(t,i,r,o,o,s,s,o,o),this.resultCanvas.toDataURL(this.outputImageFormat)}},t}),function(){function t(t){return!!t.exifdata}function e(t,e){e=e||t.match(/^data\:([^\;]+)\;base64,/im)[1]||"",t=t.replace(/^data\:([^\;]+)\;base64,/gim,"");for(var n=atob(t),o=n.length,i=new ArrayBuffer(o),r=new Uint8Array(i),s=0;o>s;s++)r[s]=n.charCodeAt(s);return i}function o(t,e){var n=new XMLHttpRequest;n.open("GET",t,!0),n.responseType="blob",n.onload=function(){(200==this.status||0===this.status)&&e(this.response)},n.send()}function i(t,n){function i(e){var o=r(e),i=s(e);t.exifdata=o||{},t.iptcdata=i||{},n&&n.call(t)}if(t.src)if(/^data\:/i.test(t.src)){var a=e(t.src);i(a)}else if(/^blob\:/i.test(t.src)){var c=new FileReader;c.onload=function(t){i(t.target.result)},o(t.src,function(t){c.readAsArrayBuffer(t)})}else{var h=new XMLHttpRequest;h.onload=function(){if(200!=this.status&&0!==this.status)throw"Could not load image";i(h.response),h=null},h.open("GET",t.src,!0),h.responseType="arraybuffer",h.send(null)}else if(window.FileReader&&(t instanceof window.Blob||t instanceof window.File)){var c=new FileReader;c.onload=function(t){g&&console.log("Got file of length "+t.target.result.byteLength),i(t.target.result)},c.readAsArrayBuffer(t)}}function r(t){var e=new DataView(t);if(g&&console.log("Got file of length "+t.byteLength),255!=e.getUint8(0)||216!=e.getUint8(1))return g&&console.log("Not a valid JPEG"),!1;for(var n,o=2,i=t.byteLength;i>o;){if(255!=e.getUint8(o))return g&&console.log("Not a valid marker at offset "+o+", found: "+e.getUint8(o)),!1;if(n=e.getUint8(o+1),g&&console.log(n),225==n)return g&&console.log("Found 0xFFE1 marker"),u(e,o+4,e.getUint16(o+2)-2);o+=2+e.getUint16(o+2)}}function s(t){var e=new DataView(t);if(g&&console.log("Got file of length "+t.byteLength),255!=e.getUint8(0)||216!=e.getUint8(1))return g&&console.log("Not a valid JPEG"),!1;for(var n=2,o=t.byteLength,i=function(t,e){return 56===t.getUint8(e)&&66===t.getUint8(e+1)&&73===t.getUint8(e+2)&&77===t.getUint8(e+3)&&4===t.getUint8(e+4)&&4===t.getUint8(e+5)};o>n;){if(i(e,n)){var r=e.getUint8(n+7);r%2!==0&&(r+=1),0===r&&(r=4);var s=n+8+r,c=e.getUint16(n+6+r);return a(t,s,c)}n++}}function a(t,e,n){for(var o,i,r,s,a,c=new DataView(t),h={},u=e;e+n>u;)28===c.getUint8(u)&&2===c.getUint8(u+1)&&(s=c.getUint8(u+2),s in b&&(r=c.getInt16(u+3),a=r+5,i=b[s],o=l(c,u+5,r),h.hasOwnProperty(i)?h[i]instanceof Array?h[i].push(o):h[i]=[h[i],o]:h[i]=o)),u++;return h}function c(t,e,n,o,i){var r,s,a,c=t.getUint16(n,!i),l={};for(a=0;c>a;a++)r=n+12*a+2,s=o[t.getUint16(r,!i)],!s&&g&&console.log("Unknown tag: "+t.getUint16(r,!i)),l[s]=h(t,r,e,n,i);return l}function h(t,e,n,o,i){var r,s,a,c,h,u,g=t.getUint16(e+2,!i),d=t.getUint32(e+4,!i),f=t.getUint32(e+8,!i)+n;switch(g){case 1:case 7:if(1==d)return t.getUint8(e+8,!i);for(r=d>4?f:e+8,s=[],c=0;d>c;c++)s[c]=t.getUint8(r+c);return s;case 2:return r=d>4?f:e+8,l(t,r,d-1);case 3:if(1==d)return t.getUint16(e+8,!i);for(r=d>2?f:e+8,s=[],c=0;d>c;c++)s[c]=t.getUint16(r+2*c,!i);return s;case 4:if(1==d)return t.getUint32(e+8,!i);for(s=[],c=0;d>c;c++)s[c]=t.getUint32(f+4*c,!i);return s;case 5:if(1==d)return h=t.getUint32(f,!i),u=t.getUint32(f+4,!i),a=new Number(h/u),a.numerator=h,a.denominator=u,a;for(s=[],c=0;d>c;c++)h=t.getUint32(f+8*c,!i),u=t.getUint32(f+4+8*c,!i),s[c]=new Number(h/u),s[c].numerator=h,s[c].denominator=u;return s;case 9:if(1==d)return t.getInt32(e+8,!i);for(s=[],c=0;d>c;c++)s[c]=t.getInt32(f+4*c,!i);return s;case 10:if(1==d)return t.getInt32(f,!i)/t.getInt32(f+4,!i);for(s=[],c=0;d>c;c++)s[c]=t.getInt32(f+8*c,!i)/t.getInt32(f+4+8*c,!i);return s}}function l(t,e,o){var i="";for(n=e;e+o>n;n++)i+=String.fromCharCode(t.getUint8(n));return i}function u(t,e){if("Exif"!=l(t,e,4))return g&&console.log("Not valid EXIF data! "+l(t,e,4)),!1;var n,o,i,r,s,a=e+6;if(18761==t.getUint16(a))n=!1;else{if(19789!=t.getUint16(a))return g&&console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)"),!1;n=!0}if(42!=t.getUint16(a+2,!n))return g&&console.log("Not valid TIFF data! (no 0x002A)"),!1;var h=t.getUint32(a+4,!n);if(8>h)return g&&console.log("Not valid TIFF data! (First offset less than 8)",t.getUint32(a+4,!n)),!1;if(o=c(t,a,a+h,p,n),o.ExifIFDPointer){r=c(t,a,a+o.ExifIFDPointer,m,n);for(i in r){switch(i){case"LightSource":case"Flash":case"MeteringMode":case"ExposureProgram":case"SensingMethod":case"SceneCaptureType":case"SceneType":case"CustomRendered":case"WhiteBalance":case"GainControl":case"Contrast":case"Saturation":case"Sharpness":case"SubjectDistanceRange":case"FileSource":r[i]=S[i][r[i]];break;case"ExifVersion":case"FlashpixVersion":r[i]=String.fromCharCode(r[i][0],r[i][1],r[i][2],r[i][3]);break;case"ComponentsConfiguration":r[i]=S.Components[r[i][0]]+S.Components[r[i][1]]+S.Components[r[i][2]]+S.Components[r[i][3]]}o[i]=r[i]}}if(o.GPSInfoIFDPointer){s=c(t,a,a+o.GPSInfoIFDPointer,v,n);for(i in s){switch(i){case"GPSVersionID":s[i]=s[i][0]+"."+s[i][1]+"."+s[i][2]+"."+s[i][3]}o[i]=s[i]}}return o}var g=!1,d=this,f=function(t){return t instanceof f?t:this instanceof f?void(this.EXIFwrapped=t):new f(t)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=f),exports.EXIF=f):d.EXIF=f;var m=f.Tags={36864:"ExifVersion",40960:"FlashpixVersion",40961:"ColorSpace",40962:"PixelXDimension",40963:"PixelYDimension",37121:"ComponentsConfiguration",37122:"CompressedBitsPerPixel",37500:"MakerNote",37510:"UserComment",40964:"RelatedSoundFile",36867:"DateTimeOriginal",36868:"DateTimeDigitized",37520:"SubsecTime",37521:"SubsecTimeOriginal",37522:"SubsecTimeDigitized",33434:"ExposureTime",33437:"FNumber",34850:"ExposureProgram",34852:"SpectralSensitivity",34855:"ISOSpeedRatings",34856:"OECF",37377:"ShutterSpeedValue",37378:"ApertureValue",37379:"BrightnessValue",37380:"ExposureBias",37381:"MaxApertureValue",37382:"SubjectDistance",37383:"MeteringMode",37384:"LightSource",37385:"Flash",37396:"SubjectArea",37386:"FocalLength",41483:"FlashEnergy",41484:"SpatialFrequencyResponse",41486:"FocalPlaneXResolution",41487:"FocalPlaneYResolution",41488:"FocalPlaneResolutionUnit",41492:"SubjectLocation",41493:"ExposureIndex",41495:"SensingMethod",41728:"FileSource",41729:"SceneType",41730:"CFAPattern",41985:"CustomRendered",41986:"ExposureMode",41987:"WhiteBalance",41988:"DigitalZoomRation",41989:"FocalLengthIn35mmFilm",41990:"SceneCaptureType",41991:"GainControl",41992:"Contrast",41993:"Saturation",41994:"Sharpness",41995:"DeviceSettingDescription",41996:"SubjectDistanceRange",40965:"InteroperabilityIFDPointer",42016:"ImageUniqueID"},p=f.TiffTags={256:"ImageWidth",257:"ImageHeight",34665:"ExifIFDPointer",34853:"GPSInfoIFDPointer",40965:"InteroperabilityIFDPointer",258:"BitsPerSample",259:"Compression",262:"PhotometricInterpretation",274:"Orientation",277:"SamplesPerPixel",284:"PlanarConfiguration",530:"YCbCrSubSampling",531:"YCbCrPositioning",282:"XResolution",283:"YResolution",296:"ResolutionUnit",273:"StripOffsets",278:"RowsPerStrip",279:"StripByteCounts",513:"JPEGInterchangeFormat",514:"JPEGInterchangeFormatLength",301:"TransferFunction",318:"WhitePoint",319:"PrimaryChromaticities",529:"YCbCrCoefficients",532:"ReferenceBlackWhite",306:"DateTime",270:"ImageDescription",271:"Make",272:"Model",305:"Software",315:"Artist",33432:"Copyright"},v=f.GPSTags={0:"GPSVersionID",1:"GPSLatitudeRef",2:"GPSLatitude",3:"GPSLongitudeRef",4:"GPSLongitude",5:"GPSAltitudeRef",6:"GPSAltitude",7:"GPSTimeStamp",8:"GPSSatellites",9:"GPSStatus",10:"GPSMeasureMode",11:"GPSDOP",12:"GPSSpeedRef",13:"GPSSpeed",14:"GPSTrackRef",15:"GPSTrack",16:"GPSImgDirectionRef",17:"GPSImgDirection",18:"GPSMapDatum",19:"GPSDestLatitudeRef",20:"GPSDestLatitude",21:"GPSDestLongitudeRef",22:"GPSDestLongitude",23:"GPSDestBearingRef",24:"GPSDestBearing",25:"GPSDestDistanceRef",26:"GPSDestDistance",27:"GPSProcessingMethod",28:"GPSAreaInformation",29:"GPSDateStamp",30:"GPSDifferential"},S=f.StringValues={ExposureProgram:{0:"Not defined",1:"Manual",2:"Normal program",3:"Aperture priority",4:"Shutter priority",5:"Creative program",6:"Action program",7:"Portrait mode",8:"Landscape mode"},MeteringMode:{0:"Unknown",1:"Average",2:"CenterWeightedAverage",3:"Spot",4:"MultiSpot",5:"Pattern",6:"Partial",255:"Other"},LightSource:{0:"Unknown",1:"Daylight",2:"Fluorescent",3:"Tungsten (incandescent light)",4:"Flash",9:"Fine weather",10:"Cloudy weather",11:"Shade",12:"Daylight fluorescent (D 5700 - 7100K)",13:"Day white fluorescent (N 4600 - 5400K)",14:"Cool white fluorescent (W 3900 - 4500K)",15:"White fluorescent (WW 3200 - 3700K)",17:"Standard light A",18:"Standard light B",19:"Standard light C",20:"D55",21:"D65",22:"D75",23:"D50",24:"ISO studio tungsten",255:"Other"},Flash:{0:"Flash did not fire",1:"Flash fired",5:"Strobe return light not detected",7:"Strobe return light detected",9:"Flash fired, compulsory flash mode",13:"Flash fired, compulsory flash mode, return light not detected",15:"Flash fired, compulsory flash mode, return light detected",16:"Flash did not fire, compulsory flash mode",24:"Flash did not fire, auto mode",25:"Flash fired, auto mode",29:"Flash fired, auto mode, return light not detected",31:"Flash fired, auto mode, return light detected",32:"No flash function",65:"Flash fired, red-eye reduction mode",69:"Flash fired, red-eye reduction mode, return light not detected",71:"Flash fired, red-eye reduction mode, return light detected",73:"Flash fired, compulsory flash mode, red-eye reduction mode",77:"Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",79:"Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",89:"Flash fired, auto mode, red-eye reduction mode",93:"Flash fired, auto mode, return light not detected, red-eye reduction mode",95:"Flash fired, auto mode, return light detected, red-eye reduction mode"},SensingMethod:{1:"Not defined",2:"One-chip color area sensor",3:"Two-chip color area sensor",4:"Three-chip color area sensor",5:"Color sequential area sensor",7:"Trilinear sensor",8:"Color sequential linear sensor"},SceneCaptureType:{0:"Standard",1:"Landscape",2:"Portrait",3:"Night scene"},SceneType:{1:"Directly photographed"},CustomRendered:{0:"Normal process",1:"Custom process"},WhiteBalance:{0:"Auto white balance",1:"Manual white balance"},GainControl:{0:"None",1:"Low gain up",2:"High gain up",3:"Low gain down",4:"High gain down"},Contrast:{0:"Normal",1:"Soft",2:"Hard"},Saturation:{0:"Normal",1:"Low saturation",2:"High saturation"},Sharpness:{0:"Normal",1:"Soft",2:"Hard"},SubjectDistanceRange:{0:"Unknown",1:"Macro",2:"Close view",3:"Distant view"},FileSource:{3:"DSC"},Components:{0:"",1:"Y",2:"Cb",3:"Cr",4:"R",5:"G",6:"B"}},b={120:"caption",110:"credit",25:"keywords",55:"dateCreated",80:"byline",85:"bylineTitle",122:"captionWriter",105:"headline",116:"copyright",15:"category"};f.getData=function(e,n){return(e instanceof Image||e instanceof HTMLImageElement)&&!e.complete?!1:(t(e)?n&&n.call(e):i(e,n),!0)},f.getTag=function(e,n){return t(e)?e.exifdata[n]:void 0},f.getAllTags=function(e){if(!t(e))return{};var n,o=e.exifdata,i={};for(n in o)o.hasOwnProperty(n)&&(i[n]=o[n]);return i},f.pretty=function(e){if(!t(e))return"";var n,o=e.exifdata,i="";for(n in o)o.hasOwnProperty(n)&&(i+="object"==typeof o[n]?o[n]instanceof Number?n+" : "+o[n]+" ["+o[n].numerator+"/"+o[n].denominator+"]\r\n":n+" : ["+o[n].length+" values]\r\n":n+" : "+o[n]+"\r\n");return i},f.readFromBinaryFile=function(t){return r(t)},"function"==typeof define&&define.amd&&define("exif-js",[],function(){return f})}.call(this);