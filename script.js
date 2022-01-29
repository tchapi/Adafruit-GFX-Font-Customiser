function makeUpDownButton(name, func, color, width) {
    const button = $('<div class="ui mini compact buttons" style="margin:1px"></div>')
    const style = 'ui compact button ' + func + '-handler ' + color
    button.append('<button id="' + func + '-remove" class="' + style + '">-</button>')
    button.append('<button id="' + func + '-value" class="ui compact disabled button ' + color + '" style="width:' + width + '">' + name + '</button>')
    button.append('<button id="' + func + '-add" class="' + style + '">+</button>')
    return button
}

function makeCheckButton(name, func, color, width, disabled) {
    const button = $('<span class="ui mini compact" style="margin:1px"></span>')
    button.append('<label class="ui ' + color + ' label" disabled style="width:' + width + '""><input type="checkbox" class="' + func + '-handler" id="' + func + '"' + (disabled ? ' checked="checked"' : '') + '> ' + name + '</label>')
    return button
}
function makeClipButtons(func, color, width) {
    //const button = $('<div class="ui mini compact buttons" style="margin:1px"></div>')
    //const style = 'ui compact button ' + func + '-handler ' + color
    //button.append('<button id="' + func + '-copy" class="' + style + '">C</button>')
    //button.append('<button id="' + func + '-value" class="ui compact disabled button ' + color + '" style="width:' + width + '">xxx</button>')
    //button.append('<button id="' + func + '-paste" class="' + style + '">P</button>')
    //return button
    var name = "."
    width = 10;
    const button = $('<div class="ui mini compact buttons" style="margin:1px"></div>')
    const style = 'ui compact button ' + func + '-handler ' + color
    button.append('<button id="' + func + '-copy" class="' + style + '">COPY</button>')
    //button.append('<button id="' + func + '-value" class="ui compact disabled button ' + color + '" style="width:' + width + '">' + name + '</button>')
    button.append('<button id="' + func + '-paste" class="' + style + '">PASTE</button>')
    return button
}

function makeGlyphItem(n, w, h, char, adv, ow, oh, disabled) {
    const charCode = char.charCodeAt(0)
    const table = $('<div class="table"></div>')
        .addClass('glyph')
        .attr('data-pixels', n)
        .attr('data-w', w)
        .attr('data-h', h)
        .attr('data-char', char)
        .attr('data-adv', adv)
        .attr('data-ow', ow)
        .attr('data-oh', oh)
        .attr('data-dis', disabled ? 1 : 0)
        .css('opacity', disabled ? 0.1 : 1)

    const grid = $(`<div style="width: ${window['glyph_table_width']}px"></div>`)
    const div = $('<div class="ui attached segment inner"></div>')

    div.append(table)

    if (char == ' ') {
        grid.append('<h2 class="ui top attached segment inner"><span class="np">space</span></h2>')
    } else {
        // Display a specific text for non-printable characters
        grid.append('<h2 class="ui top attached segment inner">' + char.replace(/[\x00-\x1F\x7F-\x9F\xAD]/g, '<span class="np">non-printable</span>') + '</h2>')
    }

    grid.append('<div class="ui attached segment inner secondary centered">' + '0x' + charCode.toString(16).toUpperCase() + '</div>')
    grid.append(div)

    const buttonBar = $('<div class="ui bottom attached warning message inner centered"></div>')
    buttonBar.append(makeUpDownButton('Rows', 'row', 'purple', 50))
    buttonBar.append(makeUpDownButton('Cols', 'col', 'violet', 50))
    buttonBar.append(makeUpDownButton('Base', 'base', 'green', 50))
    buttonBar.append(makeUpDownButton('XOff', 'xoff', 'blue', 50))
    buttonBar.append(makeUpDownButton('XAdv', 'xadv', 'teal', 50))
    buttonBar.append(makeClipButtons('clip', 'gray', 50))
    buttonBar.append(makeCheckButton('Disable', 'dis', 'yellow', 110, disabled))

    grid.append(buttonBar)

    return grid
}

function setGlyphTable(table) {
    const xadvance = parseInt(table.attr('data-adv'))
    const maxH = parseInt(window['maxH'])

    const xoffset = parseInt(table.attr('data-ow'))
    const yoffset = parseInt(table.attr('data-oh'))

    const width = parseInt(table.attr('data-w'))
    const height = parseInt(table.attr('data-h'))

    const pixels = table.attr('data-pixels')

    const maxBaseline = window['maxBaseline']

    const left = xoffset
    const right = width + xoffset
    const top = maxBaseline + yoffset
    const bottom = top + height

    // Set the table
    table.empty()
    for (let i = 0; i < maxH; i++) {
        const row = $('<div></div>').addClass('row')
        for (let j = Math.min(0, xoffset); j <= Math.max(xadvance, right); j++) {
            const cell = $('<div></div>').addClass('cell').attr('data-x', j).attr('data-y', i)
            // These classes are used to position the "limits" vertical lines
            if (i === 0 && j === 0) {
                cell.addClass('before_xoffset')
            }
            if (i === 0 && j === xadvance) {
                cell.addClass('before_xadvance')
            }
            // Now draw the actual pixels
            if (i < top || i >= bottom || j < left || j >= right) {
                cell.addClass('dead')
            } else if (pixels.charAt((i - top) * width + (j - left)) == '1') {
                cell.addClass('fill')
            }
            // If the pixel is after xadvance, or before xoffset
            if (j >= xadvance || j < Math.max(0, xoffset)) {
                cell.addClass('over')
            }
            row.append(cell)
        }
        table.append(row)
    }

    // Draw the xadvance/xoffset limits
    // (We need to get the actual cell position before hand)
    const left_xoffset = table.find('div.before_xoffset')[0].offsetLeft
    xoffset_limit = $('<div class="xoffset_limit limit"></div>').css('left', (left_xoffset - 1) + 'px') // -1 accounts for first border of table
    table.append(xoffset_limit)

    const left_xadvance = table.find('div.before_xadvance')[0].offsetLeft
    xadvance_limit = $('<div class="xadvance_limit limit"></div>').css('left', (left_xadvance - 1) + 'px')
    table.append(xadvance_limit)

    // Set the baseline
    baseline = $('<div class="baseline"></div>').css('top', ((maxBaseline + 1) * 10 - 1) + 'px')
    table.append(baseline)
}

function updatePixels(table, newWidth, newHeight, x, y, fill) {
    const dataPixels = table.attr('data-pixels')
    const width = parseInt(table.attr('data-w'))
    const height = parseInt(table.attr('data-h'))
    const xoff = parseInt(table.attr('data-ow'))
    const base = parseInt(table.attr('data-oh'))
    const xAdjust = xoff * -1
    const yAdjust = (window['maxBaseline'] + base) * -1

    if (newWidth < 0) {
        newWidth = width
    }

    if (newHeight < 0) {
        newHeight = height
    }

    if (x >= 0 && y >= 0) {
        x += xAdjust
        y += yAdjust
    }

    // Store the pixels into a 2D bool array
    const array = []
    let pixelIndex = 0
    for (let i = 0; i < height; ++i) {
        const rowArray = []
        for (let j = 0; j < width; ++j) {
            if (x == j && y == i) {
                rowArray.push(fill)
            } else {
                rowArray.push(dataPixels.charAt(pixelIndex))
            }
            ++pixelIndex
        }
        array.push(rowArray)
    }

    // Write out to a string newWidth x newHeight
    let newPixels = ''
    for (let i = 0; i < newHeight; ++i) {
        for (let j = 0; j < newWidth; ++j) {
            if (i >= height || j >= width) {
                newPixels += '0'
            } else {
                newPixels += array[i][j]
            }
        }
    }

    // Pad out to a multiple of 8
    const pad = newPixels.length % 8
    for (let i = 0; i < pad; ++i) {
        newPixels += '0'
    }

    table.attr('data-pixels', newPixels)
}

function advanceLoading(percent) {
    const element = document.querySelector('#loader .advance')
    element.style.width = Math.floor(294 * percent)
}

function extractFont() {
    let data = $('#source').val()

    // Extract name
    const re = /const\ uint8\_t\ (.*)Bitmaps\[\]/
    const found = data.match(re)

    if (found != null && found.length > 1) {
        window['name'] = found[1]
    } else {
        alert('No correct font file found (name missing), please paste the content of an Adafruit GFX font file first.')
        $("#loader").hide()
        return
    }

    $('#glyphs').empty()

    // extract GFXFont part
    const last_part_re = /const\ GFXfont([\s\S]*)/g
    const last_part = data.match(last_part_re)
    window['last_part'] = last_part[0]

    // Get first, last and yOffset
    let parts = last_part[0].split(',')
    const number_hexa_re = /0[xX][0-9a-fA-F]+/gi
    const number_dec_re = /[0-9]+/gi
    if (parts[2].match(number_hexa_re)) {
        window['first'] = parts[2].match(number_hexa_re)[0]
    } else if (parts[2].match(number_dec_re)) {
        window['first'] = '0x' + Number(parts[2].match(number_dec_re)[0]).toString(16)
    } else {
        alert('No correct font file found (first character offset unparsable), please paste the content of an Adafruit GFX font file first.')
        $("#loader").hide()
        return
    }

    if (parts[3].match(number_hexa_re)) {
        window['last'] = parts[3].match(number_hexa_re)[0]
    } else if (parts[3].match(number_dec_re)) {
        window['last'] = '0x' + Number(parts[3].match(number_dec_re)[0]).toString(16)
    } else {
        alert('No correct font file found (last character offset unparsable), please paste the content of an Adafruit GFX font file first.')
        $("#loader").hide()
        return
    }

    data = data.replace(last_part[0], '')
    data = data.replace(/\{/gi, '[').replace(/\}/gi, ']')
    data = data.replace('const GFXglyph ', '').replace('const uint8_t ', '').replace(/\[\]\ PROGMEM/gi, '')

    eval(data)

    /*
        // Tada 🎉
        console.log(window["name"])
        console.log(window["size"])
        console.log(window["first"])
        console.log(window["last"])
        console.log(window["last_part"])
        console.log(window[name + "Bitmaps"])
        console.log(window[name + "Glyphs"])
        */

    $('.fontname').text('(' + window['name'].slice(0, window['name'].length - 1) + ')').show()
    $('#firstglyph').val(window["first"])
    $('#lastglyph').val(window["last"])

    $('#add').attr('disabled', false)

    const glyphsArray = window[name + 'Glyphs']

    // Run pre-calculations for correct display
    let maxW = 0
    let maxBaseline = 0
    let minUnderBaseline = 0
    for (ind in glyphsArray) {
        const inv_oh = -glyphsArray[ind][5]
        maxW = Math.max(maxW, glyphsArray[ind][1], glyphsArray[ind][3])
        maxBaseline = Math.max(maxBaseline, inv_oh)
        minUnderBaseline = Math.min(minUnderBaseline, inv_oh + 1 - glyphsArray[ind][2])
    }

    // Calculate the max height that we need for every glyph cell
    window['maxH'] = maxBaseline + 1 - minUnderBaseline

    // Space from the baseline to the top of the character cell is determined by the character with the
    // largest negative yOffset.
    window['maxBaseline'] = maxBaseline

    // Calculate the ideal glyph width. 160px is the minimum (for the buttons)
    window['glyph_table_width'] = Math.max(160, maxW * 11 + 30 /* some margin */)

    // Display tables
    for (ind in glyphsArray) {
        const charIndex = parseInt(ind)
        // for each glyph
        const char = String.fromCharCode(parseInt(window['first'], 16) + charIndex)
        const w = glyphsArray[ind][1]
        const h = glyphsArray[ind][2]
        const adv = glyphsArray[ind][3]
        const ow = glyphsArray[ind][4]
        const oh = glyphsArray[ind][5]
        let n = ''

        // extract data: current offset
        currentOffset = glyphsArray[charIndex][0]

        // extract data: next offset
        if (charIndex + 1 < glyphsArray.length) {
            // To get the next offset, we need to find the next non-disabled
            // character offset (else, we will get 0 and it's not correct).
            let nextIndexIncrementor = 1
            do {
                nextOffset = glyphsArray[charIndex + nextIndexIncrementor][0]
                nextIndexIncrementor += 1
            } while (nextOffset === 0 && (charIndex + nextIndexIncrementor < glyphsArray.length))
            if (nextOffset === 0) { // We reached the end of the bitmaps
                nextOffset = window[name + 'Bitmaps'].length
            }
        } else {
            nextOffset = window[name + 'Bitmaps'].length
        }

        let disabled = (w == 0 || h == 0) && adv == 0

        if (!disabled) {
            for (let k = 0; k < (nextOffset - currentOffset); k++) {
                n += ('000000000' + window[name + 'Bitmaps'][currentOffset + k].toString(2)).substr(-8)
            }
        }

        grid = makeGlyphItem(n, w, h, char, adv, ow, oh, disabled)

        function glyphAppendClosure(el, adv) {
            setTimeout(function () {
                advanceLoading(0.2 * adv)
                $('#glyphs').append(el)
                if (adv === 1) {
                    // Run the setGlyphTable function now
                    displayGlyphTable()
                }
            }, 1)
        }

        glyphAppendClosure(grid, (charIndex + 1) / glyphsArray.length)
    }

    $('#export').prop("disabled", false)
    $('#reset').prop("disabled", false)
    $('#createFont').prop("disabled", true)
    $('#extract').prop("disabled", true)
}


function displayGlyphTable() {
    const l = $('#glyphs').children().length
    $('#glyphs').children().each(function (i) {

        function setGlyphTableClosure(el, adv) {
            setTimeout(function () {
                advanceLoading(0.2 + 0.8 * adv)
                setGlyphTable(el.children().find('.glyph'))
                if (adv === 1) {
                    $('#loader').hide()
                }
            }, 1)
        }

        setGlyphTableClosure($(this), (i + 1) / l)
    })
}


var clip_data = {}
$(document).ready(function () {

    $.get( "/Fonts/FreeMono9pt7b.h", data => {
        //alert( "Load was performed." );
        console.log(data)
        $("#source").text(data)
    });

    $('#new-character-code').parent().hide()
    $('#add').attr('disabled', 'disabled')
    $('#export').attr('disabled', 'disabled')
    $('#reset').prop("disabled", 'disabled')
    $('.ui.checkbox.use-charcode').checkbox()

    $(document).on('change', '.ui.checkbox.use-charcode input', function (e) {
        $('#new-character').parent().toggle()
        $('#new-character-code').parent().toggle()

        if ($('input[name=charcode]').is(':checked')) {
            if ($('#new-character-code').val() == '') {
                $('.character').text('N/A')
            } else {
                $('.character').text(String.fromCharCode(parseInt($('#new-character-code').val(), 16)))
            }
        } else {
            if ($('#new-character').val() == '') {
                $('.charcode').text('N/A')
            } else {
                $('.charcode').text('0x' + $('#new-character').val().charCodeAt(0).toString(16).toUpperCase())
            }
        }
    })

    $('#newfont-new-character-code').parent().hide()
    $('.ui.checkbox.newfont-use-charcode').checkbox()
    $(document).on('change', '.ui.checkbox.newfont-use-charcode input', function (e) {
        $('#newfont-new-character').parent().toggle()
        $('#newfont-new-character-code').parent().toggle()

        if ($('input[name=newfontCharcode]').is(':checked')) {
            if ($('#newfont-new-character-code').val() == '') {
                $('.newfontCharacter').text('N/A')
            } else {
                $('.newfontCharacter').text(String.fromCharCode(parseInt($('#newfont-new-character-code').val(), 16)))
            }
        } else {
            if ($('#newfont-new-character').val() == '') {
                $('.newfontCharcode').text('N/A')
            } else {
                $('.newfontCharcode').text('0x' + $('#newfont-new-character').val().charCodeAt(0).toString(16).toUpperCase())
            }
        }
    })

    $('#loader').hide()
    window['name'] = null
    window['last_part'] = null

    $('#extract').click(function () {
        advanceLoading(0)
        $('#loader').fadeIn(function () {
            extractFont()
        })
    })

    $('#reset').click(function () {

        $('.ui.modal.confirmation p').text('The reset will close the font and discard any changes you made.')
        $('.ui.modal.confirmation').modal({
            closable: false,
            onApprove: function () {
                $('#glyphs').empty()
                $('#source').val('')
                $('#createFont').prop("disabled", false)
                $('#extract').prop("disabled", false)
                $('#add').prop("disabled", "disabled")
                $('#export').prop("disabled", "disabled")
                $('#reset').prop("disabled", "disabled")
                $('.fontname').text('Fontname unknown').hide()
            }
        }).modal('show')
    })

    const fillPixel = (target, fill) => {
        fill === '1' ? target.addClass('fill') : target.removeClass('fill')
        const table = target.parent().parent().parent().find('.table.glyph')
        updatePixels(table, -1, -1, parseInt(target.attr('data-x')), parseInt(target.attr('data-y')), fill)
    }

    let isFilling = false;
    let fillingMode = '1';
    $(document).on('mousedown', '.cell:not(.dead)', function (e) {
        isFilling = true;
        fillingMode = $(e.target).hasClass('fill') ? '0' : '1'
        fillPixel($(e.target), fillingMode)
    })
    $(document).on('mouseup', '.cell:not(.dead)', function (e) {
        isFilling = false;
    })
    $(document).on('mouseenter', '.cell:not(.dead)', function (e) {
        if (isFilling) {
            fillPixel($(e.target), fillingMode)
        }
    })

    $(document).on('click', '.row-handler', function (e) {
        const targetID = $(e.target).attr('id')
        const table = $(e.target).parent().parent().parent().find('.table.glyph')
        let height = parseInt(table.attr('data-h'))

        if (targetID === 'row-add') {
            height++
        } else if (targetID === 'row-remove') {
            height--
        }

        updatePixels(table, -1, height, -1, -1, false)
        table.attr('data-h', height)
        setGlyphTable(table)
        return false
    })

    $(document).on('click', '.col-handler', function (e) {
        const targetID = $(e.target).attr('id')
        const table = $(e.target).parent().parent().parent().find('.table.glyph')
        let width = parseInt(table.attr('data-w'))

        if (targetID === 'col-add') {
            width++
        } else if (targetID === 'col-remove') {
            width--
        }

        updatePixels(table, width, -1, -1, -1, false)
        table.attr('data-w', width)
        setGlyphTable(table)
        return false
    })

    $(document).on('click', '.base-handler', function (e) {
        const targetID = $(e.target).attr('id')
        const table = $(e.target).parent().parent().parent().find('.table.glyph')
        if (targetID === 'base-add') {
            table.attr('data-oh', parseInt(table.attr('data-oh')) + 1)
        } else if (targetID === 'base-remove') {
            table.attr('data-oh', parseInt(table.attr('data-oh')) - 1)
        }

        setGlyphTable(table)
        return false
    })

    $(document).on('click', '.xadv-handler', function (e) {
        const targetID = $(e.target).attr('id')
        const table = $(e.target).parent().parent().parent().find('.table.glyph')
        if (targetID === 'xadv-add') {
            table.attr('data-adv', parseInt(table.attr('data-adv')) + 1)
        } else if (targetID === 'xadv-remove') {
            table.attr('data-adv', parseInt(table.attr('data-adv')) - 1)
        }

        setGlyphTable(table)
        return false
    })

    $(document).on('click', '.xoff-handler', function (e) {
        const targetID = $(e.target).attr('id')
        const table = $(e.target).parent().parent().parent().find('.table.glyph')
        if (targetID === 'xoff-add') {
            table.attr('data-ow', parseInt(table.attr('data-ow')) + 1)
        } else if (targetID === 'xoff-remove') {
            table.attr('data-ow', parseInt(table.attr('data-ow')) - 1)
        }

        setGlyphTable(table)
        return false
    })

    $(document).on('click', '.clip-handler', function (e) {
        const targetID = $(e.target).attr('id')
        const table = $(e.target).parent().parent().parent().find('.table.glyph')
        if (targetID === 'clip-copy') {
            clip_data.xadvance  = parseInt(table.attr('data-adv'))
            clip_data.xoffset   = parseInt(table.attr('data-ow'))
            clip_data.yoffset   = parseInt(table.attr('data-oh'))        
            clip_data.width     = parseInt(table.attr('data-w'))
            clip_data.height    = parseInt(table.attr('data-h'))        
            clip_data.pixels    = table.attr('data-pixels')
        } else if (targetID === 'clip-paste') {
            table.attr('data-adv',      clip_data.xadvance)
            table.attr('data-ow',       clip_data.xoffset)
            table.attr('data-oh',       clip_data.yoffset)
            table.attr('data-w',        clip_data.width)
            table.attr('data-h',        clip_data.height)
            table.attr('data-pixels',   clip_data.pixels)
        }
        setGlyphTable(table)
        return false
    })

    $(document).on('change', '.dis-handler', function (e) {
        const table = $(e.target).parent().parent().parent().parent().find('.table.glyph')
        table.attr('data-dis', 1 - parseInt(table.attr('data-dis')))
        table.fadeTo('fast', 1 - 0.9 * table.attr('data-dis'))
        return false
    })

    $(document).on('keyup', '#new-character', function (e) {
        if ($('#new-character').val() == '') {
            $('.charcode').text('N/A')
        } else {
            $('.charcode').text('0x' + $('#new-character').val().charCodeAt(0).toString(16).toUpperCase())
        }
    })

    $(document).on('keyup', '#new-character-code', function (e) {
        if ($('#new-character-code').val() == '') {
            $('.character').text('N/A')
        } else {
            $('.character').text(String.fromCharCode(parseInt($('#new-character-code').val(), 16)))
        }
    })

    $(document).on('keyup', '#newfont-new-character', function (e) {
        if ($('#newfont-new-character').val() == '') {
            $('.newfontCharcode').text('N/A')
        } else {
            $('.newfontCharcode').text('0x' + $('#newfont-new-character').val().charCodeAt(0).toString(16).toUpperCase())
        }
    })

    $(document).on('keyup', '#newfont-new-character-code', function (e) {
        if ($('#newfont-new-character-code').val() == '') {
            $('.newfontCharacter').text('N/A')
        } else {
            $('.newfontCharacter').text(String.fromCharCode(parseInt($('#newfont-new-character-code').val(), 16)))
        }
    })

    $('#createFont').click(function () {
        $('input[name=newfontCharcode]').prop('checked', false)
        $('#newfont-new-character').parent().show()
        $('#newfont-new-character-code').parent().hide()
        if ($('#newfont-new-character').val() == '') {
            $('.charcode').text('N/A')
        } else {
            $('.charcode').text('0x' + $('#newfont-new-character').val().charCodeAt(0).toString(16).toUpperCase())
        }
        if ($('#newfont-new-character-code').val() == '') {
            $('.character').text('N/A')
        } else {
            $('.character').text(String.fromCharCode($('#newfont-new-character-code').val()))
        }

        $('.ui.modal.newfont').modal({
            closable: false,

            onApprove: function () {
                let name = $('#newfont-name').val()
                if (name.length < 1) {
                    $('.ui.modal.message p').text('The font must have a name, I\'m not creating a new font with it.')
                    $('.ui.modal.message').modal('show')
                    return
                }


                let newfontHeight = parseInt($('#newfont-height').val())
                if (newfontHeight < 1) {
                    $('.ui.modal.message p').text('The font height must be greater than 0, I\'m not creating a new font with it.')
                    $('.ui.modal.message').modal('show')
                    return
                }


                // Get new character data
                let newChar
                let newCharCode
                if ($('input[name=newfontCharcode]').is(':checked')) {
                    newCharCode = parseInt($('#newfont-new-character-code').val(), 16)
                    newChar = String.fromCharCode(newCharCode)
                } else {
                    newChar = $('#newfont-new-character').val()
                    newCharCode = $('#newfont-new-character').val().charCodeAt(0)
                }

                // Check character validity
                if (newChar == '') {
                    $('.ui.modal.message p').text('This character is either blank or incorrect, I\'m not creating a new font with it.')
                    $('.ui.modal.message').modal('show')
                    return
                }

                if (newCharCode < 1) {
                    $('.ui.modal.message p').text('This is a special control character, I\'m not creating a new font with it.')
                    $('.ui.modal.message').modal('show')
                    return
                }

                if (newCharCode > 65535) {
                    $('.ui.modal.message p').text('This character is out of range, I\'m not creating a new font with it.')
                    $('.ui.modal.message').modal('show')
                    return
                }

                // Set the font parameters
                window['first'] = newCharCode
                window['last'] = newCharCode
                window['name'] = name + '_'
                window[name + '_Bitmaps'] = [] // This is otherwise created by the eval() in extract font
                window['maxBaseline'] = newfontHeight
                window['last_part'] = 'const GFXfont ' + name + ' PROGMEM = {(uint8_t *) ' + name + '_Bitmaps, (GFXglyph *)' + name + '_Glyphs, 0x00, 0x00, ' + newfontHeight + '};'

                // Show the data
                $('.fontname').text('(' + name + ')').show()
                $('#firstglyph').val('0x' + window["first"].toString(16))
                $('#lastglyph').val('0x' + window["last"].toString(16))
                $('#glyphs').empty()


                // Change button states
                $('#add').attr('disabled', false)
                $('#export').prop("disabled", false)
                $('#createFont').prop("disabled", true)
                $('#extract').prop("disabled", true)
                $('#reset').prop("disabled", false)

                // Add the new character
                const grid = makeGlyphItem(' ', 1, 1, newChar, 4, 0, -newfontHeight, false)
                $('#glyphs').append(grid)

                setGlyphTable(grid.find('.glyph'))
            }
        })
            .modal('show')
    })

    $('#add').click(function () {
        $('input[name=charcode]').prop('checked', false)
        $('#new-character').parent().show()
        $('#new-character-code').parent().hide()
        if ($('#new-character').val() == '') {
            $('.charcode').text('N/A')
        } else {
            $('.charcode').text('0x' + $('#new-character').val().charCodeAt(0).toString(16).toUpperCase())
        }
        if ($('#new-character-code').val() == '') {
            $('.character').text('N/A')
        } else {
            $('.character').text(String.fromCharCode($('#new-character-code').val()))
        }

        // Choose a character
        $('.ui.modal.choose').modal({
            closable: false,
            onApprove: function () {
                const firstglyph = parseInt($('#firstglyph').val(), 16)
                const lastglyph = parseInt($('#lastglyph').val(), 16)

                let newChar
                let newCharCode
                if ($('input[name=charcode]').is(':checked')) {
                    newCharCode = parseInt($('#new-character-code').val(), 16)
                    newChar = String.fromCharCode(newCharCode)
                } else {
                    newChar = $('#new-character').val()
                    newCharCode = $('#new-character').val().charCodeAt(0)
                }

                if (newChar == '') {
                    $('.ui.modal.message p').text('This character is either blank or incorrect, I\'m not adding it.')
                    $('.ui.modal.message').modal('show')
                    return
                }

                if (newCharCode < 1) {
                    $('.ui.modal.message p').text('This is a special control character, I\'m not adding it.')
                    $('.ui.modal.message').modal('show')
                    return
                }

                if (newCharCode > 65535) {
                    $('.ui.modal.message p').text('This character is out of range, I\'m not adding it.')
                    $('.ui.modal.message').modal('show')
                    return
                }

                // Check that the character is not already existing
                if (newCharCode > lastglyph || newCharCode < firstglyph) {
                    let start, end;
                    if (newCharCode > lastglyph) {
                        start = lastglyph + 1
                        end = newCharCode
                        window['last'] = '0x' + newCharCode.toString(16).toUpperCase()
                        $('#lastglyph').val(window['last'])
                    } else {
                        start = newCharCode
                        end = firstglyph - 1
                        window['first'] = '0x' + newCharCode.toString(16).toUpperCase()
                        $('#firstglyph').val(window['first'])
                    }

                    if (newCharCode < firstglyph) {
                        for (j = end; j >= start; j--) {
                            const char = String.fromCharCode(parseInt(j))
                            const grid = makeGlyphItem(' ', 1, 1, char, 4, 0, -window['maxBaseline'], !(j === newCharCode))
                            $('#glyphs').prepend(grid)
                            setGlyphTable(grid.find('.glyph'))
                        }
                    } else {
                        for (j = start; j <= end; j++) {
                            const char = String.fromCharCode(parseInt(j))
                            const grid = makeGlyphItem(' ', 1, 1, char, 4, 0, -window['maxBaseline'], !(j === newCharCode))
                            $('#glyphs').append(grid)
                            setGlyphTable(grid.find('.glyph'))
                        }
                    }

                } else {
                    $('.ui.modal.message p').text('This character is already present in the actual set, I\'m not adding it.')
                    $('.ui.modal.message').modal('show')
                }
            }
        })
            .modal('show');

    })

    $('#export').click(function () {
        const glyphs = []
        const bitsArray = []
        let offset = 0
        const firstglyph = parseInt($('#firstglyph').val(), 16)
        const lastglyph = parseInt($('#lastglyph').val(), 16)

        $('.table.glyph').each(function () {
            const t = $(this)
            // Ignore glyphs outside of requested range
            if (t.attr('data-char').charCodeAt(0) < firstglyph || t.attr('data-char').charCodeAt(0) > lastglyph) {
                return
            }

            var dataPixels = $(this).attr('data-pixels')
            if (t.attr('data-dis') == 1) {
                dataPixels = ''
            }
            let bits = ''

            for (let i = 0; i < dataPixels.length; i++) {
                bits += dataPixels.charAt(i)
                // Each 8 bits, we form the HEX value
                if (bits.length == 8) {
                    bitsArray.push('0x' + ('00' + parseInt((bits + '00000000').slice(0, 8), 2).toString(16).toUpperCase()).slice(-2))
                    bits = ''
                }
            }

            // Remaining bits with padding then, if necessary
            if (bits != '') {
                bitsArray.push('0x' + ('00' + parseInt((bits + '00000000').slice(0, 8), 2).toString(16).toUpperCase()).slice(-2))
            }

            // Set data width/height to 0 for disabled glyphs
            const w = parseInt(t.attr('data-w')) * (1 - parseInt(t.attr('data-dis')))
            const h = parseInt(t.attr('data-h')) * (1 - parseInt(t.attr('data-dis')))

            let char = t.attr('data-char')
            const charCode = char.charCodeAt(0).toString(16).toUpperCase()
            const charDisplay = char.replace(/[\x00-\x1F\x7F-\x9F\xAD]/g, 'non-printable')
            const comment = '// 0x' + charCode + ' \'' + charDisplay + '\''

            if (t.attr('data-dis') == 0) {
                glyphs.push(
                    '  { ' +
                    ('     ' + offset).slice(-5) + ', ' +
                    ('   ' + w).slice(-3) + ', ' +
                    ('   ' + h).slice(-3) + ', ' +
                    ('   ' + parseInt(t.attr('data-adv'))).slice(-3) + ', ' +
                    ('    ' + parseInt(t.attr('data-ow'))).slice(-4) + ', ' +
                    ('    ' + parseInt(t.attr('data-oh'))).slice(-4) + ' },   ' +
                    comment)
            } else {
                glyphs.push(
                    '  { ' +
                    '    0, ' +
                    '  0, ' +
                    '  0, ' +
                    '  0, ' +
                    '   0, ' +
                    '   0 },   ' +
                    comment)
            }

            offset = bitsArray.length
        })

        // Bitmaps
        let bitmapsOutput = 'const uint8_t ' + name + 'Bitmaps[] PROGMEM = {\n'
        // We want to join per 12 words
        const limit = Math.floor(bitsArray.length / 12)
        for (let nb = 0; nb < limit; nb++) {
            const isLastLine = (limit * 12 === bitsArray.length) && (nb === limit - 1)

            bitmapsOutput += '  ' + bitsArray[nb * 12] + ', ' +
                bitsArray[nb * 12 + 1] + ', ' +
                bitsArray[nb * 12 + 2] + ', ' +
                bitsArray[nb * 12 + 3] + ', ' +
                bitsArray[nb * 12 + 4] + ', ' +
                bitsArray[nb * 12 + 5] + ', ' +
                bitsArray[nb * 12 + 6] + ', ' +
                bitsArray[nb * 12 + 7] + ', ' +
                bitsArray[nb * 12 + 8] + ', ' +
                bitsArray[nb * 12 + 9] + ', ' +
                bitsArray[nb * 12 + 10] + ', ' +
                bitsArray[nb * 12 + 11] + (isLastLine ? '' : ',') + ' \n'
        }

        if (limit * 12 !== bitsArray.length) {
            bitmapsOutput += '  ' + bitsArray.slice(-(bitsArray.length - limit * 12)).join(', ') + '\n'
        }
        bitmapsOutput += '};\n\n'

        // Glyphs
        // The last glyph has a ',' too much at the end, we need to remove it (it's easier than to avoid putting it in the first place)
        glyphs[glyphs.length - 1] = glyphs[glyphs.length - 1].replace('},', '} ')
        let glyphsOutput = 'const GFXglyph ' + name + 'Glyphs[] PROGMEM = {\n'
        glyphsOutput += glyphs.join('\n') + '\n};\n\n'

        // Create a new last_part with the updated first & last glyph values in it
        let parts = window['last_part'].split(',')
        parts[2] = '0x' + firstglyph.toString(16).toUpperCase()
        parts[3] = '0x' + lastglyph.toString(16).toUpperCase()
        const updated_last_part = parts.join(", ", parts)

        data = bitmapsOutput + glyphsOutput + updated_last_part
        $('#result').val(data)
    })
})
