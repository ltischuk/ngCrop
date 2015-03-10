/**
 * Created by ltischuk on 2/15/15.
 */
/**
 * Created by ltischuk on 9/27/14.
 */
'use strict';
describe('Factory: CropSelection', function() {

  var CropSelection;

  beforeEach(module('ngcrop'));

  beforeEach(inject(function (_CropSelection_) {

    CropSelection = _CropSelection_;

  }));

  it("should instantiate a crop selection", function() {
    //Setup initialized data prior to cases

    var cropSelector = new CropSelection();
    //ensure that only uniquely named stepped views can be added and name must be a string
    expect(cropSelector.length).toEqual(0);

  });


});
