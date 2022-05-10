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

$('th').click(function () {
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

function remove(id) {
  $.confirm({
    title: 'Uwaga!',
    content: `Czy jesteś pewny/a, że chcesz usunąć studenta: <span style="font-weight:600;">${$(
      '#name_' + id,
    ).text()}?</span>`,
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
            url: '/removestudent',
            type: 'POST',
            data: {id: id},
            success: function (result, code, xxx) {
              $('#tr_' + id).remove()
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
}

function edit(id) {
  $('.modal-title').html(
    `<span style="font-weight:400;">${$('#name_' + id).text()}</span>`,
  )
  $('.disp_id').val($('#id_' + id).text())
  $('.disp_name').val($('#name_' + id).text())
  $('.disp_doc').val($('#doc_' + id).text())
  $('.disp_class').val($('#class_' + id).text())
  $('.disp_addon').val($('#info_' + id).text())

  $('#exampleModal').modal('show')
}

$('.saveModal').on('click', function (event) {
  $.ajax({
    url: '/updatestudent',
    type: 'POST',
    data: {
      name_surname: `${$('.disp_name').val()}`,
      document: `${$('.disp_doc').val()}`,
      klasa: `${$('.disp_class').val()}`,
      info: `${$('.disp_addon').val()}`,
      id: $('.disp_id').val(),
    },
    success: function (result) {
      let id = $('.disp_id').val()
      $('#name_' + id).text($('.disp_name').val())
      $('#doc_' + id).text($('.disp_doc').val())
      $('#class_' + id).text($('.disp_class').val())
      $('#info_' + id).text($('.disp_addon').val())
      $.notify(`${result}`, {
        align: 'right',
        color: '#fff',
        background: '#20D67B',
      })
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
})
