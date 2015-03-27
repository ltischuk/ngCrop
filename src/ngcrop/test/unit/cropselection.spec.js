/**
 * Created by ltischuk on 2/15/15.
 */
'use strict';
describe('Factory: CropSelection', function() {

  var CropSelection;
  var cropSelector;

  beforeEach(module('ngcrop'));

  beforeEach(inject(function (_CropSelection_) {

    CropSelection = _CropSelection_;

  }));

  it("should instantiate a crop selection", function() {

    //Setup initialized data prior to cases

    cropSelector = new CropSelection(200);
    //ensure that crop selection is only
    expect(cropSelector.length).toEqual(0);

  });

  it("should set dimensions of crop selection to image", function() {

    //Setup initialized data prior to cases

   // var img = new Image();
   // img.width = 400;
   // img.height = 600;
   // cropSelector = new CropSelection(200);
   // cropSelector.initSelectorDimensions(img);
   // expect(cropSelector.ratio).toEqual(200/600);


  });


});
