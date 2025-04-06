async function processEmail(email) {
  const emailBody = email.getPlainBody();

  if (await isFinancialTransaction(emailBody)) {
    const transactionDetails = await getTransactionDetails(emailBody);
    writeToSpreadsheet(transactionDetails);
  }
}

async function isFinancialTransaction(emailBody) {
  const promptToCheckIfFinancialTransaction = `
    Is this a notificaion email that says a financial transaction was made?
    Answer with only "true" or "false".\n\n${emailBody}
  `;

  const response = await generateContent(promptToCheckIfFinancialTransaction);
  return response.toLowerCase().trim() === 'true';
}

async function getTransactionDetails(emailBody) {
  const currentDate = (new Date()).toISOString().split('T')[0];

  const promptToCheckAmountFromEmailBody = `
    What is the amount in the following financial transaction message?
    Answer with only the amount without any currency.
    In case you cannot find, say just 0.\n\n${emailBody}
  `;
  const promptToCheckTransactionDateFromEmailBody = `
    What is the transaction date in the following financial transaction message?
    Answer with only the date in YYYY-MM-DD format.
    In case you cannto find, say just "${currentDate}".\n\n${emailBody}
  `

  const amount = await generateContent(promptToCheckAmountFromEmailBody);
  const transactionDate = await generateContent(promptToCheckTransactionDateFromEmailBody);

  return {
    amount: amount,
    transactionDate: transactionDate,
  }
}

async function writeToSpreadsheet(transactionDetails) {
  appendRowToSheetByUrl(SHEET_URL, SHEET_NAME, [
    transactionDetails.transactionDate,
    transactionDetails.amount,
  ]);
}
