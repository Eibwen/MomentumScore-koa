var swig = require('swig');

swig.setFilter('percent', function (input) {
  var original = input;
  //return Math.round(original*100*100)/100 + "%";
  return (original*100).toFixed(2) + " %";
});

swig.setFilter('colorize', function (input, minValue, maxValue) {
    var colorSegments = ['#762a83', '#af8dc3', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#7fbf7b', '#1b7837']; //a-la http://colorbrewer2.org/
    //Example [red, grey, black]
    //Range: 6
    // [0,1,2 : 2,3,4 : 4,5,6]
    // segmentSize = 2
    //Math.round(value/segmentSize)

    var range = maxValue - minValue;
    var segmentSize = range/colorSegments.length;

    var colorIndex = Math.round((input - minValue) / segmentSize);
    if (colorIndex >= colorSegments.length)
        colorIndex = colorSegments.length-1;

    return colorSegments[colorIndex];
});

