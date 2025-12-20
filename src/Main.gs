async function processRecentEmails() {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const searchQuery = 'after:' + formatDate(twoDaysAgo);
  const oldProcessedIds = getProcessedIds();
  const newProcessIds = new Set();
  let resourceExhausted = false;

  const threads = GmailApp.search(searchQuery);

  for (const thread of threads) {
    if (resourceExhausted) {
      break;
    }

    const messages = thread.getMessages();
    for (const message of messages) {
      const messageId = message.getId();
      const messageDate = message.getDate();

      if (messageDate >= twoDaysAgo && !oldProcessedIds.has(messageId)) {
        try {
          await processEmail(message);
        } catch(error) {
          Logger.log(error);
          if (error?.response?.data?.error?.code === 429 && error?.response?.data?.error?.status === "RESOURCE_EXHAUSTED") {
            resourceExhausted = true;
            break;
          }
          throw error;
        }
      }
      newProcessIds.add(messageId);
    }
  }

  writeProcessedIds(newProcessIds);
}

function formatDate(date) {
  var year = date.getFullYear();
  var month = Utilities.formatDate(date, Session.getScriptTimeZone(), 'MM');
  var day = Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd');
  return year + '-' + month + '-' + day; // Using YYYY-MM-DD format
}

function getProcessedIds() {
  const processedIdsString = PropertiesService.getScriptProperties().getProperty('processedIds');
  const processedIdsArray = processedIdsString ? JSON.parse(processedIdsString) : [];
  return new Set(processedIdsArray);
}

function writeProcessedIds(processedIdsToStore) {
  PropertiesService.getScriptProperties().setProperty('processedIds', JSON.stringify(Array.from(processedIdsToStore)));
}
