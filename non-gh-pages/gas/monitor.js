// 熊本地震の公共団体・自治体Webサイトモニタリングスクリプト
// https://docs.google.com/spreadsheets/d/1G-vKrvXxNPrwUY_rJXl2zTIxVp67vdgeb2TezCBxGdU/edit?usp=sharing のシート用
// これを変更した場合は、http://github.com/itdart/klgmonitor/blob/master/non-gh-pages/gas/monitoring.js を更新してください。

// var to = 'asai@thedott.io';
var to = 'takoratta@gmail.com';
var sub = 'ホームページ監視情報';
var body = "サーバの状態が正常ではありません。\n　---- \n 市町村名 :@name \n 対象url :@url \n 現在のサーバー状況 :@status \n ----";

var ss;

function myFunction()
{ 
  //URL格納用配列
  var urls = [];
  
  //シートデータ取得
  ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("自動モニタリング");
  //データを取得する
  var data = ss.getRange("C2:C").getValues();
  
  //スプレッドシートデータのレコード数を取得する（配列は0から始まる為）
  var length = ss.getLastRow() - 1;
  
  //A列の値を取得してwordと比較して一致したら抜ける
  for(var i = 0;i<length;i++){
    //セルの値を取得する
    urls[i] = data[i][0];
    //Logger.log("data: " + tempid); 
    
    //空白行の場合、ループ抜ける
    if(data[i][0] == ""){
      break;
    }
  }
  writeCel(urls);
}

//
// 表示可否を判定
//
function writeCel(urls)
{
  var lastrow = ss.getLastRow();

  Logger.log(lastrow);
  for(var i = 2;i<lastrow+1;i++){
    //チェックした時間（日本時間）
    var date = new Date();
    var formattedDate = Utilities.formatDate(date, "JST", "yyyy-MM-dd HH:mm:ss");
    
    var serverInfo = check_server(urls[i-2]);
    
    ss.getRange(i, 4).setValue(formattedDate);

    var oldValue = ss.getRange(i, 5).getValue(); // 表示可否の以前の値を保持
    ss.getRange(i, 5).setValue(serverInfo.txt);
    ss.getRange(i, 7).setValue(serverInfo.headers);
    
    if (oldValue != serverInfo.txt) { // 表示可否に変更があった場合（自治体サイトの状態が変更になった場合）- サーバーがダウンしたときなど の処理
      var cityCol = 2; // 自治体名列
      var urlCol = 3; // URL列
      var colNum = 5; // 表示可否の列
      var rowNum = i;
      
      var cityName = ss.getRange(rowNum, cityCol).getValue(); // 自治体名
      var urlVal = ss.getRange(rowNum, urlCol).getValue(); // URL
      
      var msg = cityName + '(' + urlVal + ')' + 'の状態が' + oldValue + 'から' + serverInfo.txt + 'に変わりました。';
  
      // Logger.log(msg);
  
      sendToSlack(msg, '#op_lgmonitor'); // Slackへの送信
    }
  }
}


//
// 指定URLが死んでたらメール送信
//
function mailSend(name, url)
{
  if(check_server(urls[i]) != 200){
    //MailApp.sendEmail(to, sub, body+urls[i]);
    MailApp.sendEmail(to, sub, body.replace("@name", name).replace("@url", url).replace("@status",code));
  }
}

//
// URLのステータスコードをチェック
//
function check_server(url)
{
  //Logger.log(url);
  try{
    var res = UrlFetchApp.fetch(url);
    return {"code": res.getResponseCode(), "txt":"◯", "headers": return_last_modified(res.getHeaders().toSource()) }
  } catch(e){
    // return {"code": res.getResponseCode(), "txt":"☓", "headers": return_last_modified(res.getHeaders().toSource()) }
    return {"code": "", "txt":"☓", "headers": "" }
  }
}

//
// URLのステータスコードをチェック
//
function return_check_server(url)
{
  try{
    var res = UrlFetchApp.fetch(url);
    return "◯";
  } catch(e){
    return "☓";
  }
}

//
// Last Modifiedを取得する
//
function return_last_modified(header) {
  var lastModifiedRegexp = /^.+'Last-Modified':"(.+?)"/;
  var last = lastModifiedRegexp.exec(header);
  if (!last) {
    // Last Modifiedが無い場合は空白に
    // return header;
    return "";
  }
  var date = new Date(last[1]);
  return Utilities.formatDate(date, "JST", "yyyy-MM-dd HH:mm:ss");
}
