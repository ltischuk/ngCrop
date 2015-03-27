/**
 * Created by ltischuk on 2/15/15.
 */
'use strict';
describe('Directive: CropImage', function() {

  var CropCanvas;
    var $compile;
    var $rootScope;
    var testImg = new Image();

  beforeEach(module('ngcrop'));

  beforeEach(inject(function ( _CropCanvas_, _$compile_, _$rootScope_) {

    CropCanvas = _CropCanvas_;
      $compile = _$compile_;
      $rootScope = _$rootScope_;


  }));

  it('Replaces the element with an HTML5 canvas', function() {
    // Compile a piece of HTML containing the directive
    var element = $compile('<crop-image orig-image="testImg"></crop-image>')($rootScope);
    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();
    // Check that the compiled element contains the templated content
    expect(element.find('canvas').length).toEqual(1);

  });


});
