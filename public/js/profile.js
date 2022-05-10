function elo(xd) {
    $.get(`/roomdata/${xd}`, function (data) {
        var json = $.parseJSON(data)

        const obj = document.querySelector('.toInsert')
        tableBody = $('table tbody')
        for (let i = 0; i < json.length; i++) {
            let dates = JSON.parse(json[i].dates)
            let today = moment().format('YYYY-MM-DD')

            let markup = `<tr class="${json[i].zaliczka ? 'succ' : ''}"><td>${
                json[i].id_room
            }</td><td>${json[i].max_os}</td><td>Od: ${dates[0]} do: ${
                dates[dates.length - 1]
            }</td><td>${
                json[i].zaliczka
                    ? 'Zapłacona'
                    : `<a href="javascript:pay(${json[i].id})">Zapłać!</a>`
            }</td><td>${
                today > dates[0] || today > dates[dates.length - 1]
                    ? 'Przeterminowane'
                    : `<a href="javascript:test(${json[i].id})">Anuluj!</a>`
            }</td></tr>`

            tableBody.append(markup)
        }
    })
}

function pay(id) {
    window.location.href = `/zaliczka/${id}`
}

function test(id) {
    window.location.href = `/delete/${id}`
}
