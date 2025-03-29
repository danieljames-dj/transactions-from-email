// Gemini API client using our simplified axios-like library
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const GEMINI_MODEL_NAME = 'gemini-2.0-flash';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generates content using the Gemini API with a simplified axios-like interface
 * 
 * @param {string} prompt - The text prompt to send to Gemini
 * @param {string} modelName - Optional model name (defaults to gemini-2.0-flash)
 * @return {Promise<string>} The generated text
 */
async function generateContent(prompt, modelName = GEMINI_MODEL_NAME) {
  try {
    const response = await gaxios.post(
      `${GEMINI_API_URL}/${modelName}:generateContent`, 
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        params: { key: GEMINI_API_KEY }
      }
    );
    
    // Extract the generated text
    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (generatedText) {
      return generatedText;
    } else {
      throw new Error("No text generated in the response");
    }
  } catch (error) {
    Logger.log(`Error generating content: ${error.message}`);
    
    if (error.response) {
      Logger.log(`Response error data: ${JSON.stringify(error.response.data)}`);
    }
    
    return `Error: ${error.message}`;
  }
}
