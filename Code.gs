function getValues(){
  //get active sheet
  var sheet = SpreadsheetApp.getActiveSheet();
  //get data range and put values in a table
  var data = sheet.getDataRange().getValues();
  return data;
}

function createTabBody() {
  data = getValues();
  //initialize tex tab string
  var tab = "\\hline \n";
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[0].length; j++){
      if(j>0){
        tab += "&";
      }
      tab += data[i][j];
      Logger.log(': Row'+ i + ' Col: ' + j + ' '+ data[i][j]);
    }
    tab += "\\\\ \\hline"
    if(i < data.length -1){
      tab += "\n";
    }
  }
  return tab;
}

function createFile(){
  // Create a new Google Doc
  var doc = DocumentApp.create('tab2tex: ' + SpreadsheetApp.getActiveSheet().getName());

  //get number of col in table
  var nbCol = getValues()[0].length;
  //create |c|c|...|c|
  var tabAlign = "|";
  for(var i = 0; i < nbCol; i++){
    tabAlign += "c|";
  }
  //create header of tex table
  var head = "\\begin{table}[H] \n\\begin{center} \n\\begin{tabular}{"+ tabAlign +"}";
  
  //create footer of tex table
  var foot = "\\end{tabular} \n\\end{center} \n\\caption{"+ SpreadsheetApp.getActiveSheet().getName() +"} \n\\end{table}";
  
  // Access the body of the document, then add a paragraph.  
  doc.getBody().appendParagraph(head);
  doc.getBody().appendParagraph(createTabBody());
  doc.getBody().appendParagraph(foot);
}