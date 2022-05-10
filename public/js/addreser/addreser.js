let students
$(document).on('change', '#selectItem', function () {
  $('.toAddData').hide()
  $.ajax({
    url: '/singleinfores',
    type: 'POST',
    data: {
      id: `${$('#selectItem option:selected').attr('value')}`,
    },
    success: async function (result) {
      $('#kod').val(result[0].code)
      $('#ext').val(result[0].extended_name)
      $('.infotoDis').show()
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

  $.ajax({
    url: '/getAvaDates',
    type: 'POST',
    data: {id: $('#selectItem option:selected').attr('value')},
    success: function (result) {
      $('#datetopick').daterangepicker(
        {
          showDropdowns: true,
          showWeekNumbers: true,
          locale: {
            format: 'DD/MM/YYYY',
            separator: ' - ',
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
          minDate: `${moment(moment()).format('DD/MM/YYYY')}`,
          opens: 'center',
          isInvalidDate: function (date) {
            let tempDataPicker = moment(date._d).format('DD-MM-YYYY')
            for (let i = 0; i < result.length; i++) {
              if (tempDataPicker == result[i]) {
                return true
              }
            }
          },
        },
        function (start, end, label) {
          $('#startDate').val(start.format('YYYY-MM-DD'))
          $('#endDate').val(end.format('YYYY-MM-DD'))
          $('.toAddData').show()
          $('.addNewRes').attr('disabled', true)
        },
      )
      $('#datetopick').removeAttr('disabled')
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

$('.addNewRes').on('click', function () {
  $.ajax({
    url: '/checkifiteminstorage',
    type: 'POST',
    data: {
      id: `${$('#selectItem option:selected').attr('value')}`,
    },
    success: async function (result) {
      if (result[0].na_stanie == 0) {
        $.notify(
          `Nie możesz utworzyć wypożyczenia, przedmiotu nie ma w magazynie`,
          {
            align: 'center',
            color: '#fff',
            background: '#FFA500',
          },
        )
      } else {
        $.ajax({
          url: '/addnewreservation',
          type: 'POST',
          data: {
            item_id: `${$('#selectItem option:selected').attr('value')}`,
            id_student: `${$('.studentlist').find('option:selected').val()}`,
            email: `${$('#email').val()}`,
            reminder: `${$('#email_check').is(':checked') ? 1 : 0}`,
            reserved_from: `${$('#startDate').val()}`,
            reserved_to: `${$('#endDate').val()}`,
            add_info: `${$('.uwagi').val()}`,
          },
          success: async function (result) {
            $('.toAddData').hide()
            $.notify(`${result}`, {
              align: 'right',
              color: '#fff',
              background: '#20D67B',
            })
            await delay(1000)
            location.reload()
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
})

$('#email_check').change(function () {
  if (this.checked) {
    if ($('#email').val() == '') {
      $(this).prop('checked', false)
      $.notify(`Nie możesz włączyć powiadomienia bez podania adresu E-mail!`, {
        align: 'right',
        color: '#fff',
        background: '#D44950',
      })
    }
  }
  $('#textbox1').val(this.checked)
})

const delay = async (millis) =>
  new Promise((resolve, reject) => {
    setTimeout((_) => resolve(), millis)
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
        let temp = ` <select  class="custom-select selectItemSearch" id="selectItem"><option value="-1" selected disabled>Wybierz przedmiot</option>`
        for (let i = 0; i < result.length; i++) {
          temp += `<option value="${result[i].id}">${result[i].name} - ${result[i].extended_name}</option>`
        }
        temp += `</select>`
        $('.items').append(temp)
        $('.selectItemSearch').select2()
        $('#datetopick').attr('disabled', true)
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

$(document).on('change', '.selectKlasa', function () {
  if (this.value !== -1) {
    $.ajax({
      url: '/selectstudentsfromclass',
      type: 'POST',
      data: {
        klasa: $(this).find('option:selected').text(),
      },
      success: async function (result) {
        students = result
        let temp = ` <select  class="custom-select studentlist"><option value="-1" selected disabled>Wybierz ucznia</option>`
        for (let i = 0; i < result.length; i++) {
          temp += `<option value="${result[i].id}">${result[i].name_surname}</option>`
        }
        temp += `</select>`
        $('.student').empty()
        $('.student').append(temp)
        $('.studentlist').select2()
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

$(document).on('change', '.studentlist', function () {
  let id = this.value
  if (students && id !== -1) {
    let temp = students.find(function (data, index) {
      if (data.id == id) return data
    })
    $('#doc').val(temp.document)
    $('#add_info').val(temp.info)
    $('.addNewRes').attr('disabled', false)
  }
})
