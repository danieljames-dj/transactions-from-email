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
  // Write to spreadsheet.
}
