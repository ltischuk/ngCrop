/**
 * Created by ltischuk on 2/15/15.
 */
'use strict';
describe('Directive: CropImage', function() {

  var CropCanvas;
    var $compile;
    var scope;
    var testImg = new Image();

  beforeEach(module('ngcrop'));

  beforeEach(inject(function ( _CropCanvas_, _$compile_, $rootScope) {

    CropCanvas = _CropCanvas_;
    $compile = _$compile_;
    scope = $rootScope.$new();


  }));

  it('Replaces the element with an HTML5 canvas', function() {
    // Compile a piece of HTML containing the directive
    var element = $compile('<crop-image orig-image="testImg"></crop-image>')(scope);
    // fire digest
    scope.$digest();
    // Check that the compiled element contains the templated content
    expect(element.find('canvas').length).toEqual(1);

  });

  it('Should have isolate scope properties set to default values if not present in attributes', function() {
    // Compile a piece of HTML containing the directive
    var element = $compile('<crop-image orig-image="testImg"></crop-image>')(scope);

    var isolateScope = element.isolateScope();
    expect(isolateScope.croppedImgFormat).toEqual('image/png');
    expect(isolateScope.selectorColor).toEqual('#ff0000');
    expect(isolateScope.selectorLineWidth).toEqual(2);
    expect(isolateScope.selectorLineWidth).toEqual(2);
    expect(isolateScope.selectorLineWidth).toEqual(2);
    expect(isolateScope.selectorStartX).toBe(undefined);
    expect(isolateScope.selectorStartY).toBe(undefined);
    expect(isolateScope.selectorStartLength).toBe(undefined);

  });


});
