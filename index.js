var util = require('util');
var clear = require('clear');
var colors = require('colors/safe');
var async = require('async'); 
var obslugaGield = require('./scripts/exchanges.js');
//**********************************************************************
//tmp do trojkaty algo
dostepneMarkety = [];
//dostepneMarkety["bleutrade"] = [];

gieldyDoTrojkatnychArbitrazy = ["bleutrade", "poloniex"];
//orders buy sell na poszczegolnych gieldach
//quantity w marketCurrency
//rate w baseCurrency
buyOrders = [];
sellOrders = [];
//klucz = [MarketA_BaseA_GieldaA,MarketB_BaseB_GieldaB,MarketC_BaseC_GieldaC]
kluczeDoTrojkatnegoArbitrazu = [];

function sprawdzajArbitrazTrojaktny(){
	clear();
	//console.log(buyOrders,sellOrders);
	if(kluczeDoTrojkatnegoArbitrazu!=null&&kluczeDoTrojkatnegoArbitrazu!=undefined){
		for(var key = 0; key< kluczeDoTrojkatnegoArbitrazu.length; key++){
			obliczArbitrazTrojkatny(kluczeDoTrojkatnegoArbitrazu[key][0],kluczeDoTrojkatnegoArbitrazu[key][1],kluczeDoTrojkatnegoArbitrazu[key][2]);
		}
	}
}

function sprawdzCzyZgodnaGielda (Market, gieldy){
	for(var ktoraGielda = 0; ktoraGielda<gieldy.length; ktoraGielda++){
		if(Market.gielda==gieldy[ktoraGielda]) return true;
	}
	return false;
}

function sprawdzCzyToLancuszek (a,b,c){
	if(a.MarketCurrency==b.BaseCurrency&&
		a.BaseCurrency==c.BaseCurrency&&
		b.MarketCurrency==c.MarketCurrency){
		return true;
	}else{
		return false;
	}
}

//oblicz arbitrag trojkatny
function obliczArbitrazTrojkatny (kluczA, kluczB, kluczC){
	console.log(colors.bold(kluczA, kluczB, kluczC));

	//klucz = Market_Base_Gielda
	//pierwsza strona 
	//DOGE->BTC->BUN->DOGE
	//buyOrders["DOGE"+"_"+"BTC"] - KUP BTC ZA DOGE
	//sellOrders["BUN"+"_"+"BTC"] - SPRZEDAJ BTC ZA BUN
	//buyOrders["BUN"+"_"+"DOGE"] - KUP DOGE ZA BUN
	if(buyOrders[kluczA]!=undefined&&buyOrders[kluczA]!=null&&
		buyOrders[kluczB]!=undefined&&buyOrders[kluczB]!=null&&
		sellOrders[kluczC]!=undefined&&sellOrders[kluczC]!=null&&
		buyOrders[kluczA][0]!=undefined&&buyOrders[kluczA][0]!=null&&
		buyOrders[kluczB][0]!=undefined&&buyOrders[kluczB][0]!=null&&
		sellOrders[kluczC][0]!=undefined&&sellOrders[kluczC][0]!=null){
		//console.log("buy", kluczA, buyOrders[kluczA][0]);
		//console.log("buy", kluczB, buyOrders[kluczB][0]);
		//console.log("sell", kluczC, sellOrders[kluczC][0]);
		var iloscWWalucieA = 1;

		var depthAB = 0;
		var depthBC = 0;
		var depthCA = 0;

		var prizeAB = buyOrders[kluczA][0].Rate;
		var prizeBC = sellOrders[kluczC][0].Rate;
		var prizeCA = buyOrders[kluczB][0].Rate;
		
		var quantityAB = buyOrders[kluczA][0].Quantity;//w [DOGE]
		var totalCostAB = quantityAB*prizeAB;//w [BTC]

		var quantityBC = sellOrders[kluczC][0].Quantity;//w [ZRC]
		var totalCostBC = quantityBC*prizeBC;//w [BTC]

		var quantityCA = buyOrders[kluczB][0].Quantity;//w [ZRC]
		var totalCostCA = quantityCA*prizeCA*prizeAB;//w [BTC]

		console.log(quantityAB,totalCostAB,quantityBC,totalCostBC,quantityCA,totalCostCA);
		//rate 
		//(1/3)*2
		
		var wynikArbitrazu = parseFloat((((prizeAB)/prizeBC)*prizeCA)).toFixed(8)-iloscWWalucieA;
		//var wynikArbitrazu = parseFloat(((prizeAB/prizeCA)*prizeBC)-1).toFixed(8);
		//var wynikArbitrazuu = parseFloat((prizeCA - (prizeAB*prizeBC))).toFixed(8);
		if(wynikArbitrazu>0){
			console.log(colors.green("buy buy sell", wynikArbitrazu));
		}else if(wynikArbitrazu<0){
			console.log(colors.red("buy buy sell", wynikArbitrazu));
		}else{
			console.log(colors.blue("buy buy sell", wynikArbitrazu));
		}
	}
	//DRUGA strona 
	//BTC->DOGE->BUN->BTC
	//sellOrders["DOGE"+"_"+"BTC"] - SPRZEDAJ BTC ZA DOGE
	//sellOrders["BUN"+"_"+"DOGE"] - SPRZEDAJ DOGE ZA BUN
	//buyOrders["BUN"+"_"+"BTC"] - KUP BTC ZA BUN
	if(sellOrders[kluczA]!=undefined&&sellOrders[kluczA]!=null&&
		sellOrders[kluczB]!=undefined&&sellOrders[kluczB]!=null&&
		buyOrders[kluczC]!=undefined&&buyOrders[kluczC]!=null&&
		sellOrders[kluczA][0]!=undefined&&sellOrders[kluczA][0]!=null&&
		sellOrders[kluczB][0]!=undefined&&sellOrders[kluczB][0]!=null&&
		buyOrders[kluczC][0]!=undefined&&buyOrders[kluczC][0]!=null){
		var prizeAB = sellOrders[kluczA][0].Rate;
		var prizeBC = sellOrders[kluczB][0].Rate;
		var prizeCA = buyOrders[kluczC][0].Rate;

		var quantityAB = sellOrders[kluczA][0].Quantity;//w [DOGE]
		var totalCostAB = quantityAB*prizeAB;//w [BTC]

		var quantityBC = sellOrders[kluczB][0].Quantity;//w [ZRC]
		var totalCostBC = quantityBC*prizeBC;//w [BTC]

		var quantityCA = buyOrders[kluczC][0].Quantity;//w [ZRC]
		var totalCostCA = quantityCA*prizeCA;//w [DOGE]

		console.log(quantityAB,totalCostAB,quantityBC,totalCostBC,quantityCA,totalCostCA);
		//console.log("sell", kluczA, sellOrders[kluczA][0]);
		//console.log("sell", kluczB, sellOrders[kluczB][0]);
		//console.log("buy", kluczC, buyOrders[kluczC][0]);
		//rate 
		//((ilosc/prizeAB)/prizeBC)*prizeCA
		var iloscWWalucieA = 1;
		var wynikArbitrazu = parseFloat((((1/prizeAB)/prizeBC)*prizeCA)).toFixed(8)-iloscWWalucieA;
		//var wynikArbitrazu = parseFloat((prizeCA - (prizeAB*prizeBC))).toFixed(8);
		if(wynikArbitrazu>0){
			//console.log(colors.bold(kluczA, kluczB, kluczC));
			console.log(colors.green("sell sell buy", wynikArbitrazu));
		}else if(wynikArbitrazu<0){
			console.log(colors.red("sell sell buy", wynikArbitrazu));
		}else{
			console.log(colors.blue("sell sell buy", wynikArbitrazu));
		}
	}
}
var iloscTrojkatow = 0;
function znajdzMarketyDoTrojkatow (gieldy){
	kluczeDoTrojkatnegoArbitrazu = [];
	iloscTrojkatow = 0;
	for(var x=0; x<dostepneMarkety.length; x++){
		marketA = x;
		if(sprawdzCzyZgodnaGielda(dostepneMarkety[marketA],gieldy)){
			for(y=1;y<dostepneMarkety.length+1;y++){
				marketB = y%dostepneMarkety.length;
				if(sprawdzCzyZgodnaGielda(dostepneMarkety[marketB],gieldy)){
					for(z=2;z<dostepneMarkety.length+2;z++){
						marketC = z%dostepneMarkety.length;
						if(sprawdzCzyZgodnaGielda(dostepneMarkety[marketC],gieldy)){
							if(sprawdzCzyToLancuszek(dostepneMarkety[marketA],dostepneMarkety[marketB],dostepneMarkety[marketC])){
								kluczeDoTrojkatnegoArbitrazu[iloscTrojkatow]=[dostepneMarkety[marketA].MarketName+"_"+dostepneMarkety[marketA].gielda,dostepneMarkety[marketB].MarketName+"_"+dostepneMarkety[marketB].gielda,dostepneMarkety[marketC].MarketName+"_"+dostepneMarkety[marketC].gielda];
								iloscTrojkatow++;
								//console.log(dostepneMarkety[marketA].MarketName,dostepneMarkety[marketB].MarketName,dostepneMarkety[marketC].MarketName);

								//obliczArbitrazTrojkatny(dostepneMarkety[marketA].MarketName+"_"+dostepneMarkety[marketA].gielda,dostepneMarkety[marketB].MarketName+"_"+dostepneMarkety[marketB].gielda,dostepneMarkety[marketC].MarketName+"_"+dostepneMarkety[marketC].gielda);
							}
						}
					}
				}
			}
		}	
	}
	console.log(colors.red(iloscTrojkatow));
}

//tablica z dostepnymi Marketami MarketName MarketCurrency BaseCurrency MinTradeSize

var iloscMarketow = 0;
function dodajDoDostepnychMarketow(gielda, MarketName, MarketCurrency, BaseCurrency){
	var tmpMarket = {
		"gielda": gielda, 
		"MarketName": MarketCurrency+"_"+BaseCurrency, 
		"MarketCurrency": MarketCurrency, 
		"BaseCurrency": BaseCurrency
	}
	//console.log(tmpMarket);
	dostepneMarkety.push(tmpMarket);
}

function dodajDoOrders(typ, gielda, MarketCurrency, BaseCurrency, Quantity, Rate){
	var tmpOrder = {
		"gielda": gielda, 
		"MarketCurrency": MarketCurrency, 
		"BaseCurrency": BaseCurrency, 
		"Quantity": Quantity,
		"Rate": Rate
	};
	/*
	if(gielda=="poloniex"){
		console.log(colors.green(tmpOrder["gielda"],tmpOrder["MarketCurrency"],tmpOrder["BaseCurrency"],tmpOrder["Quantity"],tmpOrder["Rate"]));
	}else if(gielda=="bleutrade"){
		console.log(colors.blue(tmpOrder["gielda"],tmpOrder["MarketCurrency"],tmpOrder["BaseCurrency"],tmpOrder["Quantity"],tmpOrder["Rate"]));
	}
	*/
	if(typ=="buy"){
		if(buyOrders[MarketCurrency+"_"+BaseCurrency+"_"+gielda]==undefined) buyOrders[MarketCurrency+"_"+BaseCurrency+"_"+gielda] = [];
		buyOrders[MarketCurrency+"_"+BaseCurrency+"_"+gielda].push(tmpOrder);
	} 
	if(typ=="sell"){
		if(sellOrders[MarketCurrency+"_"+BaseCurrency+"_"+gielda]==undefined) sellOrders[MarketCurrency+"_"+BaseCurrency+"_"+gielda] = [];
		sellOrders[MarketCurrency+"_"+BaseCurrency+"_"+gielda].push(tmpOrder);
	} 
}

//**********************************************************************
//obsluz otrzymane wyniki
exports.zrobCosZWynikami = (akcja,gielda,dane,daneDodatkowe) => {
	switch (akcja){
	case "getOneBalance": 
		console.log(akcja,gielda,dane);
		break;
	case "getAllBalances": 
		console.log(akcja,gielda);
		for(var k in dane) {
			if(parseFloat(dane[k].Balance).toFixed(8)>0){
				console.log(dane[k].Balance,"(",dane[k].Available,")",dane[k].Currency);
			}
		}
		break;
	case "getAllMarkets": 
		console.log(akcja,gielda);
		//console.log("MarketName | MarketCurrency | BaseCurrency | MinTradeSize");
		switch (gielda){
			case "bleutrade":
				for(var k in dane) {
					if(dane[k].IsActive=="true"){
						console.log(gielda,dane[k].MarketName,dane[k].MarketCurrency,dane[k].BaseCurrency);
						dodajDoDostepnychMarketow(gielda,dane[k].MarketName,dane[k].MarketCurrency,dane[k].BaseCurrency);
						//console.log(dane[k].MarketName,"|",dane[k].MarketCurrency,"|",dane[k].BaseCurrency,"|",dane[k].MinTradeSize);
						//jezeli jest taki matket, to pobierz oferty
						obslugaGield.getMarketOrders(gielda, dane[k].MarketCurrency, dane[k].BaseCurrency, "ALL");
					}
				}	
				break;
			case "poloniex":
				for(var k in dane) {
					if(k.indexOf("_")>0){
						//console.log(gielda, k, k.substring(k.indexOf("_")+1), k.substring(0, k.indexOf("_")));
						console.log(gielda,k,k.substring(k.indexOf("_")+1),k.substring(0, k.indexOf("_")));
						dodajDoDostepnychMarketow(gielda,k,k.substring(k.indexOf("_")+1),k.substring(0, k.indexOf("_")));
						obslugaGield.getMarketOrders(gielda, k.substring(k.indexOf("_")+1), k.substring(0, k.indexOf("_")));
					}			
				}	

				break;
		}

		//console.log(dostepneMarkety);
		//za kazdym razem po dodaniu marketow znajdzMarkety jeszcze raz
		znajdzMarketyDoTrojkatow(gieldyDoTrojkatnychArbitrazy);
		break;
	case "getMarketOrders": 
		//console.log(akcja,gielda,daneDodatkowe,dane);
		//console.log(dane["buy"]);
		if(gielda=="bleutrade"){
			var tmpBuyOrders = dane["buy"];
			var tmpSellOrders = dane["sell"];
			//console.log(tmpBuyOrders,tmpSellOrders);
			if(tmpSellOrders!=null&&tmpSellOrders!=undefined){

				//WYCZYSC SELLORDERS[MARKET_BASE_GIELDA]
				sellOrders[daneDodatkowe[0]+"_"+daneDodatkowe[1]+"_"+gielda] = [];

				for(var k in tmpSellOrders) {
				//console.log(k, tmpBuyOrders[k]);
				dodajDoOrders("sell", gielda, daneDodatkowe[0], daneDodatkowe[1], tmpSellOrders[k].Quantity, tmpSellOrders[k].Rate);
				//console.log("sell", gielda, daneDodatkowe[0], daneDodatkowe[1], tmpSellOrders[k].Quantity, tmpSellOrders[k].Rate);
				//dodajDoDostepnychMarketow(gielda,dane[k].MarketName,dane[k].MarketCurrency,dane[k].BaseCurrency,dane[k].MinTradeSize)
				//console.log(dane[k].MarketName,"|",dane[k].MarketCurrency,"|",dane[k].BaseCurrency,"|",dane[k].MinTradeSize);
				}
			}

			
			if(tmpBuyOrders!=null&&tmpBuyOrders!=undefined){

				//WYCZYSC BUYORDERS[MARKET_BASE_GIELDA]
				buyOrders[daneDodatkowe[0]+"_"+daneDodatkowe[1]+"_"+gielda] = [];

				for(var k in tmpBuyOrders) {
				//console.log(k, tmpSellOrders[k]);
				dodajDoOrders("buy", gielda, daneDodatkowe[0], daneDodatkowe[1], tmpBuyOrders[k].Quantity, tmpBuyOrders[k].Rate);
				//console.log("buy", gielda, daneDodatkowe[0], daneDodatkowe[1], tmpBuyOrders[k].Quantity, tmpBuyOrders[k].Rate);
				//dodajDoDostepnychMarketow(gielda,dane[k].MarketName,dane[k].MarketCurrency,dane[k].BaseCurrency,dane[k].MinTradeSize)
				//console.log(dane[k].MarketName,"|",dane[k].MarketCurrency,"|",dane[k].BaseCurrency,"|",dane[k].MinTradeSize);
				}
			}
		}else if(gielda=="poloniex"){
			var tmpBuyOrders = dane["bids"];
			var tmpSellOrders = dane["asks"];
			//console.log(tmpBuyOrders, tmpSellOrders)
			//console.log(dane["bids"],dane["asks"]);
			if(tmpSellOrders!=null&&tmpSellOrders!=undefined){
				//WYCZYSC SELLORDERS[MARKET_BASE_GIELDA]
				sellOrders[daneDodatkowe[0]+"_"+daneDodatkowe[1]+"_"+gielda] = [];
				for(var k in tmpSellOrders) {
				//console.log("sell", gielda, daneDodatkowe[0], daneDodatkowe[1], tmpSellOrders[k][1], tmpSellOrders[k][0]);
				dodajDoOrders("sell", gielda, daneDodatkowe[0], daneDodatkowe[1], tmpSellOrders[k][1], tmpSellOrders[k][0]);
				}
			}
			if(tmpBuyOrders!=null&&tmpBuyOrders!=undefined){

				//WYCZYSC BUYORDERS[MARKET_BASE_GIELDA]
				buyOrders[daneDodatkowe[0]+"_"+daneDodatkowe[1]+"_"+gielda] = [];

				for(var k in tmpBuyOrders) {
				//console.log(k, tmpSellOrders[k]);
				//console.log("buy", gielda, daneDodatkowe[0], daneDodatkowe[1], tmpBuyOrders[k][1], tmpBuyOrders[k][0]);
				dodajDoOrders("buy", gielda, daneDodatkowe[0], daneDodatkowe[1], tmpBuyOrders[k][1], tmpBuyOrders[k][0]);
				}
			}
		}
		


		//wyswlij zapytanie ponownie
		obslugaGield.getMarketOrders(gielda, daneDodatkowe[0], daneDodatkowe[1]);
/*
		console.log("\n***buyOrders\n");
		console.log(buyOrders);
		console.log("\n***sellOrders\n");
		console.log(sellOrders);
		*/
		break;
	}
}

//obslugaGield.getOneBalance("bleutrade","DOGE");
//obslugaGield.getAllBalances("bleutrade");
//obslugaGield.getAllMarkets("bleutrade");

obslugaGield.getAllMarkets("poloniex");
obslugaGield.getAllMarkets("bleutrade");
//obslugaGield.getMarketOrders("bleutrade", "DOGE", "BTC", "ALL", 10);
//obslugaGield.getMarketOrders("bleutrade", "BUN", "BTC", "ALL", 10);
//obslugaGield.getMarketOrders("bleutrade", "BUN", "DOGE", "ALL", 10);

setInterval(sprawdzajArbitrazTrojaktny, 10000);
/*
async.waterfall([
  function(callback){
    obslugaGield.getAllBalances("bleutrade");
    callback(null)
  },
  function(callback){

    obslugaGield.getAllMarkets("bleutrade");
    callback(null)
  },
  function(callback){      
  	for(var k in dostepneMarkety) {
  		console.log(dostepneMarkety[k]);
  	}
    callback(null);
  }], function (err, result) {
   // result is 'd'    
  }
)

*/
