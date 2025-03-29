function setScriptPropertiesFromObject(propertiesObject) {
  Object.entries(propertiesObject).forEach(([key, value]) => {
    PropertiesService.getScriptProperties().setProperty(key, value);
  });
}
