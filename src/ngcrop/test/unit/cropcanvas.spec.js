/**
 * Created by ltischuk on 2/15/15.
 */
'use strict';
describe('Directive: CropCanvas', function() {

  var CropCanvas;
    var $compile;
    var $rootScope;
    var testImg = new Image();
    var resultFunction = function(){
      return true;
    }

  beforeEach(module('ngcrop'));

  beforeEach(inject(function ( _CropCanvas_, _$compile_, _$rootScope_) {

    CropCanvas = _CropCanvas_;
    $compile = _$compile_;
    $rootScope = _$rootScope_;


  }));

  beforeEach(function(done){

    testImg.onload = function(){

      done();
    }
    testImg.src = 'base/sample/testimage.jpeg';

  });

  it('Should process a new image on a cropcanvas', function() {
    // Compile a piece of HTML containing the directive
    var element = $compile('<crop-image orig-image="testImg"></crop-image>')($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();
    // Check that the compiled element contains the templated content
    var canvasElem = element.find('canvas');
    var maxLength = 300;
    var cropCanvas = new CropCanvas(canvasElem, maxLength,2,"#000000","image/jpeg" );
    spyOn(cropCanvas, "getCroppedImageData");
    cropCanvas.processNewImage(testImg,resultFunction);
    expect(cropCanvas.getCroppedImageData).toHaveBeenCalled();


  });


});
