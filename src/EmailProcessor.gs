const TRANSACTION_EMAIL_SENDERS = [
  'alerts@hdfcbank.net',
  'no-reply@amazonpay.in',
  'noreply@idfcfirstbank.com',
];

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

const EXPERIMENTAL_PROMPT_FOR_FINANCE_DETAILS = `
  Instructions:
  For this question, you should return a JSON in stringified format.
  After this Instructions section, you will have the "Email Body" section and that section should be used to generate the JSON.
  The keys and corresponding description of the values (which you should generate) are as follows:
  1. transactionDate: This must be in format YYYY-MM-DD. If a value cannot be generated, just put it as "1970-01-01". If the email body is a financial transaction, the value should be the date on which that transaction happened.
  2. transactionNote: This should be a very short description on what the transaction is, so that user can understand the reason for transaction. No need to make a full sentence, this is an excel column. So just a few words to understand is enough.
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
  if (!TRANSACTION_EMAIL_SENDERS.includes(extractEmailFromHeader(sender))) {
    return false;
  }
  const response = await generateContent(`${IS_FINANCIAL_TRANSACTION_PROMPT}\n\nSender: ${sender}\n\nEmail Body: ${emailBody}`);
  return response.toLowerCase().trim() === 'true';
}

function extractEmailFromHeader(fromHeaderString) {
  const emailMatch = fromHeaderString.match(/<([^>]+)>/);

  if (emailMatch && emailMatch.length > 1) {
    return emailMatch[1];
  } else {
    return fromHeaderString.trim();
  }
}

async function getTransactionDetails(emailBody) {
  const amount = await generateContent(`${GET_TRANSACTION_AMOUNT_PROMPT}\n\n${emailBody}`);
  const transactionDetailsString = await generateContent(`${EXPERIMENTAL_PROMPT_FOR_FINANCE_DETAILS}\n\nEmail Body:\n${emailBody}`);
  const transactionDetails = detailsToJson(transactionDetailsString);

  return {
    amount: amount,
    transactionDate: transactionDetails?.transactionDate,
    transactionNote: transactionDetails?.transactionNote?.trim(),
  }
}

async function writeToSpreadsheet(transactionDetails) {
  appendRowToSheetByUrl(SHEET_URL, SHEET_NAME, [
    transactionDetails.transactionDate,
    transactionDetails.amount,
    transactionDetails.transactionNote,
  ]);
}

function detailsToJson(transactionDetails) {
  const regex = /^```json([\s\S]*)```$/;
  const match = transactionDetails.match(regex);
  const jsonString = match ? match[1] : transactionDetails;

  return JSON.parse(jsonString);
}
