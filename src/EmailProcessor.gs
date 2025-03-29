async function processEmail(email) {
  const emailBody = email.getPlainBody();

  if (await isFinancialTransaction(emailBody)) {
    const transactionDetails = await getTransactionDetails(emailBody);
    writeToSpreadsheet(transactionDetails);
  }
}

async function isFinancialTransaction(emailBody) {
  // Check if the email is a financial transaction.
}

async function getTransactionDetails(emailBody) {
  // Return the transaction details.
}

async function writeToSpreadsheet(transactionDetails) {
  const sheetUrl = PropertiesService.getScriptProperties().getProperty('SHEET_URL');
  const sheetName = PropertiesService.getScriptProperties().getProperty('SHEET_NAME');

  appendRowToSheetByUrl(sheetUrl, sheetName, [
    transactionDetails.transactionDate,
    transactionDetails.amount,
  ]);
}
