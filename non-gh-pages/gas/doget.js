function doGet(e){
  
  //Logger.log("doGet invoked!");
  var rowNum = e.parameter.rowNum;
  var data = e.parameter.data;
  
  var ss = SpreadsheetApp.openById("xxxxxx").getSheetByName("自動モニタリング"); // xxxxxx はシートID

  //Logger.log(e);
  //Logger.log(rowNum);
  //Logger.log(data);
  
  ss.getRange(rowNum, 6).setValue(data);

  return ContentService.createTextOutput(JSON.stringify({content:"post ok", rowNum:rowNum, data:data})).setMimeType(ContentService.MimeType.JSON);
}
