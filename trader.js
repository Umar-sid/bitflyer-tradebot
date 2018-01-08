var request = require('request');

var path         = '/v1/getticker';
var query        = '';
var url          = 'https://api.bitflyer.jp' + path + query;

var counter             = 0;
var buyPrice            = 0;
var sellPrice           = 0;
var cons_profitGap      = 5000;
var cons_stopLoss       = 2500;
var signal              = "NONE";
var tradeStatus         = "NONE";
var commisionPerc       = 0.001;
var highest             = 0;
var lowest              = 0;
var currentPrice        = 0;    
var firstTrade          = true;

var requestLoop = setInterval(function(){
  request(url, function (err, response, payload) {
        data = JSON.parse(payload);
        // Only if CurrentPrice changed
        if(data.ltp == currentPrice){return;}
        currentPrice    = data.ltp;
        
        // Reset Values for First trade
        if(firstTrade){
            lowest      = data.ltp;
            highest     = data.ltp;
            buyPrice    = lowest + cons_profitGap;
            sellPrice   = highest - cons_stopLoss;
            firstTrade  = false;
            console.log("Reset Data");
        }
      
        console.log("CurrentPrice : "+ currentPrice);

        var tmpSignal = analyseTrade(currentPrice);
        if(tmpSignal == "BUY"){ 
            console.log("Bought @     : "+currentPrice); 
            tradeStatus = 'BUY';
        }
      
        if(tmpSignal == "SELL"){console.log("SOLD   @     : "+currentPrice); }
      
        console.log("=============================================="); 
        counter++;
  });
  if(counter == 1000){ clearInterval(requestLoop);  }

}, 2000);


analyseTrade = function(currentPrice){
    
    if(highest <= currentPrice){ highest = currentPrice; }
    if(lowest >= currentPrice){ lowest = currentPrice; }
    
    
    signal = 'NONE';
    console.log("HighPrice    : "+ highest);
    console.log("Low Price    : "+ lowest);
    console.log("Buy Price    : "+ buyPrice);
    console.log("Sell Price   : "+ sellPrice);
    console.log("Trade Status : "+ tradeStatus);

    // Logic to Buy or sell
    if(currentPrice > buyPrice && (tradeStatus == "NONE" || tradeStatus == "SELL")){ signal = "BUY"; }
    if(currentPrice < sellPrice && (tradeStatus == "BUY")){ signal = "SELL"; }
    console.log("Signal :" + signal);

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