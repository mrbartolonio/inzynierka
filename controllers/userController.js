const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const dbConnection = require('../utils/mysql')
const moment = require('moment')
const nodemailer = require('../utils/nodemailer')
// Home Page
exports.homePage = async (req, res, next) => {
  try {
    await dbConnection.query(
      'SELECT * FROM `users` WHERE `id`=?',
      [req.session.userID],
      async function (err, result, fields) {
        if (err) throw err
        if (result.length !== 1) {
          return res.redirect('/logout')
        } else {
          res.render('home', {
            user: result[0],
          })
        }
      },
    )
  } catch (err) {
    next(err)
  }
}

// Register Page
exports.registerPage = (req, res, next) => {
  res.render('register')
}

// User Registration
exports.register = async (req, res, next) => {
  const errors = validationResult(req)
  const {body} = req
  if (!errors.isEmpty()) {
    return res.render('register', {
      error: errors.array()[0].msg,
    })
  }

  try {
    await dbConnection.query(
      'SELECT * FROM `users` WHERE `email`=?',
      [body._email],
      async function (err, result, fields) {
        if (err) throw err
        if (result.length >= 1) {
          return res.render('register', {
            error: 'This email already in use.',
          })
        }
      },
    )

    const hashPass = await bcrypt.hash(body._password, 12)

    await dbConnection.query(
      'INSERT INTO `users`(`imie`,`nazwisko`,`email`,`haslo`) VALUES(?,?,?,?)',
      [body._name, body._nazwisko, body._email, hashPass],
      async function (err, result, fields) {
        if (err) throw err
        if (result.affectedRows !== 1) {
          return res.render('register', {
            error: 'Błąd podczas rejestracji.',
          })
        } else {
          res.render('register', {
            msg: 'Pomyślnie zarejestrowano.',
          })
        }
      },
    )
  } catch (e) {
    next(e)
  }
}

// Login Page
exports.loginPage = (req, res, next) => {
  res.render('login')
}

// Login User
exports.login = async (req, res, next) => {
  const errors = validationResult(req)
  const {body} = req

  if (!errors.isEmpty()) {
    return res.render('login', {
      error: errors.array()[0].msg,
    })
  }

  try {
    await dbConnection.query(
      'SELECT * FROM `users` WHERE `email`=? AND active = 1',
      [body._email],
      async function (err, result, fields) {
        if (err) throw err
        if (result.length != 1) {
          return res.render('login', {
            error: 'Błędny adres email, lub konto nie jest aktywne.',
          })
        } else {
          const checkPass = await bcrypt.compare(
            body._password,
            result[0].haslo,
          )

          if (checkPass === true) {
            req.session.userID = result[0].id
            req.session.name = result[0].imie
            if (req.session.redir) {
              return res.redirect(`${req.session.redir}`)
            }
            return res.redirect('/')
          }

          res.render('login', {
            error: 'Błędne hasło.',
          })
        }
      },
    )
  } catch (e) {
    next(e)
  }
}

exports.login2 = async (req, res, next) => {
  const errors = validationResult(req)
  const {body} = req

  if (!errors.isEmpty()) {
    return res.render('login', {
      error: errors.array()[0].msg,
    })
  }

  try {
    await dbConnection.query(
      'SELECT * FROM `users` WHERE `email`=?',
      [body._email],
      async function (err, result, fields) {
        if (err) throw err
        if (result.length != 1) {
          return res.render('login', {
            error: 'Invalid email address.',
          })
        } else {
          const checkPass = await bcrypt.compare(
            body._password,
            result[0].password,
          )

          if (checkPass === true) {
            req.session.userID = result[0].id
            req.session.name = result[0].name
            return res.redirect('/accept')
          }

          res.render('login', {
            error: 'Invalid Password.',
          })
        }
      },
    )
  } catch (e) {
    next(e)
  }
}

// Main Page
exports.glowna = (req, res, next) => {
  if (req.session.userID) {
    res.render('index', {
      logged: 1,
      user: req.session.name,
    })
  } else {
    res.render('index', {
      logged: 0,
    })
  }
}

exports.availability = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT * FROM categories`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          let temp = result.map((elem) => ({
            id: elem.id,
            category: elem.category,
          }))
          res.render('availability', {
            logged: 0,
            user: req.session.name,
            data: temp,
          })
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}
exports.categories = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT * FROM categories`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.render('categories', {
            logged: 1,
            user: req.session.name,
            data: result,
          })
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.students = async (req, res, next) => {
  if (req.session.userID) {
    res.render('students', {
      logged: 1,
      user: req.session.name,
    })
  } else {
    res.render('students', {
      logged: 0,
    })
  }
}

exports.studentsmanage = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT * FROM students`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.render('studentsmanage', {
            logged: 1,
            user: req.session.name,
            data: result,
          })
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.email = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT DISTINCT email FROM reservations ORDER BY reservations.email ASC`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.render('email', {
            logged: 1,
            user: req.session.name,
            data: result,
          })
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.add = async (req, res, next) => {
  if (req.session.userID) {
    try {
      await dbConnection.query(
        `SELECT * FROM categories`,
        async function (err, result, fields) {
          if (err) throw err
          if (result) {
            let temp = result.map((elem) => ({
              id: elem.id,
              name: elem.category,
            }))
            try {
              await dbConnection.query(
                `SELECT DISTINCT klasa FROM students  ORDER BY students.klasa ASC`,
                function (err, result, fields) {
                  if (err) throw err
                  if (result) {
                    res.render('add', {
                      logged: 1,
                      user: req.session.name,
                      data: temp,
                      classes: result,
                    })
                  }
                },
              )
            } catch (error) {
              console.log(error)
            }
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  } else {
    res.render('login')
  }
}

exports.items = async (req, res, next) => {
  if (req.session.userID) {
    try {
      await dbConnection.query(
        `SELECT * FROM categories`,
        async function (err, result, fields) {
          if (err) throw err
          if (result) {
            res.render('items', {
              logged: 1,
              user: req.session.name,
              data: result,
            })
          } else {
            res.status(400).send('Wystąpił błąd podczas pobierania danych!')
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  } else {
    res.render('items')
  }
}

exports.itemsmanage = async (req, res, next) => {
  if (req.session.userID) {
    try {
      await dbConnection.query(
        `SELECT * FROM items`,
        function (err, result, fields) {
          if (err) throw err
          if (result) {
            let temp = result.map((elem) => ({
              id: elem.id,
              name: elem.name,
              code: elem.code,
              info: elem.extended_name,
              desc: elem.addon_info,
              cat: elem.category,
              stan: elem.na_stanie,
            }))
            res.render('itemsmanage', {
              logged: 1,
              user: req.session.name,
              data: temp,
            })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  } else {
    res.render('itemsmanage')
  }
}

exports.manage = async (req, res, next) => {
  if (req.session.userID) {
    try {
      await dbConnection.query(
        `SELECT * FROM categories`,
        function (err, result, fields) {
          if (err) throw err
          if (result) {
            let temp = result.map((elem) => ({
              id: elem.id,
              category: elem.category,
            }))
            res.render('manage', {
              logged: 1,
              user: req.session.name,
              data: temp,
            })
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  } else {
    res.render('manage')
  }
}

exports.accept = async (req, res, next) => {
  if (!req.session.userID) {
    return res.redirect('/login')
  }
  req.session.redir = null
  temp = []
  let val
  let xd = moment(
    `2021-${req.session.month}-${req.session.data1}`,
    'YYYY-MM-DD',
  )

  // console.log(lol)
  let start = parseInt(req.session.data1)
  let stop = parseInt(req.session.data2)
  for (let i = start; i < stop + 1; i++) {
    temp.push(xd.format('YYYY-MM-DD'))
    val = xd.add(1, 'days')
    xd = val
  }

  const wsadz = JSON.stringify(temp)
  let idrow = 0
  try {
    await dbConnection.query(
      `INSERT INTO reserved (id_user,id_room,dates) values ("${req.session.userID}","${req.session.room}",'${wsadz}')`,
      async function (err, result, fields) {
        if (err) throw err

        idrow = result.insertId
        res.render('pay', {
          name: req.session.userID,
          price: req.session.price * (req.session.data2 - req.session.data1),
          room: req.session.room,
          from: `${req.session.data1}/${req.session.month}/2021`,
          to: `${req.session.data2}/${req.session.month}/2021`,
          places: `${req.session.places}`,
          logged: 1,
          user: req.session.name,
          id: idrow,
        })
      },
    )
  } catch (err) {
    next(err)
  }
}
exports.additems = async (req, res, next) => {
  let data = JSON.parse(req.body.data)
  let succ = true
  for (let i = 0; i < data.length; i++) {
    try {
      await dbConnection.query(
        `INSERT INTO items (name,code,extended_name,addon_info,category) values (${dbConnection.escape(
          data[i].name,
        )},${dbConnection.escape(data[i].code)},${dbConnection.escape(
          data[i].info,
        )},${dbConnection.escape(data[i].desc)},${dbConnection.escape(
          data[i].cat,
        )})`,
        function (err, result, fields) {
          if (err) throw err
          if (!result.affectedRows >= 1) {
            succ = false
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  }
  if (succ) {
    res.status(200).send('Pomyślnie dodano')
  } else {
    res.status(400).send('Wystąpił błąd podczas dodawania')
  }
}

exports.insertCat = async (req, res, next) => {
  try {
    await dbConnection.query(
      `INSERT INTO categories (category) values (${dbConnection.escape(
        req.body.name,
      )})`,
      function (err, result, fields) {
        if (err) throw err
        if (result.affectedRows >= 1) {
          res.status(200).send('Pomyślnie dodano wypożyczenie!')
        } else {
          res.status(400).send('Wystąpił błąd podczas dodawania')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.addstudent = async (req, res, next) => {
  let data = JSON.parse(req.body.data)
  let succ = true
  for (let i = 0; i < data.length; i++) {
    try {
      await dbConnection.query(
        `INSERT INTO students (name_surname,document,info,klasa) values (${dbConnection.escape(
          data[i].name_surname,
        )},${dbConnection.escape(data[i].doc)},${dbConnection.escape(
          data[i].addon,
        )},${dbConnection.escape(data[i].class)})`,
        function (err, result, fields) {
          if (err) throw err
          if (!result.affectedRows >= 1) {
            succ = false
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  }
  if (succ) {
    res.status(200).send('Pomyślnie dodano')
  } else {
    res.status(400).send('Wystąpił błąd podczas dodawania')
  }
}

exports.edititems = async (req, res, next) => {
  let name = JSON.parse(req.body.name)
  let code = JSON.parse(req.body.code)
  let desc = JSON.parse(req.body.desc)
  let ext = JSON.parse(req.body.ext)
  let cat = JSON.parse(req.body.cat)
  try {
    await dbConnection.query(
      `UPDATE items SET name = ${dbConnection.escape(
        name,
      )},  code = ${dbConnection.escape(
        code,
      )}, addon_info = ${dbConnection.escape(
        desc,
      )}, extended_name = ${dbConnection.escape(
        ext,
      )}, category = ${dbConnection.escape(cat)} WHERE id = ${req.body.id}`,
      function (err, result, fields) {
        if (err) throw err
        if (result.affectedRows >= 1) {
          res.status(200).send('Pomyślnie edytowano!')
        } else {
          res.status(400).send('Wystąpił błąd podczas edycji')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.updatestudent = async (req, res, next) => {
  let name_surname = req.body.name_surname
  let doc = req.body.document
  let klasa = req.body.klasa
  let info = req.body.info
  try {
    await dbConnection.query(
      `UPDATE students SET name_surname = ${dbConnection.escape(
        name_surname,
      )},  document = ${dbConnection.escape(
        doc,
      )}, klasa = ${dbConnection.escape(klasa)}, info = ${dbConnection.escape(
        info,
      )} WHERE id = ${req.body.id}`,
      function (err, result, fields) {
        if (err) throw err
        if (result.affectedRows >= 1) {
          res.status(200).send('Pomyślnie edytowano!')
        } else {
          res.status(400).send('Wystąpił błąd podczas edycji')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.endwypozyczenie = async (req, res, next) => {
  try {
    await dbConnection.query(
      `UPDATE reservations SET stan = '1', reserved_to = CURDATE() WHERE id = ${req.body.id_res}`,
      async function (err, result, fields) {
        if (err) throw err
        if (result.affectedRows >= 1) {
          try {
            await dbConnection.query(
              `UPDATE items SET na_stanie = '1' WHERE id = ${req.body.id_item}`,
              function (err, result, fields) {
                if (err) throw err
                if (result.affectedRows >= 1) {
                  res.status(200).send('Pomyślnie zakończono!')
                } else {
                  res.status(400).send('Wystąpił błąd podczas edycji')
                }
              },
            )
          } catch (error) {
            console.log(error)
          }
        } else {
          res.status(400).send('Wystąpił błąd podczas edycji')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.removeitems = async (req, res, next) => {
  try {
    await dbConnection.query(
      `select * from reservations where curdate() between reserved_from and  reserved_to AND item_id = '${req.body.id}'`,
      async function (err, result, fields) {
        if (err) throw err
        if (result[0]) {
          res.status(201).send('Aktywne wypożyczenie!')
        } else {
          try {
            await dbConnection.query(
              `select * from reservations where curdate() <= reserved_from or  reserved_to AND item_id = '${req.body.id}'`,
              async function (err, result, fields) {
                if (err) throw err
                if (result.id) {
                  res.status(201).send('Wypożyczenie w przyszłości!')
                } else {
                  try {
                    await dbConnection.query(
                      `DELETE FROM items WHERE id = ${req.body.id}`,
                      async function (err, result, fields) {
                        if (err) throw err
                        if (result.affectedRows >= 1) {
                          res.status(200).send('Pomyślnie usunięto!')
                        } else {
                          res
                            .status(400)
                            .send('Wystąpił błąd podczas usuwania!')
                        }
                      },
                    )
                  } catch (error) {
                    console.log(error)
                  }
                }
              },
            )
          } catch (error) {
            console.log(error)
          }
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.getalldates = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT reserved_from,reserved_to FROM reservations`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          let temp = []
          for (let i = 0; i < result.length; i++) {
            let xd = getDays(result[i].reserved_from, result[i].reserved_to)
            temp.push(...xd)
            // Object.assign(temp, xd)
          }
          // console.log(temp)
          uniq = [...new Set(temp)]
          res.status(200).send(uniq)
        } else {
          res.status(400).send('Wystąpił błąd podczas usuwania!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.getlistofreserv = async (req, res, next) => {
  let temp
  if (req.body.id == -1 || req.body.id == 0) {
    temp = ''
  } else {
    temp = `WHERE temp.item_id = '${req.body.id}'`
  }
  try {
    await dbConnection.query(
      `SELECT x.*,students.name_surname,students.document,students.info,students.klasa  FROM (SELECT temp.*,items.name AS itemname FROM (select * from reservations where (reserved_from BETWEEN '${req.body.from}' AND '${req.body.to}') OR (reserved_to BETWEEN '${req.body.from}' AND '${req.body.to}') ) AS temp LEFT JOIN items ON items.id = temp.item_id ${temp}) as x LEFT JOIN students ON students.id = x.item_id;`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.status(200).send(result)
        } else {
          res.status(400).send('Wystąpił błąd!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.selectfromcat = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT * from items WHERE category = ${dbConnection.escape(
        req.body.name,
      )}`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.status(200).send(result)
        } else {
          res.status(400).send('Wystąpił błąd!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.checkifiteminstorage = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT na_stanie from items WHERE id = ${req.body.id}`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.status(200).send(result)
        } else {
          res.status(400).send('Wystąpił błąd!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.getgroups = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT * from items WHERE category = ${dbConnection.escape(
        req.body.name,
      )}`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.status(200).send(result)
        } else {
          res.status(400).send('Wystąpił błąd!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.sendemail = async (req, res, next) => {
  message = {
    from: process.env.EMAIL_LOGIN,
    to: `${req.body.email}`,
    subject: `${JSON.parse(req.body.temat)}`,
    text: `${JSON.parse(req.body.tresc)}`,
  }
  nodemailer.sendMail(message, function (err, info) {
    if (err) {
      console.log(err)
      res.status(201).send(err.response)
    } else {
      console.log(info)
      res.status(200).send('Wiadomość została wysłana')
    }
  })
}

exports.sendemailinfo = async (req, res, next) => {
  message = {
    from: process.env.EMAIL_LOGIN,
    to: process.env.EMPLOYER_EMAIL,
    subject: `Powiadomienie o chęci wypożyczeia`,
    html: `<p>Uczeń <b>${JSON.parse(
      req.body.dane,
    )}</b> wyraził chęć wypożyczenia <b>${JSON.parse(
      req.body.item,
    )}</b></p><p><br>Wiadomość od Ucznia:<br>${JSON.parse(req.body.tresc)}</p>`,
    //text: `${JSON.parse(req.body.tresc)}`,
  }
  nodemailer.sendMail(message, function (err, info) {
    if (err) {
      console.log(err)
      res.status(201).send(err.response)
    } else {
      console.log(info)
      res.status(200).send('Wiadomość została przekazana do pracownika')
    }
  })
}

exports.selectstudentsfromclass = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT * from students WHERE klasa = ${dbConnection.escape(
        req.body.klasa,
      )}`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.status(200).send(result)
        } else {
          res.status(400).send('Wystąpił błąd!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.getlistofreservAll = async (req, res, next) => {
  let temp
  if (req.body.id == 0) {
    temp = ''
  } else {
    temp = `WHERE temp.item_id = '${req.body.id}'`
  }
  try {
    await dbConnection.query(
      `SELECT temp.*,items.name AS itemname FROM (select * from reservations where (reserved_from BETWEEN '${req.body.from}' AND '${req.body.to}') OR (reserved_to BETWEEN '${req.body.from}' AND '${req.body.to}')) AS temp LEFT JOIN items ON items.id = temp.item_id ${temp} AND temp.stan = 0;`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.status(200).send(result)
        } else {
          res.status(400).send('Wystąpił błąd podczas usuwania!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.singleinfores = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT * FROM items WHERE id ='${req.body.id}'`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.status(200).send(result)
        } else {
          res.status(400).send('Wystąpił błąd podczas pobierania danych!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.getallCat = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT * FROM categories`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.status(200).send(result)
        } else {
          res.status(400).send('Wystąpił błąd podczas pobierania danych!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.updateCat = async (req, res, next) => {
  try {
    await dbConnection.query(
      `UPDATE categories SET category = ${dbConnection.escape(
        req.body.val,
      )}  WHERE id = ${dbConnection.escape(req.body.id)}`,
      function (err, result, fields) {
        if (err) throw err
        if (result.affectedRows >= 1) {
          res.status(200).send('Pomyślnie edytowano!')
        } else {
          res.status(400).send('Wystąpił błąd podczas edycji')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.getSpecRes = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT * FROM (SELECT reservations.stan,reservations.email,reservations.reminder,reservations.reserved_from,reservations.reserved_to,reservations.add_info,reservations.id_student,items.id AS item_id ,items.name,items.code,items.extended_name,items.addon_info,items.category FROM reservations LEFT JOIN items ON items.id = reservations.item_id WHERE reservations.id = '${req.body.id}' ) as temp LEFT JOIN students ON students.id = temp.id_student`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          res.status(200).send(result)
        } else {
          res.status(400).send('Wystąpił błąd podczas usuwania!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.delSpecRes = async (req, res, next) => {
  try {
    await dbConnection.query(
      `DELETE FROM reservations WHERE id = ${req.body.id}`,
      async function (err, result, fields) {
        if (err) throw err
        if (result.affectedRows >= 1) {
          try {
            await dbConnection.query(
              `UPDATE items SET na_stanie = '1' WHERE id = ${req.body.id_item}`,
              function (err, result, fields) {
                if (err) throw err
                if (result.affectedRows >= 1) {
                  res.status(200).send('Pomyślnie usunięto!')
                } else {
                  res.status(400).send('Wystąpił błąd podczas edycji')
                }
              },
            )
          } catch (error) {
            console.log(error)
          }
        } else {
          res.status(400).send('Wystąpił błąd podczas usuwania!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.deleteCat = async (req, res, next) => {
  try {
    await dbConnection.query(
      `DELETE FROM categories WHERE id = ${req.body.id}`,
      async function (err, result, fields) {
        if (err) throw err
        if (result.affectedRows >= 1) {
          res.status(200).send('Pomyślnie usunięto!')
        } else {
          res.status(400).send('Wystąpił błąd podczas usuwania!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.removestudent = async (req, res, next) => {
  try {
    await dbConnection.query(
      `DELETE FROM students WHERE id = ${req.body.id}`,
      async function (err, result, fields) {
        if (err) throw err
        if (result.affectedRows >= 1) {
          res.status(200).send('Pomyślnie usunięto!')
        } else {
          res.status(400).send('Wystąpił błąd podczas usuwania!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

exports.getAvaDates = async (req, res, next) => {
  try {
    await dbConnection.query(
      `SELECT reserved_from,reserved_to FROM reservations WHERE item_id = ${req.body.id} AND stan = 0`,
      function (err, result, fields) {
        if (err) throw err
        if (result) {
          let temp = []
          for (let i = 0; i < result.length; i++) {
            let xd = getDays(result[i].reserved_from, result[i].reserved_to)
            temp.push(...xd)
            // Object.assign(temp, xd)
          }
          // console.log(temp)
          res.status(200).send(temp)
        } else {
          res.status(400).send('Wystąpił błąd podczas usuwania!')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}

function getDays(startDate, endDate) {
  var dates = []
  var currDate = moment(startDate).startOf('day')
  var lastDate = moment(endDate).startOf('day')
  /*  console.log(currDate.add(1, 'days').toDate())
  console.log(lastDate.subtract(1, 'days').toDate()) */
  let tempCurr = currDate
  let tempLast = lastDate
  dates.push(moment(tempCurr.toDate()).format('DD-MM-YYYY'))
  while (currDate.add(1, 'days').diff(lastDate) < 0) {
    dates.push(moment(currDate.clone()).format('DD-MM-YYYY'))
    // console.log(currDate.clone().toDate())
  }
  dates.push(moment(tempLast).format('DD-MM-YYYY'))
  return dates
}

exports.addnewreservation = async (req, res, next) => {
  try {
    await dbConnection.query(
      `INSERT INTO reservations(item_id, id_student, email, reminder, reserved_from, reserved_to, add_info) VALUES (${dbConnection.escape(
        req.body.item_id,
      )},${dbConnection.escape(req.body.id_student)},${dbConnection.escape(
        req.body.email,
      )},${dbConnection.escape(req.body.reminder)},${dbConnection.escape(
        req.body.reserved_from,
      )},${dbConnection.escape(req.body.reserved_to)},${dbConnection.escape(
        req.body.add_info,
      )})`,
      async function (err, result, fields) {
        if (err) throw err
        if (result.affectedRows >= 1) {
          try {
            await dbConnection.query(
              `UPDATE items SET na_stanie = '0' WHERE id = '${req.body.item_id}'`,
              function (err, result, fields) {
                if (err) throw err
                if (result.affectedRows >= 1) {
                  res.status(200).send('Pomyślnie dodano wypożyczenie!')
                } else {
                  res.status(400).send('Wystąpił błąd podczas dodawania')
                }
              },
            )
          } catch (error) {
            console.log(error)
          }
        } else {
          res.status(400).send('Wystąpił błąd podczas dodawania')
        }
      },
    )
  } catch (error) {
    console.log(error)
  }
}
