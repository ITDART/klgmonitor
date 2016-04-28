// 熊本地震の公共団体・自治体Webサイトモニタリングスクリプト
// https://docs.google.com/spreadsheets/d/1G-vKrvXxNPrwUY_rJXl2zTIxVp67vdgeb2TezCBxGdU/edit?usp=sharing のシート用
// これを変更した場合は、http://github.com/itdart/klgmonitor/blob/master/non-gh-pages/gas/monitoring.js を更新してください。

var to = 'asai@thedott.io';
var sub = 'ホームページ監視情報';
var body = "サーバの状態が正常ではありません。\n　---- \n 市町村名 :@name \n 対象url :@url \n 現在のサーバー状況 :@status \n ----";

var ss;

function myFunction()
{ 
  //URL格納用配列
  var urls = [];
  
  //シートデータ取得
  ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("モニタリング");
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
    ss.getRange(i, 5).setValue(serverInfo.txt);
    ss.getRange(i, 7).setValue(serverInfo.headers);
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
  try{
    var res = UrlFetchApp.fetch(url);
    return {"code": res.getResponseCode(), "txt":"◯", "headers": return_last_modified(res.getHeaders().toSource()) }
  } catch(e){
    return {"code": res.getResponseCode(), "txt":"☓", "headers": return_last_modified(res.getHeaders().toSource()) }
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
    // Last Modifiedが無い場合はそのまま
    return header;
  }
  var date = new Date(last[1]);
  return Utilities.formatDate(date, "JST", "yyyy-MM-dd HH:mm:ss");
}