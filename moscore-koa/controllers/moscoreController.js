'use strict';
var views = require('co-views');
var parse = require('co-body');

//Load my custom extensions
var custom = require('../extensions/swigCustomFilters.js');

var momentum_score = require('../../momentum_score.js');
var tickers = require('../../tickers.json').tickers;



var __stocks = null;
// function getStocks() {
//	
// }
function getStocks(callback) {
	if (__stocks != null){
		console.log("Return from cached");
		return __stocks;
	}

	var tickerPromises = [];
	for (var val of buildTickerPromises()) {
		tickerPromises.push(val);
	}
	//console.log(__stocks.length);
	return Promise.all(tickerPromises)
		.then((values) => __stocks = values);
	//	.then((values) => callback(/* error: */ null, __stocks));
}
function* buildTickerPromises() {
	for (var i = 0; i < tickers.length; i++) {
		var ticker = tickers[i].ticker;
		var tickerName = tickers[i].name;
		yield moscoreWrapperPromise(ticker, tickerName);
	}
}



var moscoreWrapperPromise = function (ticker, tickerName) {
	return new Promise((resolve, reject) => {
		momentum_score.calculateScore(ticker, (ticker, score, deltas) => {
			//console.log("sending data to callback");
			resolve({ ticker: ticker, name: tickerName, score: score,
                deltas: processDeltaObjects(deltas)
            })
		});
	});
}

var processDeltaObjects = (deltas) => {
    //Select percent going into the output
    //Reverse to show newest on the right
    return deltas.map(x => x.growthInTimeperiodPct).reverse();
};





var render = views(__dirname + '/../views', {
  map: { html: 'swig' }
});

module.exports.home = function *home() {

	var stocks = yield Promise.resolve(getStocks());
	stocks.sort((a, b) => b.score - a.score);

	//console.log("PROCESSING");
	//console.log(stocks);

	//console.log(Object.keys(stocks[0]));
	//var columnLabels = ["Ticker", "Score", "Spark Line", "Name"];
  
	this.body = yield render('moscore', {
		'stocks': stocks,
		//'stockFields': columnLabels,
        'maxScore': stocks[0].score,
        'minScore': stocks[stocks.length-1].score
	});
};

