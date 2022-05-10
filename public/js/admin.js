$(document).ready(function () {
    $('#tabs li a:not(:first)').addClass('inactive')
    $('.container').hide()
    $('.container:first').show()

    $('#tabs li a').click(function () {
        var t = $(this).attr('id')
        if ($(this).hasClass('inactive')) {
            //this is the start of our condition
            $('#tabs li a').addClass('inactive')
            $(this).removeClass('inactive')

            $('.container').hide()
            $('#' + t + 'C').fadeIn('slow')
        }
    })
})

$(window).on('load', function () {
    $.get(`/roomdata/all`, function (data) {
        var json = $.parseJSON(data)

        $.each(json, function (i, item) {
            let dates = JSON.parse(json[i].dates)
            let today = moment().format('YYYY-MM-DD')
            $(`<tr class="${json[i].zaliczka ? 'succ' : ''}">`)
                .html(
                    `<td>${json[i].id_room}</td><td>${
                        json[i].max_os
                    }</td><td>Od: ${dates[0]} do: ${
                        dates[dates.length - 1]
                    }</td><td>${
                        json[i].zaliczka ? 'Zapłacona' : `Nie zapłacona`
                    }</td><td>${
                        today > dates[0] || today > dates[dates.length - 1]
                            ? 'Przeterminowane'
                            : `<a id="anuluj" href="javascript:test(${json[i].id})">Anuluj!</a>`
                    }</td>`,
                )
                .appendTo('#pokoiki')
        })
    })

    $.get(`/rooms/`, function (data) {
        var json = $.parseJSON(data)

        const obj = document.querySelector('.insertData')

        $.each(json, function (i, item) {
            $('<tr>')
                .html(
                    '<td>' +
                        json[i].nr +
                        '</td><td>' +
                        json[i].max_os +
                        '</td><td>' +
                        json[i].price +
                        '</td>',
                )
                .appendTo('#datka')
        })
        //  let markup = `<tr><td>${json[i].id_room}</td><td>${json[i].max_os}</td><td>${json[i].price}</td></tr>`
    })
})

function test(id) {
    window.location.href = `/delete/${id}`
}
const delay = (millis) =>
    new Promise((resolve, reject) => {
        setTimeout((_) => resolve(), millis)
    })

async function send() {
    let room = document.getElementById('room').value
    let ppl = document.getElementById('ppl').value
    let price = document.getElementById('price').value
    //$.get(`/insertRoom/${room}/${ppl}/${price}`, async function (data) {})
    $('#buttonAlert').addClass('show')
    await delay(5000)
    location.reload()
}
