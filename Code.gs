/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('Tab2TeX');
  SpreadsheetApp.getUi().showSidebar(ui);
}

function getValues(){
  //get active sheet
  var sheet = SpreadsheetApp.getActiveSheet();
  //get data range and put values in a table
  var data = sheet.getDataRange().getValues();
  return data;
}

function cellFormat(style, weight, color, bgColor){
  this.style = style;
  this.weight = weight;
  this.color = color;
  this.bgColor = bgColor;
}

function getCurrentCellFormat(row, col){
  //get active sheet
  var sheet = SpreadsheetApp.getActiveSheet();
  //get current cell (begin at 1, hence the +1s)
  var cell = sheet.getDataRange().getCell(row+1, col+1);

  //get cell background color
  var backgroundColor = cell.getBackground().substr(1);
  //get cell font color
  var fontColor = cell.getFontColor().substr(1);
  //get cell style (italic or normal)
  var fontStyle = cell.getFontStyle();
  //get cell weight
  var fontWeight = cell.getFontWeight();

  //initialize cellFormat var
  var cellF = new cellFormat(fontStyle,fontWeight,fontColor,backgroundColor);
  return cellF;
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
      //handle cell format:
      var currentCellF = getCurrentCellFormat(i,j);
      Logger.log(currentCellF.color);
      //var to store number of formatting on this cell (to know how many "}" to close)
      var nbFormat = 0
      if (currentCellF.style == "italic") {
        nbFormat ++;
        tab += "\\textit{"
      }
      if (currentCellF.weight == "bold") {
        nbFormat ++;
        tab += "\\textbf{"
      }
      if (currentCellF.color != "000000") {
        nbFormat ++;
        tab += "\\color[HTML]{"+ currentCellF.color +"}{"
      }
      if (currentCellF.bgColor != "ffffff") {
        tab += "{\\cellcolor[HTML]{"+ currentCellF.bgColor +"}}"
      }

      //the cell value
      tab += data[i][j];

      //close the right number of "}":
      if (nbFormat>0) {
        for (var k = 0; k < nbFormat; k++) {
          tab += "}";
        }
      }
    }
    tab += "\\\\ \\hline"
    if(i < data.length -1){
      tab += "\n <br>";
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

function createTab(){
  //get number of col in table
  var nbCol = getValues()[0].length;
  //create |c|c|...|c|
  var tabAlign = "|";
  for(var i = 0; i < nbCol; i++){
    tabAlign += "c|";
  }
  //create header of tex table
  var head = "\\begin{table}[H] \n<br>\\begin{center} \n<br>\\begin{tabular}{"+ tabAlign +"}";

  //create footer of tex table
  var foot = "\\end{tabular} \n<br>\\end{center} \n<br>\\caption{"+ SpreadsheetApp.getActiveSheet().getName() +"} \n<br>\\end{table}";

  // create body of tex table
  var body = createTabBody();
  
  return head + '<br>'+ body +'<br>'+ foot;
}
