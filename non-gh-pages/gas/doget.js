function doGet(e){
  
  var rowNum = e.parameter.rowNum;
  var date = e.parameter.date;
  var status = e.parameter.status
  var responseTime = e.parameter.responseTime
  var lastModified = e.parameter.lastModified

  if (lastModified == "") {lastModified=" ";}
    
  var ss = SpreadsheetApp.openById("<SpreadSheetID>").getSheetByName("自動モニタリング");

  ss.getRange(rowNum, 4).setValue(date);
  ss.getRange(rowNum, 5).setValue(status);
  ss.getRange(rowNum, 6).setValue(responseTime);
  ss.getRange(rowNum, 7).setValue(lastModified);

  return ContentService.createTextOutput(JSON.stringify({content:"post ok", rowNum:rowNum})).setMimeType(ContentService.MimeType.JSON);
}