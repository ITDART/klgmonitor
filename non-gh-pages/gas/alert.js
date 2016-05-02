function eventListener(event) {

  var ss = event.source.getActiveSheet(); // 変更のあったシートの取得
  
  if (ss.getName() != '自動モニタリング') {return;} // 「自動モニタリング」のシートで無かったら抜ける
  
  var cell = event.source.getActiveRange(); // 変更のあったセルの取得
  var colNum = cell.getColumn(); // 変更のあったセルの列
  
  // Logger.log(colNum);
  
  if (colNum != 5) {return;} // 「表示可否」の列で無かったら抜ける

  var rowNum = cell.getRow(); // 変更のあったセルの行
  var cityCol = 2; // 自治体名列
  var urlCol = 3; // URL列
  
  var cityName = ss.getRange(rowNum, cityCol).getValue();
  var urlVal = ss.getRange(rowNum, urlCol).getValue();
  
  var msg = cityName + '(' + urlVal + ')' + 'の状態が' + cell.getValue() + 'に変わりました。';
  
  // Logger.log(msg);
  
  sendToSlack(msg, "#op_lgmonitor");
}

function sendToSlack(body, channel) {
  var url = "https://hooks.slack.com/services/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";
  var data = { "channel" : channel, "username" : "自治体サイトモニターbot", "text" : body, "icon_emoji" : ":warning:" };
  var payload = JSON.stringify(data);
  var options = {
    "method" : "POST",
    "contentType" : "application/json",
    "payload" : payload
  };
  Logger.log("sendToSlack");
  Logger.log(url);
  Logger.log(options);
  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response);
}

function testSlack(){
sendToSlack("test", '#takoratta_test');

}