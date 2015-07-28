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

  it("should recognize correct corner given a point", function() {

    //Setup initialized data prior to cases
    cropSelector = new CropSelection();
    cropSelector.initSelectorDimensions(200,300);

    //top left
    expect(cropSelector.nearestCorner(51,52)).toEqual(1);

    //top right
    expect(cropSelector.nearestCorner(190,52)).toEqual(2);

    //bottom left
    expect(cropSelector.nearestCorner(10,190)).toEqual(3);

    //bottom right
    expect(cropSelector.nearestCorner(190,190)).toEqual(4);
  });

  it("should initialize the starting selector x, y and length", function() {

    //Setup initialized data prior to cases
    cropSelector = new CropSelection();
    cropSelector.initSelectorDimensions(200,300,10,10,100);

    //top left
    expect(cropSelector.x).toEqual(10);

    //top right
    expect(cropSelector.y).toEqual(10);

    //bottom left
    expect(cropSelector.length).toEqual(100);

  });

  it("should initialize the x, y and length to the middle of the canvas", function() {

    //Setup initialized data prior to cases
    cropSelector = new CropSelection();
    cropSelector.initSelectorDimensions(200,300);

    //top left
    expect(cropSelector.x).toEqual(49);

    //top right
    expect(cropSelector.y).toEqual(50);

    //bottom left
    expect(cropSelector.length).toEqual(100);

  });


});
