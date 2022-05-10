const nodemailer = require('./nodemailer')
const schedule = require('node-schedule')
const dbConnection = require('./mysql')
const moment = require('moment')

module.exports = {
  checkDates: () => {
    console.log(`[Reminder module] ---Start---`)

    const job = schedule.scheduleJob('0 0 10 * * *', async function () {
      try {
        await dbConnection.query(
          `SELECT xd.*,students.name_surname FROM (SELECT items.name,items.extended_name,temp.* FROM (SELECT * FROM reservations WHERE reserved_to > CURDATE()  AND reserved_to <= CURDATE() + INTERVAL 1 DAY AND email != '' AND reminder = '1' AND stan = '0') AS temp LEFT JOIN items ON items.id = temp.item_id) as xd LEFT JOIN students ON students.id = xd.id_student`,
          async function (err, result, fields) {
            if (err) throw err
            if (result.length >= 1) {
              for (let i = 0; i < result.length; i++) {
                sendEmail(
                  result[i].email,
                  result[i].reserved_to,
                  result[i].name,
                  result[i].extended_name,
                  result[i].name_surname,
                )
              }
            }
          },
        )
      } catch (err) {
        next(err)
      }
    })
  },
}

async function sendEmail(email, date, name, add_name, imie) {
  message = {
    from: process.env.EMAIL_LOGIN,
    to: `${email}`,
    subject: `Przypomnienie o kończącym się wypożyczeniu`,
    html: `<p>Cześć <b>${imie}</b></p><p>Dnia <b>${moment(date).format(
      'DD/MM/YYYY',
    )}</b> mija termin wypożyczenia <b>${name} - ${add_name} </b></p><p>Nie zapomnij oddać przedmiotu przed końcem wypożyczenia!</p>`,
  }
  nodemailer.sendMail(message, function (err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(info)
    }
  })
}
