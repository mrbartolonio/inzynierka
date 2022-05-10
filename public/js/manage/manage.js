let students
$(document).ready(function () {
  $.ajax({
    url: '/getalldates',
    type: 'POST',
    success: function (result) {
      if (result) {
        $('#datetopick').daterangepicker(
          {
            showDropdowns: true,
            showWeekNumbers: true,
            locale: {
              format: 'YYYY-MM-DD',
              separator: ' do ',
              applyLabel: 'Wybierz',
              cancelLabel: 'Anuluj',
              fromLabel: 'Od',
              toLabel: 'Do',
              customRangeLabel: 'Custom',
              weekLabel: 'W',
              daysOfWeek: ['Nie', 'Pon', 'Wt', 'Śr', 'Czw', 'Pi', 'So'],
              monthNames: [
                'Styczeń',
                'Luty',
                'Marzec',
                'Kwiecień',
                'Maj',
                'Czerwiec',
                'Lipiec',
                'Sierpień',
                'Wrzesień',
                'Październik',
                'Listopad',
                'Grudzień',
              ],
              firstDay: 1,
            },
            alwaysShowCalendars: true,
            opens: 'center',
            isInvalidDate: function (date) {
              let tempDataPicker = moment(date._d).format('DD-MM-YYYY')
              let xd = result.map((x) => x === tempDataPicker)
              if (!xd.includes(true)) {
                return true
              }
            },
          },
          function (start, end, label) {},
        )
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

$('.searchInDB').on('click', function () {
  let dates = $('#datetopick').val().split('do')
  $.ajax({
    url: '/getlistofreserv',
    type: 'POST',
    data: {
      id: `${$('#selectItem option:selected').attr('value')}`,
      from: `${dates[0]}`,
      to: `${dates[1]}`,
    },
    success: async function (result) {
      if (result.length == 0) {
        $('.toAddTable').empty()
        $('#search').hide()
        $('.toAddTable').append(
          `<h2 style="text-align:center;">Brak wypożyczeń w danym terminie</h2>`,
        )
      } else {
        $('.toAddTable').empty()
        let temp = `<table class="table"><thead><tr><th scope="col">ID <i class="fa fa-sort" aria-hidden="true"></i></th><th scope="col">status <i class="fa fa-sort" aria-hidden="true"></i></th><th scope="col">Data  <i class="fa fa-sort" aria-hidden="true"></i></th><th scope="col">Imie i nazwisko  <i class="fa fa-sort" aria-hidden="true"></i></th><th scope="col">Przedmiot  <i class="fa fa-sort" aria-hidden="true"></i></th><th scope="col"></th></tr></thead><tbody>`
        for (let i = 0; i < result.length; i++) {
          var new_date = moment(result[i].reserved_to, 'YYYY-MM-DD').add(
            2,
            'days',
          )

          let date = moment(result[i].reserved_to).format('YYYY-MM-DD')
          let now = moment(moment()).format('YYYY-MM-DD')
          let grey = ''
          if (now >= date) {
            grey = 'style="color:grey;"'
          }

          temp += `<tr id="tr_${result[i].id}"><td ${grey}>${
            result[i].id
          }</td><td ${grey} id="stan_${result[i].id}">${
            result[i].stan == 1 ? 'Zakończona' : 'W trakcie'
          }</td><td ${grey}>${moment(result[i].reserved_from).format(
            'YYYY-MM-DD',
          )} - ${moment(new_date).format(
            'YYYY-MM-DD',
          )}</td><td ${grey}id="imnaz_${result[i].id}">${
            result[i].name_surname
          }</td><td ${grey}>${
            result[i].itemname ? result[i].itemname : 'Przedmiot usunięty'
          }</td><td><button style="outline:none" onclick="show(${
            result[i].id
          },${
            now >= date ? true : false
          })" class="button raised bg-blue-500 color-white">Wyświetl</button></td></tr>`
        }

        temp += `</tbody></table>`
        $('#search').show()
        $('.toAddTable').append(temp)
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

$('#search').keyup(function () {
  var value = this.value.toLowerCase().trim()

  $('table tr').each(function (index) {
    if (!index) return
    $(this)
      .find('td')
      .each(function () {
        var id = $(this).text().toLowerCase().trim()
        var not_found = id.indexOf(value) == -1
        $(this).closest('tr').toggle(!not_found)
        return not_found
      })
  })
})

$(document).on('click', 'th', function () {
  var table = $(this).parents('table').eq(0)
  var rows = table
    .find('tr:gt(0)')
    .toArray()
    .sort(comparer($(this).index()))
  this.asc = !this.asc
  if (!this.asc) {
    rows = rows.reverse()
  }
  for (var i = 0; i < rows.length; i++) {
    table.append(rows[i])
  }
})

function comparer(index) {
  return function (a, b) {
    var valA = getCellValue(a, index),
      valB = getCellValue(b, index)
    return $.isNumeric(valA) && $.isNumeric(valB)
      ? valA - valB
      : valA.toString().localeCompare(valB)
  }
}
function getCellValue(row, index) {
  return $(row).children('td').eq(index).text()
}

function show(id, styl) {
  $.ajax({
    url: '/getSpecRes',
    type: 'POST',
    data: {
      id: id,
    },
    success: function (result) {
      var new_date = moment(result[0].reserved_to, 'YYYY-MM-DD').add(2, 'days')
      $('#idToDelete').val(id)
      $('.disp_name').val(result[0].name)
      $('.disp_kod').val(result[0].code)
      $('.disp_kategoria').val(result[0].category)
      $('.disp_informacje').val(result[0].extended_name)
      $('.disp_opis_item').val(result[0].addon_info)
      $('.disp_name_surname').val(result[0].name_surname)
      $('.disp_email').val(result[0].email)
      $('#email_check').prop('checked', result[0].reminder)
      $('.disp_klasa').val(result[0].klasa)
      $('.disp_nr').val(result[0].document)
      $('.disp_add_info').val(result[0].info)
      $('.disp_from').val(moment(result[0].reserved_from).format('YYYY-MM-DD'))
      $('.disp_to').val(moment(new_date).format('YYYY-MM-DD'))
      $('#item_id').val(result[0].item_id)

      if (result[0].stan == '1') {
        $('.endModal').attr('disabled', true)
      } else {
        $('.endModal').attr('disabled', false)
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

  $('#modalEdit').modal('show')
}

$('.delModal').on('click', function () {
  $.confirm({
    title: 'Uwaga!',
    content: `Czy jesteś pewny/a, że chcesz usunąć wypożyczenie?</span>`,
    buttons: {
      cancel: {
        text: 'Nie!',
        btnClass: 'btn-blue',
        keys: ['esc'],
      },
      somethingElse: {
        text: 'Usuń!',
        btnClass: 'btn-red',
        keys: ['enter', 'shift'],
        action: function () {
          $.ajax({
            url: '/delSpecRes',
            type: 'POST',
            data: {
              id: $('#idToDelete').val(),
              id_item: $('#item_id').val(),
            },
            success: function (result) {
              $('#tr_' + $('#idToDelete').val()).remove()
              $('#modalEdit').modal('hide')
              $.notify(`${result}`, {
                align: 'right',
                color: '#fff',
                background: '#20D67B',
              })
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
        },
      },
    },
  })
})

$('.endModal').on('click', function () {
  $.confirm({
    title: 'Uwaga!',
    content: `Czy jesteś pewny/a, że chcesz zakończyć wypożyczenie?</span>`,
    buttons: {
      cancel: {
        text: 'Nie!',
        btnClass: 'btn-blue',
        keys: ['esc'],
      },
      somethingElse: {
        text: 'Tak!',
        btnClass: 'btn-red',
        keys: ['enter', 'shift'],
        action: function () {
          $.ajax({
            url: '/endwypozyczenie',
            type: 'POST',
            data: {
              id_res: $('#idToDelete').val(),
              id_item: $('#item_id').val(),
            },
            success: function (result) {
              $('#stan_' + $('#idToDelete').val()).text('Zakończona')
              $('.endModal').prop('disabled', false)
              $('#modalEdit').modal('hide')
              $.notify(`${result}`, {
                align: 'right',
                color: '#fff',
                background: '#20D67B',
              })
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
        },
      },
    },
  })
})

$('.selectCat').on('change', function (event) {
  if (this.value !== -1) {
    $.ajax({
      url: '/selectfromcat',
      type: 'POST',
      data: {
        name: $(this).find('option:selected').text(),
      },
      success: async function (result) {
        $('.items').empty()
        let temp = ` <label>Przedmiot</label><select  class="custom-select selectItemSearch" id="selectItem"><option value="-1" selected disabled>Wybierz przedmiot</option><option value="0" selected>᲼᲼</option>`
        for (let i = 0; i < result.length; i++) {
          temp += `<option value="${result[i].id}">${result[i].name} - ${result[i].extended_name}</option>`
        }
        temp += `</select>`
        $('.items').append(temp)
        $('.selectItemSearch').select2()
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
