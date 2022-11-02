export const messageTemplate = (data, location) => {
  let message = `Weather in ${location}\n`

  data.forEach(el => {
    message += `
    ${getDate(el.dt_txt) + ', ' + getTime(el.dt_txt)} 
    \rTemperature: ${' ' + el.main.temp > 0 ? '+' + el.main.temp : el.main.temp}${' °C'}
    \tFells like: ${' ' + el.main.feels_like > 0 ? '+' + el.main.feels_like : el.main.feels_like}${' °C'}
    \tWind speed: ${' ' + el.wind.speed + ' mps'}
    \tDescription: ${' ' + el.weather[0].description}
    `
  })
  return message
}




function getDate(date) {
  return new Date(date).toLocaleString('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

function getTime(date) {
  return new Date(date).toLocaleTimeString()
}