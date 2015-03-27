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

    cropSelector = new CropSelection();
    //ensure that crop selection is only
    expect(cropSelector.length).toEqual(0);

  });

  it("should set initial dimensions of crop selection to parent width and height", function() {

    //Setup initialized data prior to cases
    cropSelector = new CropSelection();
    cropSelector.initSelectorDimensions(200,300);
    expect(cropSelector.x).toEqual(49);
    expect(cropSelector.y).toEqual(50);
    expect(cropSelector.length).toEqual(100);


  });


});
