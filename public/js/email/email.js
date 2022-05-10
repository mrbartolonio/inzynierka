$(window).on('load', function () {
  $('.selectEmail').select2({
    tags: true,
  })
})

$('.sendEmail').on('click', function (event) {
  if (
    $('.selectEmail option:selected').text() == 'Wybierz email' ||
    $('#temat').val() == '' ||
    $('#tresc').val() == ''
  ) {
    $.notify(`Uzupełnij wszystkie pola`, {
      align: 'center',
      color: '#fff',
      background: '#FFA500',
    })
  } else {
    if (isValidEmailAddress($('.selectEmail option:selected').text())) {
      $.ajax({
        url: '/sendemail',
        type: 'POST',
        data: {
          email: `${$('.selectEmail option:selected').text()}`,
          temat: `${JSON.stringify($('#temat').val())}`,
          tresc: `${JSON.stringify($('#tresc').val())}`,
        },
        success: async function (result, temp1, temp2) {
          if (temp2.status !== 200) {
            $.notify(`${result}`, {
              align: 'center',
              color: '#fff',
              background: '#D44950',
            })
          } else {
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
    } else {
      $.notify(`Adres email jest niepoprawny`, {
        align: 'center',
        color: '#fff',
        background: '#FFA500',
      })
    }
  }
})

function isValidEmailAddress(emailAddress) {
  var pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i)
  // alert( pattern.test(emailAddress) );
  return pattern.test(emailAddress)
}
