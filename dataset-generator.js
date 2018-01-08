var dateFormat = require('dateformat');
var fs = require('fs');
var PubNub = require('pubnub');

var fileName = "";
var lst = 0;
var pubnub = new PubNub({
    subscribeKey: 'sub-c-52a9ab50-291b-11e5-baaa-0619f8945a4f'
});

// Create and Clear file
//fs.writeFile(fileName, '', function(){console.log('File Created / Truncated')})
    
pubnub.addListener({
    message: function (data) {
        
        // Create file per hour
        var d = new Date(); // current time
        var mins = d.getMinutes();
        var secs = d.getSeconds();
        if((mins == 0 && secs < 10) || fileName == ''){
            fileName= "./DatasetBackup/dataset_" + dateFormat(data.message.timestpamp, "yyyymmdd_H")+".json";  
            fs.writeFile(fileName, '', { flag: 'wx' }, function(){console.log('File Created(if not exists) : '+fileName)})
        }
        
        if(data.message.ltp != lst){
            lst = data.message.ltp;
            var dt=dateFormat(data.message.timestpamp, "yyyy-mm-dd h:MM:ss");
            var tmp = {"date": dt, "ltp": data.message.ltp}
            fs.appendFile(fileName, ",\n"+JSON.stringify(tmp), function (err) {
              if (err) throw err;
                console.log(dt + " ## " + data.message.ltp);
              
            });
        }
    }
});
pubnub.subscribe({
    channels: ['lightning_ticker_BTC_JPY']
});
