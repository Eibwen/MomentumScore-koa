'use strict';
var http = require('http');
var csv = require("fast-csv");

// var REPORT_PERIODS = {
// 	Daily: { momentumPeriodDataPoints: 30, rangeTypeChar: 'd' },
// 	Monthly: { momentumPeriodDataPoints: 1, rangeTypeChar: 'm' },
// 	Yearly: { momentumPeriodDataPoints: 1, rangeTypeChar: 'y' }
// }

var momentumPeriodDays = 30;
/**
 * Most recent first, weight of each segment, the length of this array determines the segments
 */
var momentumWeighting = [2, 1, 0.5];

var urlTemplate = "http://real-chart.finance.yahoo.com/table.csv?s={ticker}&d={toMonth_zeroBased}&e={toDay}&f={toYear}&g={rangeType}&a={fromMonth_zeroBased}&b={fromDay}&c={fromYear}&ignore=.csv";
// http://real-chart.finance.yahoo.com/table.csv?s=%5EIXIC&a=01&b=5&c=1971&d=10&e=24&f=2015&g=m&ignore=.csv
// http://real-chart.finance.yahoo.com/table.csv?s=MMKSX&d=10&e=24&f=2015&g=d&a=3&b=1&c=2010&ignore=.csv



//console.log(generateUrl("AAPL"));
//calculateScore("AAPL");

exports.debugging = false;
//TODO make this an event...
exports.rawResponseEVENT = null;


function isDebug() { return exports.debugging; };
function logIfDebug(msg) {
	if (isDebug()) console.log(msg);
};

//Exported functions:
exports.calculateScore = function(ticker, momentumScoreCallback) {
	// http.get(generateUrl(ticker), res => {

 //    var body = '';
 //    res.on('data', function(d) {
 //        body += d;
 //    });
 //    res.on('end', function() {
 //    	console.log(body);
 //    });

	// }).on('error', function(e) {
	// 	console.log("Jake broke soething: " + e.message);
	// });
	var url = generateUrl(ticker);
	logIfDebug(url);
	http.get(url, res => {

		var rawResponse = '';

		var meanCalculator = new meanBuilder(momentumPeriodDays);

		var csvStream = csv
			.parse({headers: true})
			.on("data", function(data){
				//console.log(data);
				meanCalculator.addDataPoint(data);
			})
			.on("end", function(){

				if (exports.rawResponseEVENT) exports.rawResponseEVENT(rawResponse);

				//console.log("done");
				var means = meanCalculator.getAverages();
				logIfDebug("===== AVERAGES =====");
				logIfDebug(JSON.stringify(means, null, 2));

				logIfDebug("===== Deltas =====");
				//NOTE this is NOT allowing jagged data...
				var valuesToUse = means.map(x => x.dataAveraged['Adj Close'].count == momentumPeriodDays
									? x.dataAveraged['Adj Close']
									: null);
				valuesToUse = valuesToUse.filter(x => x != null);
				logIfDebug(valuesToUse);
				if (valuesToUse.length - 1 != momentumWeighting.length) {

					//console.log("ERROR WITH VALUES: means=");
					//console.log(means);
					console.log("ERROR WITH VALUES: valuesToUse=");
					console.log(valuesToUse);

					throw "Didn't get all data from all the buckets we wanted";
				}
				var deltas = [];
				var deltaPercents = [];
				var deltaObjs = [];
				for (var i = 1; i < valuesToUse.length; i++) {
					// // i is OLDER, (i-1) is NEWER... still not sure if this is the correct subtraction...
					// var growth = valuesToUse[i].average - valuesToUse[i-1].average;
					// deltas.push(growth);
					// deltaPercents.push(growth / valuesToUse[i].average);

					// i is OLDER, (i-1) is NEWER... still not sure if this is the correct subtraction...
					// Difference from MOST_RECENT, to BUCKET[i]
					var growth = valuesToUse[i].average - valuesToUse[0].average;
					deltas.push(growth);
					deltaPercents.push(growth / valuesToUse[i].average);

					var growthInPeriod = valuesToUse[i].average - valuesToUse[i-1].average;
					deltaObjs.push({
						startDaysAgo:i * momentumPeriodDays,
						daysInTimeperiod:momentumPeriodDays,
						growthInTimeperiod: growthInPeriod,
						growthInTimeperiodPct: growthInPeriod / valuesToUse[i].average,
						growthFromDateToNow: growth,
						growthFromDateToNowPct: growth / valuesToUse[i].average, //USE THIS FOR MOSCORE

						newestPeriodClose: valuesToUse[0].average,
						thisPeriodClose: valuesToUse[i].average
					});
				};

				logIfDebug("===== MOMENTUM OUTPUT =====");

				//TODO:
				// * Build averages in to (momentumWeighting.length + 1) buckets of (momentumPeriodDays) values
				// * Calculate deltas
				var score = momentumScore(deltaPercents);
				logIfDebug(score);

				//deltas object


				momentumScoreCallback(ticker, score, deltaObjs);
			});
		res
			.on("data", function(data){
					//console.log(''+data);
					if (exports.rawResponseEVENT) rawResponse += data;
				})
			.pipe(csvStream);

	}).on('error', function(e) {
		console.log("Jake broke soething: " + e.message);
	});
}


// HELPERS:

//VERY GENERIC FUNCTION, I LIKE THIS ONE...
function meanBuilder(datapointsPerPeriod) {
	this.datapointsPerPeriod = datapointsPerPeriod;
	this.averageStorage = [];

	this.addDataPoint = function(datapoint) {
		var storage;
		if (this.averageStorage.length > 0 && this.averageStorage[this.averageStorage.length-1].count < this.datapointsPerPeriod) {
			//Use existing bucket
			storage = this.averageStorage[this.averageStorage.length-1];
		} else {
			storage = { count: 0, dataAveraged: {} };
			this.averageStorage.push(storage);
		}

		//Get average for any datatype that has a value
		//  TODO do i support jagged data??? -- yes I'm bored.
		Object.keys(datapoint).forEach(key => {
			var curValue = datapoint[key];
			var curFloat = parseFloat(curValue);

			// console.log(typeof(curValue));
			// console.log(typeof(curFloat));
			// console.log(curValue);
			// console.log(curFloat);
			// console.log(curValue == curFloat);
			// console.log("-");

			//Was parsed into a float, and is the full string (curFloat.toString() implied)
			if (!isNaN(curFloat) && curValue == curFloat) {
				//var currentObj = storage.dataAveraged[key];
				//var existingValue = currentObj ? currentObj.average : 0;
				// This count is a count of this specific key, allowing for jagged data
				//var existingCount = currentObj ? currentObj.count : 0;
				storage.dataAveraged[key] = storage.dataAveraged[key] || {};
				storage.dataAveraged[key].average = storage.dataAveraged[key].average || 0;
				var existingValue = storage.dataAveraged[key].average;
				storage.dataAveraged[key].count = storage.dataAveraged[key].count || 0;

				//# Iterative Mean:
				//dataAveraged[key].average += (curValue - existingValue) / existingCount;
				//existingValue += (value - existingValue) / ++existingCount;
				storage.dataAveraged[key].average += (curFloat - existingValue) / ++storage.dataAveraged[key].count;
			} else {
				//Gross, but ensures objects exist
				storage.identifiers = storage.identifiers || {};
				storage.identifiers[key] = storage.identifiers[key] || [];
				storage.identifiers[key].push(curValue);
			}
		});

		//This count is a count of overall rows
		storage.count++;
	};
	this.getAverages = function() {
		return this.averageStorage;
	};
}
//ES6 version... Babel helped me remember how to javascript OOP:
// class meanBuilder {
// 	constructor(datapointsPerPeriod) {
// 		this.datapointsPerPeriod = datapointsPerPeriod;
// 		this.averageStorage = [];
// 	}

// 	addDataPoint(datapoint) {
// 		var storage;
// 		if (this.averageStorage.length > 0 && this.averageStorage[this.averageStorage.length-1].count < this.datapointsPerPeriod) {
// 			//Use existing bucket
// 			storage = this.averageStorage[this.averageStorage.length-1];
// 		} else {
// 			storage = { count: 0, dataAveraged: {} };
// 			this.averageStorage.push(storage);
// 		}

// 		//Get average for any datatype that has a value
// 		//  TODO do i support jagged data??? -- yes I'm bored.
// 		Object.keys(datapoint).forEach(key => {
// 			var curValue = datapoint[key];
// 			var curFloat = parseFloat(curValue);

// 			// console.log(typeof(curValue));
// 			// console.log(typeof(curFloat));
// 			// console.log(curValue);
// 			// console.log(curFloat);
// 			// console.log(curValue == curFloat);
// 			// console.log("-");

// 			//Was parsed into a float, and is the full string (curFloat.toString() implied)
// 			if (!isNaN(curFloat) && curValue == curFloat) {
// 				//var currentObj = storage.dataAveraged[key];
// 				//var existingValue = currentObj ? currentObj.average : 0;
// 				// This count is a count of this specific key, allowing for jagged data
// 				//var existingCount = currentObj ? currentObj.count : 0;
// 				storage.dataAveraged[key] = storage.dataAveraged[key] || {};
// 				storage.dataAveraged[key].average = storage.dataAveraged[key].average || 0;
// 				var existingValue = storage.dataAveraged[key].average;
// 				storage.dataAveraged[key].count = storage.dataAveraged[key].count || 0;

// 				//# Iterative Mean:
// 				//dataAveraged[key].average += (curValue - existingValue) / existingCount;
// 				//existingValue += (value - existingValue) / ++existingCount;
// 				storage.dataAveraged[key].average += (curFloat - existingValue) / ++storage.dataAveraged[key].count;
// 			} else {
// 				//Gross, but ensures objects exist
// 				storage.identifiers = storage.identifiers || {};
// 				storage.identifiers[key] = storage.identifiers[key] || [];
// 				storage.identifiers[key].push(curValue);
// 			}
// 		});

// 		//This count is a count of overall rows
// 		storage.count++;
// 	}

// 	getAverages() {
// 		return this.averageStorage;
// 	}
// }



function momentumScore(momentumValues) {
	if (momentumValues.length != momentumWeighting.length)
		throw "Jake sucks";

	var momentumScore = 0;
	for (var i = 0; i < momentumValues.length; i++) {
		var value = momentumValues[i];
		var weight = momentumWeighting[i];

		momentumScore += value * weight;
	};

	return momentumScore;
}



function generateUrl(ticker) {

	var toDate = new Date();
	var fromDate = new Date();

	// Add 1 to the length, since we are going to work in percentages, so need -1 to base 0 on.
	var daysRange = ((momentumWeighting.length + 1) * momentumPeriodDays);
	//Want 90 days worth of 'trading' so weekdays... so
	daysRange *= (7/5);
	//Add another week for the hell of it?
	daysRange += 5;
	fromDate.setUTCDate(fromDate.getUTCDate() - daysRange)
	//console.log("Days back: " + daysRange);

	return fancyReplace(urlTemplate, {
		ticker: ticker,
		rangeType: "d",
		fromYear: fromDate.getUTCFullYear(),
		fromMonth_zeroBased: fromDate.getUTCMonth(),
		fromDay: fromDate.getUTCDate(),
		toYear: toDate.getUTCFullYear(),
		toMonth_zeroBased: toDate.getUTCMonth(),
		toDay: toDate.getUTCDate()
	});
}


function fancyReplace(source, input) {
	Object.keys(input).forEach(key => {
		source = source.replace("{" + key + "}", input[key]);
	});
	return source;
}
