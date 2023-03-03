function checkHumidityLevel(humidityPercentage) {
  if (humidityPercentage > 70) {
    throw new Error('Humidity Error');
  }
}
checkHumidityLevel(20);