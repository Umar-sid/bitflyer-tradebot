var request = require('request');
var fs = require('fs');
//var analyser = require('./getTradeSignal');

var path         = '/v1/getticker';
var query        = '';
var url          = 'https://api.bitflyer.jp' + path + query;

var debugMode           = true;
var counter             = 0;
var buyPrice            = 0;
var sellPrice           = 0;
var cons_profitGap      = 20000;
var cons_stopLoss       = 10000;
var signal              = "NONE";
var tradeStatus         = "NONE";
var commisionPerc       = 0.001;
var tradeAmt            = 0.01;
var highest             = 0;
var lowest              = 0;
var currentPrice        = 0;    
var firstTrade          = true;
var totalAmt            = 0;
var finalAmt            = 0;
var boughtPrice         = 0;
var soldPrice           = 0;


// Read data file and loop
var obj;
var backupDirPath       = "./DatasetBackup"; 
fs.readdir(backupDirPath, function(err, items) {
   if (err) throw err;
    console.log("Total Log files Found : "+ items.length);
    for (var i=0; i<items.length; i++) {
        
        fs.readFile(backupDirPath+"/"+items[i], 'utf8', function (err, rawData) {
            if (err) throw err;
            
            firstTrade = true;
            rawData = rawData.replace(/\]/g,'');
            rawData = "[" + rawData.slice(1) + "]";
            
            obj = JSON.parse(rawData);
            if(debugMode) { console.log("  CURRENT |   HIGH   |   LOW    |  BUY       |  SELL   |  TRADE STATUS  |   SIGNAL"); }
            console.log("   BUY   |   SELL    |  TRADE |  DIFF   |  RESULT");

            for(var i in obj){
                data = obj[i];

                currentPrice= data.ltp;

                if(firstTrade){
                    signal              = "NONE";
                    tradeStatus         = "NONE";
                    lowest      = data.ltp;
                    highest     = data.ltp;
                    buyPrice    = lowest;
                    sellPrice   = highest - cons_stopLoss;
                    firstTrade  = false;
                    if(debugMode) { console.log("Reset Data"); }
                }

                var tmpSignal = analyseTrade(currentPrice);
                if(tmpSignal == "BUY"){ 

                    tradeStatus = 'BUY'; 
                    boughtPrice = currentPrice;
                }

                if(tmpSignal == "SELL"){
                    tradeStatus = 'SELL';

                    soldPrice = currentPrice;
                    var diff = (soldPrice * tradeAmt) - (boughtPrice * tradeAmt);
                    var comm = (boughtPrice*commisionPerc*tradeAmt)+(boughtPrice*commisionPerc*tradeAmt);
                    finalAmt = finalAmt + (diff - comm);
                    console.log(boughtPrice + "  |  " + soldPrice + "  |  " + tradeAmt + "  |  " + parseFloat(Math.round(diff * 100) / 100).toFixed(2) + "  =  " + parseFloat(Math.round((diff-comm) * 100) / 100).toFixed(2));
                }

            }
            totalAmt += finalAmt;
            console.log("===================================================");
            console.log("         Final Amount :  "+ finalAmt);
            console.log("===================================================");
            finalAmt = 0;
        });
        

        
    }
});

setTimeout(function(){
console.log("===Total Amount = " + totalAmt + "=================");
    
},5000);

analyseTrade = function(currentPrice){
    
    if(highest <= currentPrice){ highest = currentPrice; }
    if(lowest >= currentPrice){ lowest = currentPrice; }
        
    signal = 'NONE';
    
    // Logic to Buy or sell
    if(currentPrice > buyPrice && (tradeStatus == "NONE" || tradeStatus == "SELL")){ signal = "BUY"; }
    if(currentPrice < sellPrice && (tradeStatus == "BUY")){ signal = "SELL"; }

    if(debugMode) { console.log(" "+ currentPrice + "  | "+" "+ highest + "  | "+ lowest +  "  |  "+ buyPrice + "  |  "+ sellPrice +"  |  "+ tradeStatus+"  |  " + signal); }

    switch(signal){
        case 'BUY': highest = currentPrice; 
                    break; 
        case 'SELL': lowest = currentPrice; 
                    break; 
        default:    break;
     }
    
    // Change the buy and Sell price for next transaction
    buyPrice    = lowest + cons_profitGap;
    sellPrice   = highest - cons_stopLoss;
    
    return signal; 
}