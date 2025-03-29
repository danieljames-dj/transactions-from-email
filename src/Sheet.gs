function appendRowToSheetByUrl(sheetUrl, sheetName, rowData) {
  /**
   * Appends a new row of data to the specified Google Sheet using its URL.
   *
   * @param {string} sheetUrl The URL of the Google Sheet.
   * @param {string} sheetName The name of the sheet to append to.
   * @param {Array} rowData An array containing the data for the new row.
   * @return {boolean} Returns true if the row was appended successfully, false otherwise.
   */
  try {
    // Open the spreadsheet using the URL.
    var ss = SpreadsheetApp.openByUrl(sheetUrl);

    // Get the sheet by name.
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      Logger.log("Sheet '" + sheetName + "' not found in spreadsheet: " + sheetUrl);
      return false; // Sheet not found.
    }

    // Append the row data.
    sheet.appendRow(rowData);
    return true; // Row appended successfully.

  } catch (e) {
    Logger.log("Error appending row: " + e.toString());
    return false; // Error occurred.
  }
}
