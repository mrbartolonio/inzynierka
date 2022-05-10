function updateDB(val, id) {
  $.ajax({
    url: '/updateCat',
    type: 'POST',
    data: {id: id, val: val},
    success: function (result) {
      $.notify(`${result}`, {
        align: 'right',
        color: '#fff',
        background: '#20D67B',
      })
      $('#cat_' + id).text(val)
      $('#exampleModal').modal('hide')
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

function remove(id) {
  $.confirm({
    title: 'Uwaga!',
    content: `Czy jesteś pewny/a, że chcesz usunąć kategorię?</span>`,
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
            url: '/deleteCat',
            type: 'POST',
            data: {id: id},
            success: function (result) {
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
        },
      },
    },
  })
}

function add() {
  if ($('#toAdd').val()) {
    $.ajax({
      url: '/insertCat',
      type: 'POST',
      data: {name: $('#toAdd').val()},
      success: function (result) {
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
  } else {
    $.notify(`Nazwa nie może być pusta!`, {
      align: 'center',
      color: '#fff',
      background: '#D44950',
    })
  }
}

function edit(id) {
  $('.disp_name').val(
    $('#cat_' + id)
      .text()
      .trim(),
  )
  $('.disp_id').val(id)
  $('#exampleModal').modal('show')
}

$('.saveModal').on('click', function (event) {
  updateDB($('.disp_name').val(), $('.disp_id').val())
})
