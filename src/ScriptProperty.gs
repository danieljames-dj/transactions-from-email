function setScriptPropertiesFromObject(propertiesString) {
  if (typeof propertiesString !== "string") {
    throw new Error("Expected a string input.");
  }

  const propertiesObject = JSON.parse(propertiesString);
  Object.entries(propertiesObject).forEach(([key, value]) => {
    PropertiesService.getScriptProperties().setProperty(key, value);
  });
}
