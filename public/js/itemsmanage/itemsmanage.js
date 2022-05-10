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

function edit(id) {
  $('.modal-title').html(
    `Edytowany artykuł: <span style="font-weight:400;">${$(
      '#name_' + id,
    ).text()}</span>`,
  )
  $('.disp_id').val($('#id_' + id).text())
  $('.disp_name').val($('#name_' + id).text())
  $('.disp_code').val($('#code_' + id).text())
  $('.disp_ext').val($('#info_' + id).text())
  $('.disp_desc').val($('#desc_' + id).text())

  let cat = $('#cat_' + id).text()

  let temp = `<label>Kategoria:</label><select class="custom-select disp_cat" id="selectItem">`
  for (let i = 0; i < Categories.length; i++) {
    temp += `<option ${
      Categories[i].category == cat ? 'selected' : ''
    } value="${Categories[i].id}">${Categories[i].category}</option>`
  }
  temp += `</select>`
  $('.disp_cat_div').empty()
  $('.disp_cat_div').append(temp)

  $('#exampleModal').modal('show')
}

$('.saveModal').on('click', function (event) {
  $.ajax({
    url: '/edititems',
    type: 'POST',
    data: {
      name: `${JSON.stringify($('.disp_name').val())}`,
      code: `${JSON.stringify($('.disp_code').val())}`,
      desc: `${JSON.stringify($('.disp_desc').val())}`,
      ext: `${JSON.stringify($('.disp_ext').val())}`,
      id: $('.disp_id').val(),
      cat: `${JSON.stringify($('.disp_cat option:selected').text())}`,
    },
    success: function (result) {
      let id = $('.disp_id').val()
      $('#name_' + id).text($('.disp_name').val())
      $('#info_' + id).text($('.disp_code').val())
      $('#desc_' + id).text($('.disp_desc').val())
      $('#info_' + id).text($('.disp_ext').val())
      $('#cat_' + id).text($('.disp_cat option:selected').text())
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

function remove(id) {
  $.confirm({
    title: 'Uwaga!',
    content: `Czy jesteś pewny/a, że chcesz usunąć artykuł o nazwie: <span style="font-weight:600;">${$(
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
            url: '/removeitems',
            type: 'POST',
            data: {id: id},
            success: function (result, code, xxx) {
              if (xxx.status !== 200) {
                $.notify(`${result}`, {
                  align: 'right',
                  color: '#fff',
                  background: '#FFA500',
                })
              } else {
                $('#tr_' + id).remove()
                $.notify(`${result}`, {
                  align: 'right',
                  color: '#fff',
                  background: '#20D67B',
                })
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
        },
      },
    },
  })
}

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
