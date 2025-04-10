const IS_FINANCIAL_TRANSACTION_PROMPT = `
  Is this a notificaion email that says a financial transaction was made?
  If this is an email to just notify an OTP, no need to consider this as a financial transaction.
  For reference, following are some sender email IDs and their usual pattern which needs to be kept in mind:

  1. order-update@amazon.in: They usually send order updates from amazon. This email might have the amount of the product, but that is just a FYI. So those need not be considered as financial transaction in most of the cases.

  Answer with only "true" or "false".
`;

const GET_TRANSACTION_AMOUNT_PROMPT = `
  What is the amount in the following financial transaction message?
  Answer with only the amount without any currency.
  Also, if there are any decimals, remove them. Only the integer part is enough.
  In case you cannot find, say just -1 (this is to distinguish so that user knows something is wrong).
`;

const GET_TRANSACTION_DATE_PROMPT = `
  What is the transaction date in the following financial transaction message?
  Answer with only the date in YYYY-MM-DD format.
  In case you cannot find, say just "1970-01-01" (this is to distinguish so that user knows something is wrong).
`;

const GET_TRANSACTION_NOTES_PROMPT = `
  Give a very short description on what the transaction is, so that user can understand the reason.
  No need to make a full sentence, this is an excel column. So just a few words to understand is enough.
`;

async function processEmail(email) {
  const emailBody = email.getPlainBody();
  const sender = email.getFrom();

  if (await isFinancialTransaction(emailBody, sender)) {
    const transactionDetails = await getTransactionDetails(emailBody);
    writeToSpreadsheet(transactionDetails);
  }
}

async function isFinancialTransaction(emailBody, sender) {
  const response = await generateContent(`${IS_FINANCIAL_TRANSACTION_PROMPT}\n\nSender: ${sender}\n\nEmail Body: ${emailBody}`);
  return response.toLowerCase().trim() === 'true';
}

async function getTransactionDetails(emailBody) {
  const amount = await generateContent(`${GET_TRANSACTION_AMOUNT_PROMPT}\n\n${emailBody}`);
  const transactionDate = await generateContent(`${GET_TRANSACTION_DATE_PROMPT}\n\n${emailBody}`);
  const transactionNote = await generateContent(`${GET_TRANSACTION_NOTES_PROMPT}\n\n${emailBody}`);

  return {
    amount: amount,
    transactionDate: transactionDate,
    transactionNote: transactionNote.trim(),
  }
}

async function writeToSpreadsheet(transactionDetails) {
  appendRowToSheetByUrl(SHEET_URL, SHEET_NAME, [
    transactionDetails.transactionDate,
    transactionDetails.amount,
    transactionDetails.transactionNote,
  ]);
}
