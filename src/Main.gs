async function processRecentEmails() {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const searchQuery = 'after:' + formatDate(threeHoursAgo);
  const oldProcessedIds = getProcessedIds();
  const newProcessIds = new Set();

  const threads = GmailApp.search(searchQuery);

  for (const thread of threads) {
    const messages = thread.getMessages();
    for (const message of messages) {
      const messageId = message.getId();
      const messageDate = message.getDate();

      if (messageDate >= threeHoursAgo && !oldProcessedIds.has(messageId)) {
        await processEmail(message);
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
