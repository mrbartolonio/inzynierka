$(document).ready(function () {
  $('.selectItemSearch').select2()
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
      minDate: `${moment(moment()).format('YYYY-MM-DD')}`,
      opens: 'center',
      /*       isInvalidDate: function (date) {
        let tempDataPicker = moment(date._d).format('DD-MM-YYYY')
        let xd = result.map((x) => x === tempDataPicker)
        if (!xd.includes(true)) {
          return true
        }
      }, */
    },
    function (start, end, label) {},
  )
})

$('.searchInDB').on('click', function () {
  if ($('#selectItem option:selected').attr('value') !== '-1') {
    let dates = $('#datetopick').val().split('do')

    $.ajax({
      url: '/checkifiteminstorageall',
      type: 'POST',
      data: {
        id: `${$('#selectItem option:selected').attr('value')}`,
      },
      success: async function (result) {
        if (result[0].na_stanie == 0) {
          $.notify(`Brak wolnego terminu!`, {
            align: 'center',
            color: '#fff',
            background: '#D44950',
          })
          $('.toAddTable').empty()

          $('.toAddTable').append(
            `<h2 style="text-align:center;">Brak terminów!</h2>`,
          )
        } else {
          $.ajax({
            url: '/getlistofreservAll',
            type: 'POST',
            data: {
              id: `${$('#selectItem option:selected').attr('value')}`,
              from: `${dates[0]}`,
              to: `${dates[1]}`,
            },
            success: async function (result) {
              if (result.length == 0) {
                $.notify(`Znaleziono wolny termin!`, {
                  align: 'center',
                  color: '#fff',
                  background: '#2196f3',
                })
                $('.toAddTable').empty()

                $('.toAddTable').append(
                  `<h2 style="text-align:center;">Powiadom nas o tym, że chcesz wypożyczyć daną rzecz! <br> Wypełnij imię i nazwisko oraz kiedy będziesz wypożyczyć przedmiot. Następnie wyślij zgłoszenie!</h2><div class="col-sm-12"> <label>Imię i nazwisko:</label ><input id="dane" style="outline: none; width: 100%; margin-bottom: 30px" type="text" class="text-input" placeholder="Podaj imię i nazwisko" /> </div> <div class="col-sm-12"> <label>Podaj kiedy nas odwiedzisz aby wypożyczyć przedmiot</label ><textarea id="tresc" style="height: 200px; width: 100%" class="custom-input" placeholder="Podaj informacje" ></textarea><div class="col thin add"><div class="cent"><button class="fab bg-blue-500 color-white sendEmail"><i class="icon-send"></i></button></div></div></div>`,
                )
              } else {
                $.notify(`Brak wolnego terminu!`, {
                  align: 'center',
                  color: '#fff',
                  background: '#D44950',
                })
                $('.toAddTable').empty()

                $('.toAddTable').append(
                  `<h2 style="text-align:center;">Brak terminów!</h2>`,
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
  }
})

$('.selectCat').on('change', function (event) {
  if (this.value !== -1) {
    $.ajax({
      url: '/selectfromcatall',
      type: 'POST',
      data: {
        name: $(this).find('option:selected').text(),
      },
      success: async function (result) {
        $('.items').empty()
        let temp = ` <label>Przedmiot</label><select  class="custom-select selectItemSearch" id="selectItem"><option value="-1" selected disabled>Wybierz przedmiot</option>`
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

$(document).on('click', '.sendEmail', function () {
  if (
    $('#dane').val() == '' ||
    $('#dane').val().length < 5 ||
    $('#tresc').val() == '' ||
    $('#tresc').val().length < 5
  ) {
    $.notify(`Wypełnij pola!`, {
      align: 'center',
      color: '#fff',
      background: '#D44950',
    })
  } else {
    $.ajax({
      url: '/sendemailinfo',
      type: 'POST',
      data: {
        dane: `${JSON.stringify($('#dane').val())}`,
        tresc: `${JSON.stringify($('#tresc').val())}`,
        item: `${JSON.stringify($('#selectItem option:selected').text())}`,
      },
      success: async function (result, temp1, temp2) {
        if (temp2.status !== 200) {
          $.notify(`${result}`, {
            align: 'center',
            color: '#fff',
            background: '#D44950',
          })
        } else {
          $('.toAddTable').empty()
          $.notify(`${result}`, {
            align: 'center',
            color: '#fff',
            background: '#20D67B',
          })
        }
      },
      error: function (err) {
        $.notify(`Error: ${err.statusText}`, {
          align: 'center',
          color: '#fff',
          background: '#D44950',
        })
        // check the err for error details
      },
    }) // ajax call closing
  }
})
