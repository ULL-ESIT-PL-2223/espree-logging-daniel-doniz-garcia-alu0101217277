function checkHumidityLevel(humidityPercentage) {
    console.log(`Entering checkHumidityLevel(${ humidityPercentage }) at line 1`);
    if (humidityPercentage > 70) {
        throw new Error('Humidity Error');
    }
}
checkHumidityLevel(20);