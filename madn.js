const colors = {
    // (piecefill, boarder, emptyfill)
    blue: ["#0052cc", "#003380", "#99c2ff"],
    red: ["#b30000", "#800000", "#ff9999"],
    green: ["#00e64d", "#00802b", "#80ffaa"],
    //black: ["#595959", "#404040", "#cccccc"],
    black:["#944dff", "#6600ff", "#d1b3ff"],
    none: ["", "#1a1a1a", "#e6e6e6"]
}

class Slot {
    constructor(x, y, c, s) {
        this.position = [x, y]
        this.piece_ = null
        this.color_ = c
        this.start = s
    }

    get color() {
        return this.color_
    }

    set color(c) {
        this.color_ = c
    }

    get pos() {
        return this.position
    }

    get hasPiece() {
        return this.piece_ != null
    }

    get piece() {
        return this.piece_
    }

    set piece(piece) {
        this.piece_ = piece
    }

    empty() {
        this.piece_ = null
    }

    isStart(){
        return this.start
    }
}

class Piece {
    static r = 24
    constructor(c) {
        this.color_ = c
        this.home = null
    }

    get color() {
        return this.color_
    }
}

function createClassicLayout(){
    let path = "eeeeReRNNNNNRR----NR*-NN!-!-R!-R!-NNeLLReeeL"
    // https://stackoverflow.com/questions/22015684/how-do-i-zip-two-arrays-in-javascript
    const zip = (a, b) => a.map((k, i) => [k, b[i]])
    let cpath = Array(4).fill(path)
    let colors_path = "brga".split("")
    let npath = zip(cpath, colors_path).map((z) => z[0].replaceAll('-', z[1])).join('')
    return npath
}

function buildLayout(path, width, height, xoff, yoff) {
    var slots = []
    let stepsize = 3 * Piece.r
    let x = width / 2 + xoff
    let y = height / 2 + yoff

    let dx = 1
    let dy = 0

    let current_color = colors.none
    let pop = false // populate
    let start = false

    for (let cmd of path) {
        switch (cmd) {
            case "R": // turn right
                [dx, dy] = [-dy, dx]
                break
            case "L": // turn left
                [dx, dy] = [dy, -dx]
                break
            case "!":
                pop = true
                break
            case "*":
                start = true
                break
            default:
                x += dx * stepsize
                y += dy * stepsize
                switch (cmd) {
                    case "e":
                        current_color = colors.none
                        break
                    case "b": // blue
                        current_color = colors.blue
                        break
                    case "g": // green
                        current_color = colors.green
                        break
                    case "a": // black
                        current_color = colors.black
                        break
                    case "r": // red
                        current_color = colors.red
                        break
                    case "N":
                        continue
                }

                let slot = new Slot(x, y, current_color, start)
                start = false
                slots.push(slot)

                if (pop) {
                    slot.piece = new Piece(current_color)
                    pop = false
                    slot.piece.home = slot
                }
        }
    }
    return slots
}

function createSlots(width, height) {
    let n = 32
    let radius = 70.0
    var slots = []

    for (let i = 0; i < n; i++) {
        let rho = 2 * Math.PI * i / n
        let x = radius * Math.sin(rho) + width / 2
        let y = radius * Math.cos(rho) + height / 2
        slots.push(new Slot(x, y, colors.none))
    }

    n = 16
    radius = 100.0

    for (let i = 0; i < n; i++) {
        let rho = 2 * Math.PI * i / n
        let x = radius * Math.sin(rho) + width / 2
        let y = radius * Math.cos(rho) + height / 2
        slots.push(new Slot(x, y, colors[Object.keys(colors)[i % 4]]))
    }
    return slots
}

function drawSlots(ctx, slots) {
    for (let slot of slots) {
        var [x, y] = slot.pos
        ctx.beginPath()

        if (slot.hasPiece) {
            ctx.fillStyle = slot.piece.color[0]
        } else if (slot.isStart()){
            ctx.fillStyle = colors.none[2]
        } else {
            ctx.fillStyle = slot.color[2]
        }

        ctx.strokeStyle = slot.color[1]

        ctx.arc(x, y, Piece.r, 0, Math.PI * 2)
        ctx.lineWidth = 5

        ctx.stroke()
        ctx.fill()
        ctx.closePath()
    }
}

function intersects(pos0, pos1, radius) {
    let [x, y] = pos0
    let [x_, y_] = pos1
    return Math.sqrt(((x_ - x) ** 2 + (y_ - y) ** 2)) <= radius
}

function findSlot(slots, pos) {
    for (let slot of slots) {
        if (intersects(slot.pos, pos, Piece.r)) {
            return slot
        }
    }
    return null
}




class Dice {
    constructor(from, to) {
        this.from = from
        this.to = to
        this.opacity = 0.0
        this.rn = "-"

        this.cnt = 0
    }

    roll() {
        this.rn = Math.floor(Math.random() * this.to) + this.from
        console.log(this.rn)
        this.opacity_reset()
        this.cnt = 10
    }

    get number() {
        return this.rn
    }

    opacity_reset() {
        this.opacity = 1.0
    }

    dec(){
        this.cnt -= 1
    }
}

function drawDice(ctx, dice) {
    w = ctx.canvas.width
    h = ctx.canvas.height
    n = dice.number
    r = Piece.r

    ctx.beginPath()
    ctx.fillStyle = "rgba(0, 0, 0," + dice.opacity + ")"
    ctx.font = 2 * r + 'px serif';
    ctx.fillText(n, w / 2 - (r/2), h / 2 + (r/2))

    if(dice.cnt > 0){
        ctx.fillStyle = "rgba(241, 241, 241, 1)"
        ctx.rect(w / 2 - r, h / 2 - r, r*2, r*2)
        ctx.fill()
        dice.dec()
    }

    ctx.closePath()
}


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
Piece.r = Math.min(canvas.height, canvas.width) / 45

let dice = new Dice(1, 6)
let dice_pressed = false

let slots = buildLayout(createClassicLayout(), canvas.width, canvas.height, Piece.r * 3, -Piece.r * 3)

let origin_slot = null
let dr = null
let select = false


function intersectsDice(w, h, pos){
    r = Piece.r
    let x_ = w/2
    let y_ = h/2

    if (pos[0] > x_ - r && pos[0] < x_ + r && pos[1] > y_ -r && pos[1] < y_ + r){
        return true
    }
    return false
}

function mousePosition(e) {
    // https://stackoverflow.com/questions/43955925/html5-responsive-canvas-mouse-position-and-resize
    var mouseX = e.offsetX * canvas.width / canvas.clientWidth | 0;
    var mouseY = e.offsetY * canvas.height / canvas.clientHeight | 0;
    return [mouseX, mouseY]
}

document.addEventListener("mousedown", (e) => {
    let pos = mousePosition(e)
    if (intersectsDice(ctx.canvas.width, ctx.canvas.height, pos)){
        if (!dice_pressed){
            dice.opacity = 0.5
            dice_pressed = true
        } 
    }

    var slot = findSlot(slots, pos)

    if (!select && slot && slot.hasPiece) {
        origin_slot = slot
        select = true
    }
    dr = mousePosition(e)
})

document.addEventListener("mouseup", (e) => {
    if (dice_pressed){
        dice_pressed = false
        dice.opacity_reset()
        dice.roll()
    }

    if (origin_slot != null) {
        var new_slot = findSlot(slots, mousePosition(e))
        if (select && new_slot == origin_slot){
            return
        } else if (select){
            select = false
        }
        if (new_slot && !(new_slot.hasPiece)) {
            if (new_slot.isStart()){
                new_slot.piece = origin_slot.piece
                origin_slot.empty()
            } else {
                if ((new_slot.color == origin_slot.piece.color) || (new_slot.color == colors.none)){
                    new_slot.piece = origin_slot.piece
                    origin_slot.empty()
                }
            }
        } else if (new_slot && (new_slot.hasPiece)) {

            if (new_slot.piece.color == origin_slot.piece.color) {
                // do nothing
            } else if (new_slot.color != colors.none && new_slot.color != origin_slot.color && !new_slot.isStart()){
                // do nothing
            } else {
                function goHome(piece) {
                    if (!piece.home.hasPiece) {
                        piece.home.piece = piece
                        return
                    }

                    tmp = piece.home.piece
                    piece.home.piece = piece

                    goHome(tmp)
                }

                p = new_slot.piece
                new_slot.piece = origin_slot.piece
                goHome(p)

                origin_slot.empty()
            }
        }
    }
    origin_slot = null
    dr = null
})

document.addEventListener("mousemove", (e) => {
    if (dr != null) {
        dr = mousePosition(e)
    }
})


let enter_pressed = false
let space_pressed = false

document.addEventListener("keyup", (e) => {
    if (e.code == "Space") {
        space_pressed = false
        dice.roll()
    }
    if (e.code == "Enter") {
        enter_pressed = false
        dice.roll()
    }
})

document.addEventListener("keydown", (e) => {
    if (e.code == "Enter") {
        if (!enter_pressed) {
            dice.opacity = 0.5
        }
        enter_pressed = true
        //dice.opacity_inc()
    }

    if (e.code == "Space") {
        if (!space_pressed) {
            dice.opacity = 0.5
        }
        space_pressed = true
        //dice.opacity_inc()
    }
})


function drawDraggingPiece(ctx, dragged){
    ctx.beginPath()
    ctx.strokeStyle = "#999999"
    ctx.arc(dragged[0], dragged[1], 10, 0, Math.PI * 2)
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.closePath()
}

function drawSelectedPiece(ctx,  piece){
    ctx.beginPath()
    ctx.fillStyle = piece.color[2]
    ctx.strokeStyle = piece.color[1]
    ctx.arc(dr[0], dr[1], Piece.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.closePath()
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawSlots(ctx, slots)

    if (dr) {
        drawDraggingPiece(ctx, dr)
    }
    if (origin_slot) {
        drawSelectedPiece(ctx, origin_slot.piece)
    }
    drawDice(ctx, dice)
    requestAnimationFrame(draw)
}

draw()