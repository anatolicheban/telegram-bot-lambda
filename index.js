import axios from 'axios'
import chalk from 'chalk'
import TelegramBot from 'node-telegram-bot-api'
import { currencies, intervals, locations } from './buttons-lists.js'
import { messageTemplate } from './message-template.js'

const token = '5668603977:AAHGbd68mEn9NyBXfXOMjksQoAIbDdyNqPM'
const bot = new TelegramBot(token, { polling: true, })

const weatherApiKey = '21b33fd780b898195cf7d24b7be50c85'



//Тут будет требуемая инфа для запроса
const weatherQuery = {}

//Выносим значения местностей в отдельный массив для удобства
const locationsList = [];
locations.forEach(el => {
  locationsList.push(el[0].callback_data)
})

//Аналогично с интервалами
const intervalsList = []
intervals[0].forEach(el => {
  intervalsList.push(el.callback_data)
})

//Ловим запрос на получение погоды
bot.on('message', msg => {
  if (msg.text === '/getweather') {
    bot.sendMessage(msg.from.id, "Select location from list", {
      reply_markup: {
        inline_keyboard: locations
      },
    })
  }
})


//Реагируем на отправку локации и просим интервал
bot.on('callback_query', query => {
  if (locationsList.includes(query.data)) {
    weatherQuery.location = query.data
    bot.sendMessage(query.message.chat.id, 'Select Interval', {
      reply_markup: {
        inline_keyboard: intervals
      }
    })
  }
})

//Ловим интервал и отправляем челу погоду
bot.on('callback_query', async query => {
  if (intervalsList.includes(query.data)) {
    weatherQuery.interval = query.data
    axios.get(`https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${weatherQuery.location}&appid=${weatherApiKey}`).then(res => {
      console.log(`${chalk.bgBlue(`${query.message.chat.username}`)} asks for weather in ${weatherQuery.location}`)
      if (weatherQuery.interval === '3hours') {
        let message = messageTemplate(res.data.list.slice(0, 15), weatherQuery.location)
        bot.sendMessage(query.message.chat.id, message)
      } else if (weatherQuery.interval === '6hours') {
        let evenItems = []
        evenItems.push(res.data.list[0])
        for (let i = 1; i < res.data.list.length; i++) {
          if (i % 2 === 0) {
            evenItems.push(res.data.list[i])
          }
        }
        let message = messageTemplate(evenItems.slice(0, 15), weatherQuery.location)

        bot.sendMessage(query.message.chat.id, message)
      }
    }).catch(err => {
      bot.sendMessage(query.message.chat.id, 'Something went wrong, try again later')
    })
  }
})

//Работа над курсом валют
bot.on('message', async info => {
  if (info.text === '/getcourse') {
    bot.sendMessage(info.from.id, 'Choose currency', {
      reply_markup: {
        inline_keyboard: currencies
      }
    })

  }
})


//Ловим необходимую валюту
bot.on('callback_query', async query => {
  if (query.data === 'USD') {
    sendCurrency(query.data, query.message.chat.id)
  } else if (query.data === 'EUR') {
    sendCurrency(query.data, query.message.chat.id)
  }
})

const sendCurrency = (curr, userId) => {
  bot.sendMessage(userId, 'Please wait...')
  axios.get('https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11')
    .then(res => res.data)
    .then(res => {
      let currency = res.find(item => item.ccy === curr)

      bot.sendMessage(userId, `
        Currency: ${' ' + currency.ccy}\nBuy: ${' ' + currency.buy + ' UAH'}\nSale: ${' ' + currency.sale + ' UAH'}`)
    })
}