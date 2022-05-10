$('.readfile').on('click', function () {
  $.ajax({
    url: '/getallCat',
    type: 'POST',
    success: function () {
      let selectedFile = $('#fileUpload').prop('files')[0]
      if (!selectedFile) {
        $.notify(`Wybierz plik do wczytania!`, {
          align: 'center',
          color: '#fff',
          background: '#D44950',
        })
      } else {
        var reader = new FileReader()

        if (reader.readAsBinaryString) {
          reader.onload = function (e) {
            let data = event.target.result
            let workbook = XLSX.read(data, {
              type: 'binary',
            })
            workbook.SheetNames.forEach((sheet) => {
              let rowObject = XLSX.utils.sheet_to_row_object_array(
                workbook.Sheets[sheet],
              )
              let jsonObject = JSON.stringify(rowObject)
              displayDataToSite(rowObject)
            })
          }
          reader.readAsBinaryString(selectedFile)
        }
      }
    },
    error: function (err) {
      $.notify(`Error: ${err.statusText}`, {
        align: 'right',
        color: '#fff',
        background: '#D44950',
      })
      // check the err for error details
    },
  }) // ajax call closing
})

$('#fileUpload').on('change', function () {
  //get the file name
  var fileName = $(this).val()
  //replace the "Choose a file" label
  $(this).next('.custom-file-label').html(fileName.split('\\').pop())
})

function displayDataToSite(data) {
  let temp = ``
  for (let i = 0; i < data.length; i++) {
    console.log(data[i])
    temp += `<div class="toadd"><div class="col thin"> <input style="outline: none; width: 100%" type="text" class="text-input" name="name_surname" placeholder="Imię i Nazwisko" value='${data[i]['Imie_Nazwisko']}'/></div><div class="col thin newrow"><input style="outline: none; width: 100%" type="text" class="text-input" name="doc" placeholder="PESEL" value='${data[i]['PESEL']}'/></div><div class="col thin newrow"><input style="outline: none; width: 100%" type="text" class="text-input" name="class" placeholder="Klasa" value='${data[i]['klasa']}'/></div><div class="col thin newrow"> <input style="outline: none; width: 100%" class="text-input" name="addon" placeholder="Dodatkowe" value='${data[i]['opis']}'/></div></div>`
  }
  $.notify(`Wczytano ${data.length} elementów z pliku!`, {
    align: 'center',
    color: '#fff',
    background: '#2196f3',
  })
  $('.row').empty()
  $('.row').append(temp)
}

$('.addRow').on('click', function (event) {
  let temp = ` <div class="toadd"> <div class="col thin"> <input style="outline: none; width: 100%" type="text" class="text-input" name="name_surname" placeholder="Imię i Nazwisko" /> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" type="text" class="text-input" name="doc" placeholder="PESEL" /> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" type="text" class="text-input" name="class" placeholder="Klasa" /> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" class="text-input" name="addon" placeholder="Dodatkowe"/></div> </div>`
  $('.row').append(temp)
})

$('.addDB').on('click', function (event) {
  let data = []
  let empty = false
  $('.toadd').each(function (e) {
    let temp = {}
    $(this)
      .find(':input')
      .each(function (x) {
        temp[this.name] = this.value
        if (this.value == '' && this.name != 'desc') {
          empty = true
        }
      })
    data.push(temp)
  })
  if (empty) {
    $.notify(`Uzupełnij wszystkie pola!`, {
      align: 'right',
      color: '#fff',
      background: '#D44950',
    })
  } else {
    $.ajax({
      url: '/addstudent',
      type: 'POST',
      data: {data: JSON.stringify(data)},
      success: function (result) {
        $.notify(`${result}`, {
          align: 'right',
          color: '#fff',
          background: '#20D67B',
        })
        $('.row').empty()
        let data = ` <div class="toadd"> <div class="col thin"> <input style="outline: none; width: 100%" type="text" class="text-input" name="name_surname" placeholder="Imię i Nazwisko" /> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" type="text" class="text-input" name="doc" placeholder="PESEL" /> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" type="text" class="text-input" name="class" placeholder="Klasa" /> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" class="text-input" name="addon" placeholder="Dodatkowe"/></div> </div>`
        $('.row').append(data)
      },
      error: function (err) {
        $.notify(`Error: ${err.statusText}`, {
          align: 'right',
          color: '#fff',
          background: '#D44950',
        })
        // check the err for error details
      },
    }) // ajax call closing
  }
})
