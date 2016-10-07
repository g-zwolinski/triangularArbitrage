//obsluga gield
var util = require('util');
var index = require('./../index.js');
//bleutrade
var BleutradeAPI = require('bleutrade-api');
var bleutrade = new BleutradeAPI("6f3a89dd337958a9f59401a2671d210e", "cf917eb6da048d2403a44c41ba546bfa");
/* 
bleutrade.getmarketsummaries(function(err, summaries) {
	if(err) return;
 
	if(summaries.success) {
		summaries.result.forEach(function(market) {
			console.log(util.format("%s: %d Low %d High %d Volume", market.MarketName, market.Low, market.High, market.Volume));
		})
	}
});
*/
//poloniex
var Poloniex = require('poloniex.js'),
    // When using as an NPM module, use `require('poloniex.js')`

    // Create a new instance, with optional API key and secret
    poloniex = new Poloniex(
        // 'API_KEY',
        "UY49UGTD-YOKLTA9D-5JSNJQO0-ELNZX6RI"
        // 'API_SECRET'
    );


// * IMPORTANT *
// The line below is temporary, to avoid API server certficiate failure `Error: CERT_UNTRUSTED`
// This is presumably a temporary issue and has been reported to Poloniex.
// Do not include the line below once the issue is resolved.
//Poloniex.STRICT_SSL = false;


// Public call
/*
poloniex.getTicker(function(err, data){
    if (err){
        console.log('ERROR', err);
        return;
    }

    console.log(data);
});

*/
// Private call - requires API key and secret
/*
poloniex.buy('VTC', 'BTC', 0.1, 100, function(err, data){
    if (err){
        console.log('ERROR', err);
        return;
    }
    console.log(data);
});
*/
exports.getOneBalance = (gielda, waluta) => {
	switch (gielda){
	case "bleutrade": 
		bleutrade.getbalance(waluta, function(err, balance) {
			if(err) return;

			if(balance.success) {
				index.zrobCosZWynikami("getOneBalance", gielda, ({waluta: waluta, balans: balance.result.Balance}));
			}
		});
		break;
	}
}
exports.getAllBalances = (gielda) => {
	switch (gielda){
	case "bleutrade": 
		bleutrade.getbalances("ALL", function(err, balances) {
			if(err) return;

            if(balances.success) {
            	index.zrobCosZWynikami("getAllBalances", gielda, (balances.result));
            }
		});
		break;
	}
}
//Get the list of all pairs traded.
exports.getAllMarkets = (gielda) => {
	switch (gielda){
	case "bleutrade": 
		bleutrade.getmarkets (function(err, markets) {
			if(err) return;

            if(markets.success) {
            	index.zrobCosZWynikami("getAllMarkets", gielda, (markets.result));
            }
		});
		break;
	case "poloniex":
		poloniex.get24hVolume(function(err, markets){
		    if (err) return;

            index.zrobCosZWynikami("getAllMarkets", gielda, (markets));
            
		});
		break;
	}
}
//Loads the book offers specific market. type (BUY | SELL | ALL) 
//depth - ile ofert (glebokosc)
exports.getMarketOrders = (gielda, MarketCurrency, BaseCurrency, type, depth) => {

	switch (gielda){
	case "bleutrade": 

		if (depth==null||depth==undefined) depth = 20;
		if (type==null||type==undefined) type = "ALL";

		bleutrade.getorderbook (MarketCurrency+"_"+BaseCurrency,type,depth, function(err, orders) {
			if(err) return;

            if(orders.success) {
            	index.zrobCosZWynikami("getMarketOrders", gielda, (orders.result), [MarketCurrency, BaseCurrency, type, depth]);
            }
		});
		break;
	case "poloniex":
		//bez obslugi parametrow type, depth - zawsze wszystko
		poloniex.getOrderBook(BaseCurrency, MarketCurrency, function(err, orders){
		    if (err) return;

		    index.zrobCosZWynikami("getMarketOrders", gielda, orders, [MarketCurrency, BaseCurrency, type, depth]);
		    //console.log(orders);
		});
		break;
	}
}