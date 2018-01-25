var util = require('util');
var clear = require('clear');
var colors = require('colors/safe');
var async = require('async'); 
var obslugaGield = require('./scripts/exchanges.js');
var crypto = require('crypto');

/*
 * obsługa klawiatury
 */
// var readline = require('readline');
// readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);
// process.stdin.on('keypress', (str, key) => {
//   if (key.ctrl && key.name === 'c') {
//     process.exit();
//   } else {
//     console.log(`You pressed the "${str}" key`);
//     console.log();
//     console.log(key);
//     console.log();
//   }
// });

//**********************************************************************
//tmp do trojkaty algo
dostepneMarkety = [];
//dostepneMarkety["bleutrade"] = [];
gieldyDoTrojkatnychArbitrazy = ["bleutrade"];
//gieldyDoTrojkatnychArbitrazy = ["bleutrade", "poloniex"];
//orders buy sell na poszczegolnych gieldach
//quantity w marketCurrency
//rate w baseCurrency
buyOrders = [];
sellOrders = [];
//klucz = [MarketA_BaseA_GieldaA,MarketB_BaseB_GieldaB,MarketC_BaseC_GieldaC]
kluczeDoTrojkatnegoArbitrazu = [];

var nextTour = true;

openOrders = [];

function pobierzOtwarteFerty(){

    if(!nextTour) return;
    nextTour = false;
	obslugaGield.getAllOpenOrders('bleutrade');

	
}

function sprawdzajArbitrazTrojaktny(){
	// clear();
	//console.log(buyOrders,sellOrders);
	//console.log(buyOrders);
	
	if(kluczeDoTrojkatnegoArbitrazu!=null&&kluczeDoTrojkatnegoArbitrazu!=undefined){
		for(var key = 0; key< kluczeDoTrojkatnegoArbitrazu.length; key++){
			obliczArbitrazTrojkatny(kluczeDoTrojkatnegoArbitrazu[key][0],kluczeDoTrojkatnegoArbitrazu[key][1],kluczeDoTrojkatnegoArbitrazu[key][2]);
		}
		//sprawdzajArbitrazTrojaktny();
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

function walutaZKlucza(baseCzyQuote, klucz){
	var res = klucz.split("_");
	if(baseCzyQuote == 'base'){
		return res[1];
	}else{
		return res[0];
	}
}

//oblicz arbitrag trojkatny
function obliczArbitrazTrojkatny (kluczA, kluczB, kluczC){
	// console.log(colors.bold(kluczA, kluczB, kluczC));

	//klucz = Market_Base_Gielda
	//pierwsza strona 
	//DOGE->BTC->BUN->DOGE
	//buyOrders["DOGE"+"_"+"BTC"] - KUP BTC ZA DOGE
	//sellOrders["BUN"+"_"+"BTC"] - SPRZEDAJ BTC ZA BUN
	//buyOrders["BUN"+"_"+"DOGE"] - KUP DOGE ZA BUN



	// @TODO:
	// POPRAWIĆ WYLICZANIE W PIERWSZĄ STRONĘ!

	if(false && buyOrders[kluczA]!=undefined&&buyOrders[kluczA]!=null&&
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

		//console.log(quantityAB,totalCostAB,quantityBC,totalCostBC,quantityCA,totalCostCA);
		//rate 
		//(1/3)*2
		
		var wynikArbitrazu = parseFloat((((prizeAB)/prizeBC)*prizeCA)).toFixed(8)-iloscWWalucieA;
		//var wynikArbitrazu = parseFloat(((prizeAB/prizeCA)*prizeBC)-1).toFixed(8);
		//var wynikArbitrazuu = parseFloat((prizeCA - (prizeAB*prizeBC))).toFixed(8);
		if(wynikArbitrazu>0 && false === true){
			console.log('first way');
			console.log('BUY', walutaZKlucza('quote', kluczA), 'FOR', walutaZKlucza('base', kluczA));
			console.log('p: ', prizeAB, '[', walutaZKlucza('quote', kluczA), ']', ' q: ', quantityAB, '[', walutaZKlucza('base', kluczA), ']', ' tc: ',  totalCostAB, '[', walutaZKlucza('quote', kluczA), ']' );
			
			console.log('BUY', walutaZKlucza('base', kluczC), 'FOR', walutaZKlucza('base', kluczA));
			console.log('p: ', prizeCA, '[', walutaZKlucza('base', kluczA), ']', ' q: ', quantityCA, '[', walutaZKlucza('base', kluczA), ']', ' tc: ',  totalCostCA, '[', walutaZKlucza('quote', kluczC), ']' );
			
			console.log('SELL', walutaZKlucza('quote', kluczB), 'FOR', walutaZKlucza('base', kluczB));
			console.log('p: ', prizeBC, '[', walutaZKlucza('base', kluczB), ']', ' q: ', quantityBC, '[', walutaZKlucza('qute', kluczB), ']', ' tc: ',  totalCostBC, '[', walutaZKlucza('quote', kluczB), ']' );
			
			//console.log((quantityAB/totalCostAB).toFixed(8),(quantityBC/totalCostBC).toFixed(8),(quantityCA/totalCostCA).toFixed(8));
			//console.log(quantityAB,totalCostAB,quantityBC,totalCostBC,quantityCA,totalCostCA);
			console.log(colors.green("buy buy sell", wynikArbitrazu));
		}else if(wynikArbitrazu<0){
			// console.log(colors.red("buy buy sell", wynikArbitrazu));
		}else{
			// console.log(colors.blue("buy buy sell", wynikArbitrazu));
		}
	}
	//DRUGA strona 
	//DOGE->ETH->VTC->DOGE
	//sellOrders["ETH"+"_"+"DOGE"] - SPRZEDAJ DOGE ZA ETH
	//sellOrders["VTC"+"_"+"ETH"] - SPRZEDAJ ETH ZA VTC
	//buyOrders["VTC"+"_"+"DOGE"] - KUP DOGE ZA VTC
	if(sellOrders[kluczA]!=undefined&&sellOrders[kluczA]!=null&&
		sellOrders[kluczB]!=undefined&&sellOrders[kluczB]!=null&&
		buyOrders[kluczC]!=undefined&&buyOrders[kluczC]!=null&&
		sellOrders[kluczA][0]!=undefined&&sellOrders[kluczA][0]!=null&&
		sellOrders[kluczB][0]!=undefined&&sellOrders[kluczB][0]!=null&&
		buyOrders[kluczC][0]!=undefined&&buyOrders[kluczC][0]!=null){
		var prizeAB = sellOrders[kluczA][0].Rate;//w [DOGE] (BASE CURRENCY)
		var prizeBC = sellOrders[kluczB][0].Rate;//w [ETH] (BASE CURRENCY)
		var prizeCA = buyOrders[kluczC][0].Rate;//w [DOGE] (BASE CURRENCY)

		var quantityAB = sellOrders[kluczA][0].Quantity;//w [ETH] (MARKET CURRENCY)
		var totalCostAB = (quantityAB*prizeAB).toFixed(8);//w [DOGE] (BASE CURRENCY)

		var quantityBC = sellOrders[kluczB][0].Quantity;//w [VTC] (MARKET CURRENCY)
		var totalCostBC = (quantityBC*prizeBC).toFixed(8);//w [ETH] (BASE CURRENCY)

		var quantityCA = buyOrders[kluczC][0].Quantity;//w [VTC] (MARKET CURRENCY)
		var totalCostCA = (quantityCA*prizeCA).toFixed(8);//w [DOGE] (BASE CURRENCY)

		//totalCostBC w [DOGE] (AB I CA BASE CURRENCY)
		var totalCostBC_A = (quantityBC*prizeCA).toFixed(8);

		
		
		//PROTOTYPE IDEA:
		//
		//fee = 2.5e-8;
		//function fee(a){return a*0.0025}
		//znalezc najdrozsza walute
		//sprawdzic czy q z ofert są > 0.00001 [najdrozsza waluta]
		//sprawdzic czy 
		//-------------

		//sprawdzic czy (0.00001 + 2.5e-8) *  < 

		//obliczyc min z totalcostow
		//sprawdzic ilosci sa wystarczajace do zlozenia oferty

		//TODO LATER: jak nie to sprawdzic czy z nastepna oferta tez bylby arbitraz

		//sprawdzic balanse kont



		//sprawdzic czy ktorys rynek z trojkata jest aktualnie obslugiwany
		//(czy sa na nim otwarte oferty)


		//console.log(quantityAB,totalCostAB,quantityBC,totalCostBC,quantityCA,totalCostCA);
		//console.log("sell", kluczA, sellOrders[kluczA][0]);
		//console.log("sell", kluczB, sellOrders[kluczB][0]);
		//console.log("buy", kluczC, buyOrders[kluczC][0]);
		//rate 
		//((ilosc/prizeAB)/prizeBC)*prizeCA
		var iloscWWalucieA = 1;
		var wynikArbitrazu = parseFloat((((1/prizeAB)/prizeBC)*prizeCA)).toFixed(8)-iloscWWalucieA;
		//var wynikArbitrazu = parseFloat((prizeCA - (prizeAB*prizeBC))).toFixed(8);
		// console.log(wynikArbitrazu);
		if(wynikArbitrazu>0){
			//console.log(colors.bold(kluczA, kluczB, kluczC));
			//console.log(quantityAB,totalCostAB,quantityBC,totalCostBC,quantityCA,totalCostCA);
			console.log('second way');


			console.log('BUY', walutaZKlucza('quote', kluczA), 'FOR', walutaZKlucza('base', kluczA));
			console.log('q cur', walutaZKlucza('quote', kluczA), 'b cur', walutaZKlucza('base', kluczA));
			console.log('p: ', prizeAB, '[', walutaZKlucza('base', kluczA), ']',' q: ',  quantityAB, '[', walutaZKlucza('quote', kluczA), ']',' tc: ',   totalCostAB, '[', walutaZKlucza('base', kluczA), ']' );
			
			// console.log(prizeAB * )

			console.log('BUY', walutaZKlucza('quote', kluczB), 'FOR', walutaZKlucza('base', kluczB));
			console.log('q cur', walutaZKlucza('quote', kluczB), 'b cur', walutaZKlucza('base', kluczB));
			console.log('p: ', prizeBC, '[', walutaZKlucza('base', kluczB), ']',' q: ',  quantityBC, '[', walutaZKlucza('quote', kluczB), ']',' tc: ',   totalCostBC, '[', walutaZKlucza('base', kluczB), ']' );
			
			console.log('SELL', walutaZKlucza('quote', kluczC), 'FOR', walutaZKlucza('base', kluczC));
			console.log('q cur', walutaZKlucza('quote', kluczC), 'b cur', walutaZKlucza('base', kluczC));
			console.log('p: ', prizeCA, '[', walutaZKlucza('base', kluczC), ']',' q: ',  quantityCA, '[', walutaZKlucza('quote', kluczC), ']',' tc: ',   totalCostCA, '[', walutaZKlucza('base', kluczC), ']' );
			
			console.log('totalCostBC_A: ', totalCostBC_A);


					// var oper = Math.min(
     //                      getBal(aLabel), (((getBal(bLabel) * 1.0025).toFixed(8)) / r1).toFixed(8), (((((((getBal(cLabel) * 1.0025).toFixed(8)) / r2).toFixed(8)) * 1.0025).toFixed(8)) / r1).toFixed(8),
     //                      q1, (((q2 * 1.0025).toFixed(8)) / r1).toFixed(8), (((((((q3 * 1.0025).toFixed(8)) / r2).toFixed(8)) * 1.0025) / r1)).toFixed(8)
     //                  );

     //                  if (oper > getBal(aLabel)) {
     //                      oper = getBal(label1[start]);
     //                  }
     //                  if (oper > (((getBal(bLabel) * 1.0025).toFixed(8)) / r1).toFixed(8)) {
     //                      oper = (((getBal(bLabel) * 1.0025).toFixed(8)) / r1).toFixed(8);
     //                  }
     //                  if (oper > (((((((getBal(cLabel) * 1.0025).toFixed(8)) / r2).toFixed(8)) * 1.0025).toFixed(8)) / r1).toFixed(8)) {
     //                      oper = (((((((getBal(cLabel) * 1.0025).toFixed(8)) / r2).toFixed(8)) * 1.0025).toFixed(8)) / r1).toFixed(8);
     //                  }


			console.log(colors.green("buy buy sell", wynikArbitrazu));

			var toHash = ''+sellOrders[kluczA][0].gielda + sellOrders[kluczA][0].BaseCurrency + sellOrders[kluczA][0].MarketCurrency +
			sellOrders[kluczB][0].gielda + sellOrders[kluczB][0].BaseCurrency + sellOrders[kluczB][0].MarketCurrency +
			buyOrders[kluczC][0].gielda + buyOrders[kluczC][0].BaseCurrency + buyOrders[kluczC][0].MarketCurrency;

			//TODO SPRAWDZ CZY ISTNIEJE W OPENORDERS

			//JAK NIE, ZNAJDZ KWOTE MINIMALNA I KUP/SPRZEDAJ

			

			// console.log(crypto.createHash('md5').update(toHash).digest("hex"));

		}else if(wynikArbitrazu<0){
			//console.log(colors.red("sell sell buy", wynikArbitrazu));
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
		case 'getAllOpenOrders':
			//console.log('getAllOpenOrders', gielda, dane);
			nextTour = true;
			openOrders = dane;
			sprawdzajArbitrazTrojaktny();
		break;
	}
}

//obslugaGield.getOneBalance("bleutrade","DOGE");
//obslugaGield.getAllBalances("bleutrade");
//obslugaGield.getAllMarkets("bleutrade");

// obslugaGield.getAllMarkets("poloniex");

obslugaGield.getAllMarkets("bleutrade");

//obslugaGield.getMarketOrders("bleutrade", "DOGE", "BTC", "ALL", 10);
//obslugaGield.getMarketOrders("bleutrade", "BUN", "BTC", "ALL", 10);
//obslugaGield.getMarketOrders("bleutrade", "BUN", "DOGE", "ALL", 10);

setInterval(pobierzOtwarteFerty, 1000);
// setInterval(sprawdzajArbitrazTrojaktny, 1000);
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
