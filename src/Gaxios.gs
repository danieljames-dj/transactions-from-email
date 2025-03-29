/**
 * A minimal axios-like HTTP client for Google Apps Script 
 * that only implements the functionality we need
 */
const gaxios = {
  /**
   * Makes a POST request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @param {Object} options - Request options
   * @return {Object} Response object with data and status
   */
  post: (url, data, options = {}) => {
    const { headers = {}, params = {} } = options;
    
    // Build URL with query parameters
    let fullUrl = url;
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
      
    if (queryParams) {
      fullUrl += (url.includes('?') ? '&' : '?') + queryParams;
    }
    
    // Build request options
    const requestOptions = {
      method: 'post',
      contentType: headers['Content-Type'] || 'application/json',
      muteHttpExceptions: true
    };
    
    // Add payload data
    requestOptions.payload = requestOptions.contentType.includes('json') 
      ? JSON.stringify(data) 
      : data;
    
    try {
      // Execute request
      const response = UrlFetchApp.fetch(fullUrl, requestOptions);
      const statusCode = response.getResponseCode();
      const contentText = response.getContentText();
      
      // Parse JSON response
      let responseData;
      try {
        responseData = JSON.parse(contentText);
      } catch (e) {
        responseData = contentText;
      }
      
      // Create response object
      const result = {
        data: responseData,
        status: statusCode
      };
      
      // Throw error for non-2xx status codes
      if (statusCode < 200 || statusCode >= 300) {
        const error = new Error(`Request failed with status code ${statusCode}`);
        error.response = result;
        throw error;
      }
      
      return result;
    } catch (error) {
      // Rethrow with formatted error
      if (error.response) {
        throw error; // Already formatted
      } else {
        const newError = new Error(error.message || 'Network Error');
        throw newError;
      }
    }
  }
};
