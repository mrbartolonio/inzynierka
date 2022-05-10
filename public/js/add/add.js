let Categories
$(window).on('load', function () {
  $.ajax({
    url: '/getallCat',
    type: 'POST',
    success: function (result) {
      Categories = result
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

$('.addRow').on('click', function (event) {
  let temp = `<div class="toadd"> <div class="col thin"> <input style="outline: none; width: 100%" type="text" class="text-input" name="name" placeholder="Nazwa" /> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" type="text" class="text-input" name="code" placeholder="Kod produktu" /> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" type="text" class="text-input" name="info" placeholder="Informacje" /> </div> <div class="col thin newrow"> <textarea style="outline: none; width: 100%" class="text-input" name="desc" placeholder="Opis" rows="1"></textarea> </div><div class="col thin newrow"><select name="cat" class="custom-select" id="selectItem">`
  for (let ix = 0; ix < Categories.length; ix++) {
    temp += `<option value="${Categories[ix].id}">${Categories[ix].category}</option>`
  }
  temp += `</select> </div> </div>`
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
      url: '/additems',
      type: 'POST',
      data: {data: JSON.stringify(data)},
      success: function (result) {
        $.notify(`${result}`, {
          align: 'right',
          color: '#fff',
          background: '#20D67B',
        })
        $('.row').empty()
        let data = `<div class="toadd"> <div class="col thin"> <input style="outline: none; width: 100%" type="text" class="text-input" name="name" placeholder="Nazwa" /> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" type="text" class="text-input" name="code" placeholder="Kod produktu" /> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" type="text" class="text-input" name="info" placeholder="Informacje" /> </div> <div class="col thin newrow"> <textarea style="outline: none; width: 100%" class="text-input" name="desc" placeholder="Opis" rows="1"></textarea> </div><div class="col thin newrow"><select name="cat" class="custom-select" id="selectItem">`
        for (let ix = 0; ix < Categories.length; ix++) {
          data += `<option value="${Categories[ix].id}">${Categories[ix].category}</option>`
        }
        data += `</select> </div> </div>`

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

$('.readfile').on('click', function () {
  $.ajax({
    url: '/getallCat',
    type: 'POST',
    success: function (result) {
      let selectedFile = $('#fileUpload').prop('files')[0]
      if (!selectedFile) {
        $.notify(`Wybierz plik do wczytania!`, {
          align: 'center',
          color: '#fff',
          background: '#D44950',
        })
      } else {
        $('.row').empty()
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
              displayDataToSite(rowObject, result)
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

function displayDataToSite(data, Cat) {
  let temp = ``
  let stop = false
  let notfind = ''
  for (let i = 0; i < data.length; i++) {
    let xd = Cat.find(function (post, index) {
      if (post.category == data[i]['Kategoria']) return true
    })
    if (!xd) {
      stop = true
      notfind = data[i]['Kategoria']
      break
    }
    temp += `<div class="toadd"> <div class="col thin"> <input style="outline: none; width: 100%" type="text" class="text-input" name="name" placeholder="Nazwa" value="${data[i]['Nazwa']}"/> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" type="text" class="text-input" name="code" placeholder="Kod produktu" value="${data[i]['Kod']}"/> </div> <div class="col thin newrow"> <input style="outline: none; width: 100%" type="text" class="text-input" name="info" placeholder="Informacje" value="${data[i]['Informacje']}"/> </div> <div class="col thin newrow"> <textarea style="outline: none; width: 100%" class="text-input" name="desc" placeholder="Opis" rows="1">${data[i]['Opis']}</textarea> </div> <div class="col thin newrow"><select name="cat" class="custom-select" id="selectItem">`
    for (let ix = 0; ix < Categories.length; ix++) {
      temp += `<option ${
        Categories[ix].category == data[i]['Kategoria'] ? 'selected' : ''
      }value="${Categories[ix].id}">${Categories[ix].category}</option>`
    }
    temp += `</select></div> </div>`
  }
  $.notify(`Wczytano ${data.length} elementów z pliku!`, {
    align: 'center',
    color: '#fff',
    background: '#2196f3',
  })
  if (!stop) {
    $('.row').empty()
    $('.row').append(temp)
  } else {
    $.notify(`Nie znaleziono kategorii: ${notfind}`, {
      align: 'center',
      color: '#fff',
      background: '#D44950',
    })
  }
}

$('#fileUpload').on('change', function () {
  //get the file name
  var fileName = $(this).val()
  //replace the "Choose a file" label
  $(this).next('.custom-file-label').html(fileName.split('\\').pop())
})
