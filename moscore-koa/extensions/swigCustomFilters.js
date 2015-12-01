var swig = require('swig');

swig.setFilter('percent', function (input, idx) {
  var original = input;
  return Math.round(original*100*100)/100 + "%";
});
