let monthTemp = 7
let monthNumber = 7
let days = 0
let year = 0
let tempo = 1

$(window).on('load', function () {
    //monthNumber = moment().format('MM')
    updateName(monthTemp)
    loadData(monthTemp)
})

async function loadData(month) {
    monthN = await getNumber(month)
    const calendar = document.querySelector('.callendar')
    $('.callendar').html('')
    year = moment().format('YYYY')
    days = moment(`${year}-${monthN}`, 'YYYY-MM').daysInMonth()
    /*     const isWeekend = (day) => {
        return day % 7 === 6 || day % 7 === 0
    }
 */
    const getDayName = (day, month, year) => {
        const xd = moment(`${year}-${month}-${day}`) // Thursday Feb 2015
        const usingMoment_1 = xd.day()
        switch (usingMoment_1) {
            case 1:
                return 'pon.'
                break
            case 2:
                return 'wt.'
                break
            case 3:
                return 'śr.'
                break
            case 4:
                return 'czw.'
                break
            case 5:
                return 'pt.'
                break
            case 6:
                return 'sob.'
                break
            case 7:
                return 'niedz.'
                break

            default:
                break
        }
    }

    /* for (let i = 1; i < days + 1; i++) {
        const weekend = isWeekend(i)

        let name = ''
        if (i <= 7) {
            const dayName = getDayName(i, month, year)
            name = `<div class="name">${dayName}</div>`
        }

        calendar.insertAdjacentHTML(
            'beforeend',
            `<div class="day ${
                weekend ? 'weekend' : ''
            }" id="${i}">${name}${i}</div>`,
        )
    } */
    calendar.insertAdjacentHTML(
        'beforeend',
        `
            <div class="callendarHeader">pon.</div>
            <div class="callendarHeader">wt.</div>
            <div class="callendarHeader">śr.</div>
            <div class="callendarHeader">czw.</div>
            <div class="callendarHeader">pt.</div>
            <div class="callendarHeader">sob.</div>
            <div class="callendarHeader">niedz.</div>            
        `,
    )

    for (let i = 0; i < 36; i++) {
        calendar.insertAdjacentHTML(
            'beforeend',
            `<div class="callendarBody" id="day${i}"></div>`,
        )
    }
    const firstDayName = getDayName('01', monthN, year)
    let startFrom = 0
    switch (firstDayName) {
        case 'wt.':
            startFrom = 1
            break
        case 'śr.':
            startFrom = 2
            break
        case 'czw.':
            startFrom = 3
            break
        case 'pt.':
            startFrom = 4
            break
        case 'sob.':
            startFrom = 5
            break
        case 'niedz.':
            startFrom = 6
            break
    }
    let today = moment().format('YYYY-MM-DD')
    let dateGen
    for (let i = 1; i < days + 1; i++) {
        dateGen = moment(
            `2021-${getNumber(monthTemp)}-${getNumber(i)}`,
            'YYYY-MM-DD',
        )
        const day = document.querySelector(`#day${startFrom}`)
        startFrom++
        day.insertAdjacentHTML('beforeend', i)

        if (today >= dateGen.format('YYYY-MM-DD')) {
            $(`#day${startFrom - 1}`).addClass('disabledCal')
        }
    }

    document.querySelectorAll('.callendar .callendarBody').forEach((day) => {
        day.addEventListener('click', (event) => {
            if (!$(event.currentTarget).hasClass('disabledCal')) {
                var numItems = $('.selected').length
                if (numItems >= 2) {
                    var temp = []
                    $('.selected').each(function () {
                        temp.push($(this).attr('id').slice(3))
                    })
                    let prev = $('.selected').length
                    event.currentTarget.classList.remove('selected')
                    let actual = $('.selected').length
                    if (actual === 1 && prev === 2) {
                        $(`#search`).addClass('disabled')
                        $('#2os').html('')
                        $('#3os').html('')
                        $('#4os').html('')
                        if (parseInt(temp[0]) > parseInt(temp[1])) {
                            const max = temp[0]
                            const min = temp[1]
                            color(min, max, 1)
                        } else {
                            const max = temp[1]
                            const min = temp[0]
                            color(min, max, 1)
                        }
                    }
                } else {
                    event.currentTarget.classList.toggle('selected')
                    if ($('.selected').length == 2) {
                        $(`#search`).removeClass('disabled')
                        var ek = []
                        $('.selected').each(function () {
                            ek.push($(this).attr('id').slice(3))
                        })
                        if (parseInt(ek[0]) > parseInt(ek[1])) {
                            const max = ek[0]
                            const min = ek[1]
                            color(min, max, 0)
                        } else {
                            const max = ek[1]
                            const min = ek[0]
                            color(min, max, 0)
                        }
                    }
                }
            }
        })
    })

    function color(min, max, rem) {
        min++
        if (rem === 1) {
            for (let i = min; i < max; i++) {
                $(`#day${i}`).removeClass('marked')
            }
        } else {
            for (let i = min; i < max; i++) {
                $(`#day${i}`).addClass('marked')
            }
        }
    }
}

function changeMonth(info) {
    if (info === 'add') {
        if (monthTemp < 12) {
            $('#2os').html('')
            $('#3os').html('')
            $('#4os').html('')
            monthTemp += 1
            loadData(monthTemp)
            updateName(monthTemp)
        }
    } else {
        if (monthTemp > 1) {
            $('#2os').html('')
            $('#3os').html('')
            $('#4os').html('')
            monthTemp -= 1
            loadData(monthTemp)
            updateName(monthTemp)
        }
    }
}

function getNumber(month) {
    switch (month) {
        case 1:
            return '01'
            break
        case 2:
            return '02'
            break
        case 3:
            return '03'
            break
        case 4:
            return '04'
            break
        case 5:
            return '05'
            break
        case 6:
            return '06'
            break
        case 7:
            return '07'
            break
        case 8:
            return '08'
            break
        case 9:
            return '09'
            break
        case 10:
            return '10'
            break
        case 11:
            return '11'
            break
        case 12:
            return '12'
            break
        default:
            return month
            break
    }
}

function updateName(month) {
    let monthName
    switch (month) {
        case 1:
            monthName = 'Styczeń'
            $('#nameMonth').html(monthName)
            break
        case 2:
            monthName = 'Luty'
            $('#nameMonth').html(monthName)
            break
        case 3:
            monthName = 'Marzec'
            $('#nameMonth').html(monthName)
            break
        case 4:
            monthName = 'Kwiecień'
            $('#nameMonth').html(monthName)
            break
        case 5:
            monthName = 'Maj'
            $('#nameMonth').html(monthName)
            break
        case 6:
            monthName = 'Czerwiec'
            $('#nameMonth').html(monthName)
            break
        case 7:
            monthName = 'Lipiec'
            $('#nameMonth').html(monthName)
            break
        case 8:
            monthName = 'Sierpień'
            $('#nameMonth').html(monthName)
            break
        case 9:
            monthName = 'Wrzesień'
            $('#nameMonth').html(monthName)
            break
        case 10:
            monthName = 'Październik'
            $('#nameMonth').html(monthName)
            break
        case 11:
            monthName = 'Listopad'
            $('#nameMonth').html(monthName)
            break
        case 12:
            monthName = 'Grudzień'
            $('#nameMonth').html(monthName)
            break
        default:
            break
    }
}

function search(el) {
    if (!$(el).hasClass('disabled')) {
        $('#2os').html('')
        $('#3os').html('')
        $('#4os').html('')
        var dataS = []
        let [max, min] = [0, 0]
        $('.selected').each(function () {
            dataS.push($(this).text())
        })
        if (parseInt(dataS[0]) > parseInt(dataS[1])) {
            max = dataS[0]
            min = dataS[1]
        } else {
            max = dataS[1]
            min = dataS[0]
        }
        displayFreeRooms(min, max, monthTemp)
    }
}

function displayFreeRooms(data1, data2, month) {
    $.get('/roomslist', function (data) {
        var json = $.parseJSON(data)

        temp = []
        temps = []
        vals = []
        help = []
        let val
        let xd = moment(`2021-${getNumber(monthTemp)}-${data1}`, 'YYYY-MM-DD')
        let start = parseInt(data1)
        let stop = parseInt(data2)
        for (let i = start; i < stop + 1; i++) {
            temp.push(xd.format('YYYY-MM-DD'))
            val = xd.add(1, 'days')
            xd = val
        }

        let tempdate
        for (let i = 0; i < json.length; i++) {
            tempdate = JSON.parse(json[i].dates)
            if (json[i].dates === null) {
                vals.push({
                    id: json[i].nr,
                    max_os: json[i].max_os,
                    price: json[i].price,
                })
            } else {
                let isFounded = temp.some((ai) => tempdate.includes(ai))
                if (!isFounded) {
                    vals.push({
                        id: json[i].nr,
                        max_os: json[i].max_os,
                        price: json[i].price,
                    })
                } else {
                    help.push(json[i].nr)
                }
            }
        }

        let final = []
        if (help.length > 0) {
            for (let z = 0; z < help.length; z++) {
                for (let d = 0; d < vals.length; d++) {
                    if (vals[d].id !== help[z]) {
                        final.push({
                            id: vals[d].id,
                            max_os: vals[d].max_os,
                            price: vals[d].price,
                        })
                    }
                }
            }
        } else {
            for (let d = 0; d < vals.length; d++) {
                final.push({
                    id: vals[d].id,
                    max_os: vals[d].max_os,
                    price: vals[d].price,
                })
            }
        }

        var result = final.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id && obj.id === o.id)) {
                unique.push(o)
            }
            return unique
        }, [])

        $('#2os').append(
            `<div class="card-body glowka"><h5 class="card-title">Pokoje</h5><p class="card-text">2os.</p></div>`,
        )
        $('#3os').append(
            `<div class="card-body glowka"><h5 class="card-title">Pokoje</h5><p class="card-text">3os.</p></div>`,
        )
        $('#4os').append(
            `<div class="card-body glowka"><h5 class="card-title">Pokoje</h5><p class="card-text">4os.</p></div>`,
        )
        for (let i = 0; i < result.length; i++) {
            switch (result[i].max_os) {
                case 2:
                    $('#2os').append(
                        `<div onclick="xd(this)" class="2os card-body added" id="${
                            result[i].price
                        }"><h5 class="card-title">${
                            result[i].id
                        }</h5><p class="card-text"><hr/>Cena:  ${
                            (data2 - data1) * result[i].price
                        } zł<hr/>Dni: ${data2 - data1}</p></div>`,
                    )
                    break
                case 3:
                    $('#3os').append(
                        `<div onclick="xd(this)" class="3os card-body added" id="${
                            result[i].price
                        }"><h5 class="card-title">${
                            result[i].id
                        }</h5><p class="card-text"><hr/>Cena:  ${
                            (data2 - data1) * result[i].price
                        } zł<hr/>Dni: ${data2 - data1}</p></div>`,
                    )
                    break
                case 4:
                    $('#4os').append(
                        `<div onclick="xd(this)"  class="4os card-body added" id="${
                            result[i].price
                        }"><h5 class="card-title">${
                            result[i].id
                        }</h5><p class="card-text"><hr/>Cena:  ${
                            (data2 - data1) * result[i].price
                        } zł<hr/>Dni: ${data2 - data1}</p></div>`,
                    )
                    break

                default:
                    break
            }
        }
    })
}

function xd(el) {
    var data = []
    $('.selectedRoom').each(function () {
        data.push($(this).text())
    })

    if (data.length > 0) {
        el.classList.remove('selectedRoom')
        $(`#reserve`).addClass('disabled')
    } else {
        el.classList.toggle('selectedRoom')
        $(`#reserve`).removeClass('disabled')
    }
}

function reserv(el) {
    if (!$('#reserve').hasClass('disabled')) {
        var dni = []
        let [max, min] = [0, 0]
        $('.selected').each(function () {
            dni.push($(this).text())
        })
        if (parseInt(dni[0]) > parseInt(dni[1])) {
            max = dni[0]
            min = dni[1]
        } else {
            max = dni[1]
            min = dni[0]
        }
        const nr_room = $('.selectedRoom .card-title').text()
        const price = $('.selectedRoom ').attr('id')
        let miejsca = 0
        if ($('.selectedRoom ').hasClass('2os')) {
            miejsca = 2
        } else if ($('.selectedRoom ').hasClass('3os')) {
            miejsca = 3
        } else {
            miejsca = 4
        }

        $(location).attr(
            'href',
            `/reserve/${price}/${nr_room}/${min}/${max}/${monthTemp}/${miejsca}`,
        )
    }
}
