'use strict';
var momentum_score = require('./momentum_score');

// ### momentum_score documentation! ###
momentum_score.debugging = true;
//Also can do: momentum_score.rawResponseEVENT = function (body) { console.log(body); };
//momentum_score.calculateScore("AAPL", (ticker, score, deltas) => console.log("Results for " + ticker + ": " + score));

var tickers = [
// "MDBYX",
// "FRSTX",
// "OOSYX",
// "PARIX",
// "PARGX",
// "PARAX",
// "PARHX",
// "PARBX",
// "PARJX",
// "PARCX",
// "PARKX",
// "PARDX",
// "PARLX",
// "PARFX",
// "PAROX",
// "ACSTX",
// "MIEYX",
// "PSPAX",
// "MAGYX",
// "CSIEX",
// "WFMDX",
// "ARGFX",
"NTIAX",
// "WFDAX",
// "PSOAX",
// "DLBMX",
// "NMSAX",
// "FSSAX",
// "MINGX",
// "MKRYX",
// "RERCX",
// "MYIEX",
// "RNWEX",
// "OREYX",
// "MMUHX",
// "PCRAX"
];

//Lets just try to spam these requests, cause why not...
var TIMEOUT = 300;
var allResults = [];
var outputTimout = null;
var startTime = new Date();
tickers.forEach((ticker, index, array) => {
	momentum_score.calculateScore(ticker, (ticker, score, deltas) => {
		allResults.push({ ticker: ticker, score: score });

		clearTimeout(outputTimout);
		outputTimout = setTimeout(outputResults, TIMEOUT);
	});
});
	// momentum_score.calculateScore("PARGX", (ticker, score, deltas) => {
	// 	allResults.push({ ticker: ticker, score: score });

	// 	clearTimeout(outputTimout);
	// 	setTimeout(outputResults, 500);
	// });
	// momentum_score.calculateScore("DLBMX", (ticker, score, deltas) => {
	// 	allResults.push({ ticker: ticker, score: score });

	// 	clearTimeout(outputTimout);
	// 	setTimeout(outputResults, 500);
	// });

function outputResults() {
	allResults.sort((a, b) => b.score - a.score);
	console.log(allResults);
	console.log("Time taken: " + (new Date().getTime() - startTime.getTime() - TIMEOUT) + "ms (timeout excluded)");
}
