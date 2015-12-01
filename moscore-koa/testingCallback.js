'use strict';
var tickers = {
	"tickers":[
	{ "ticker": "TEST", "name": "" }
	]
};



function getStocks() {
	//DEBUGGING: if (__stocks != null) return __stocks;

	var __stocks = [];
	for (var val of loadStocks()) {
		console.log(val);
		__stocks.push(val);
	}
	//console.log(__stocks.length);
	return __stocks;
}
function* loadStocks() {
	// tickers.forEach((ticker, index, array) => {
	// 	yield momentum_score.calculateScore(ticker, (ticker, score, deltas) => {
	// 		return { ticker: ticker, score: score };
	// 	});
	// });
	for (var i = 0; i < tickers.length; i++) {
		var ticker = tickers[i].ticker;
		//let lastValue = yield genify(moscoreWrapper())(ticker);
		let lastValue = yield moscoreWrapperAsync(ticker)();
	}

	// console.log(tickers);

	// yield thunkify(moscoreWrapper(tickers));
	// console.log("hi");
}




//### wrapper try 2:
/*!
 * thunkify-wrap - lib/thunkify.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

var slice = Array.prototype.slice;

/**
 * Wrap a regular callback `fn` as a thunk.
 *
 * @param {Function} fn
 * @param {Object} [ctx]
 * @return {Function}
 */

function thunkify(fn, ctx) {
    if (!fn) {
      return fn;
    }

  if (isGeneratorFunction(fn)) {
    return fn;
  }

  if (fn.toString() === thunk.toString()) {
    return fn;
  }
  function thunk() {
    var args = slice.call(arguments);
    var results;
    var called;
    var cb;

    args.push(function () {
      results = arguments;

      if (cb && !called) {
        called = true;
        cb.apply(this, results);
      }
    });

    fn.apply(ctx || this, args);

    return function (fn) {
      cb = fn;

      if (results && !called) {
        called = true;
        fn.apply(ctx || this, results);
      }
    };
  }
  return thunk;
}

function isGeneratorFunction(fn) {
  return typeof fn === 'function' && fn.constructor.name === 'GeneratorFunction';
}
//----
/**
 * create a generator function warp
 * so you can use yield* every where
 *
 * @return {[type]} [description]
 */
function genify(fn, ctx) {
  if (isGeneratorFunction(fn)) {
    return fn;
  }

  function* genify() {
    var thunk = thunkify(fn);
    return yield thunk.apply(ctx || this, arguments);
  }
  return genify;
};
//END THUNKIFY





var moscoreWrapperAsync = function* (ticker) {
	//const caller = yield;
	console.log("THIS: " + this);
	var generator = this;
	return function () {
		//so ticker is part of this generated function
		// and the callback is nodeJS form: function(err, result)
		console.log("calculating ticker: " + ticker);
		testFunc(ticker, (ticker, score, deltas) => {
			console.log("sending data to callback");
			generator.next({ ticker: ticker, score: score, deltas: deltas })
		});
	}
}





var testFunc = function (ticker, cb) {
  setTimeout(function(){
    cb(ticker, 0.12, []);
  }, 5);
};



// console.log("RESULTS");
// console.log(getStocks());

//console.log(loadStocks().next());
//console.log(new moscoreWrapperAsync("TEST").next());
//console.log(new moscoreWrapperAsync("TEST").next().value());

var moscoreGen = new moscoreWrapperAsync("TEST");
var one = moscoreGen.next();
console.log(one);
console.log(one.value());
var two = moscoreGen.next();
console.log(two);

  setTimeout(function(){
    var two = moscoreGen.next();
	  console.log(two);
  }, 15);
