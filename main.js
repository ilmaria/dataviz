const tiles = [
    '',   '',   '',   '',   '',   '',   '',   '',
    '',   '',   '',   '',   'X43','X51','',   '',

    '',   '',   'W34','',   'W44','W52','',   '',
    '',   '',   'W33','W41','W43','W51','',   '',

    '',   '',   'V34','V42','V44','V52','',   '',
    '',   '',   '',   'V41','V43','V51','V53','',

    '',   '',   '',   'U42','U44','U52','U54','',
    '',   '',   '',   'U41','U43','U51','U53','',

    '',   '',   '',   'T42','T44','T52','T54','',
    '',   '',   '',   'T41','T43','T51','T53','',

    '',   '',   '',   'S42','S44','S52','S54','',
    '',   '',   '',   'S41','S43','S51','S53','',

    '',   '',   '',   'R42','R44','R52','R54','',
    '',   '',   '',   'R41','R43','R51','R53','',

    '',   '',   'Q34','Q42','Q44','Q52','Q54','',
    '',   'Q31','Q33','Q41','Q43','Q51','Q53','',

    '',   'P32','P34','P42','P44','P52','P54','P62',
    '',   'P31','P33','P41','P43','P51','P53','P61',

    '',   'N32','N34','N42','N44','N52','N54','N62',
    '',   'N31','N33','N41','N43','N51','N53','N61',

    '',   'M32','M34','M42','M44','M52','M54','',
    '',   'M31','M33','M41','M43','M51','M53','',
    
    'L24','L32','L34','L42','L44','L52','',   '',
    'L23','L31','L33','L41','L43','L51','',   '',

    'K24','K32','K34','K42','K44','',   '',    ''
]

const canvas = d3.select('#canvas')
const ctx = canvas.node().getContext('2d')
const images = []
let prevSeaLevel = 0
let seaLevel = prevSeaLevel
const seaColor = [191, 211, 255]
const elevationColors = [
    [191, 211, 255],
    [105, 157, 77],
    [118, 175, 86],
    [132, 195, 97],
    [146, 215, 107],
    [158, 233, 117],
    [172, 245, 123],
    [185, 245, 121],
    [201, 247, 120],
    [218, 250, 118],
    [236, 252, 120],
    [250, 252, 117],
    [252, 243, 109],
    [252, 233, 101],
    [252, 222, 93],
    [250, 203, 81],
    [250, 190, 74],
    [247, 178, 67],
    [233, 170, 63]
]

function drawTile(img, x, y) {
    const idx = y*8 + x
    const tile = tiles[idx]

    if (tile === '') {
        ctx.clearRect(x*60, y*30, 60, 30);
    } else {
        ctx.drawImage(img, x*60, y*30, 60, 30);
    }

    // debug rectangles
    // ctx.beginPath();
    // ctx.rect(x*60, y*30, 60, 30);
    // ctx.stroke();
    // ctx.closePath();
}

function loadImage(x, y) {
    const idx = y*8 + x
    const tile = tiles[idx]
    if (tile === '') {
        return
    }

    const img = new Image()
    img.onload = function(e) {
        drawTile(img, x, y)
    }
    img.src = `height_data/${tile}.png`
    images[y*8 + x] = img
}

function canvasZoom(transform) {
    const width = canvas.property('width')
    const height = canvas.property('height')
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);
    
    // draw map
    for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 8; x++) {
            drawTile(images[y*8 + x], x, y)
        }
    }

    if (prevSeaLevel !== seaLevel) {
        const pixels = ctx.getImageData(0, 0, width, height)
        for (let c, i = 0, n = width * height * 4, d = pixels.data; i < n; i += 4) {
            const r = d[i + 0]
            const g = d[i + 1]
            let underSea = false
            switch (r) {
                case 105:
                    underSea = seaLevel >= 10
                    break
                case 118:
                    underSea = seaLevel >= 20
                    break
                case 132:
                    underSea = seaLevel >= 30
                    break
                case 146:
                    underSea = seaLevel >= 40
                    break
                case 158:
                    underSea = seaLevel >= 50
                    break
                case 172:
                    underSea = seaLevel >= 60
                    break
                case 185:
                    underSea = seaLevel >= 70
                    break
                case 201:
                    underSea = seaLevel >= 80
                    break
                case 218:
                    underSea = seaLevel >= 90
                    break
                case 236:
                    underSea = seaLevel >= 100
                    break
                case 250:
                    switch (g) {
                        case 252:
                            underSea = seaLevel >= 110
                            break
                        case 203:
                            underSea = seaLevel >= 150
                            break
                        case 190:
                            underSea = seaLevel >= 160
                            break
                        default:
                            break
                    }
                case 252:
                    switch (g) {
                        case 243:
                            underSea = seaLevel >= 120
                            break
                        case 233:
                            underSea = seaLevel >= 130
                            break
                        case 222:
                            underSea = seaLevel >= 140
                            break
                        default:
                            break
                    }
                case 247:
                    underSea = seaLevel >= 170
                    break
                case 233:
                    underSea = seaLevel >= 180
                    break
                default:
            }
            if (underSea) {
                d[i + 0] = seaColor[0]
                d[i + 1] = seaColor[1]
                d[i + 2] = seaColor[2]
            }
        }
        ctx.putImageData(pixels, 0, 0)
        prevSeaLevel = seaLevel
    }
    
    ctx.restore();
}

(async function () {
    let currentTransform = d3.zoomIdentity

    canvas.call(d3.zoom()
        .scaleExtent([1, 30])
        .on("zoom", () => {
            currentTransform = d3.event.transform
            canvasZoom(currentTransform)
        }));

    for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 8; x++) {
            loadImage(x, y)
        }
    }

    const slider = document.querySelector('#sea-level')
    const currentSeaLevel = document.querySelector('#curr-sea-level')
    slider.oninput = (ev) => {
        seaLevel = Number(ev.target.value)
        currentSeaLevel.textContent = ev.target.value
        canvasZoom(currentTransform)
    }
})()