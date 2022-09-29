
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
    constructor(x, y, c) {
        this.position = [x, y]
        this.piece_ = null
        this.color_ = c
    }

    get color() {
        4
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
    
    //let path = Array(4).fill([4, "R", 2, "R", 4, "L"]).flat()
    let path = "eeeeReRNNNNNRR----NR-NN!-!-R!-R!-NNeLLReeeL"

    // https://stackoverflow.com/questions/22015684/how-do-i-zip-two-arrays-in-javascript
    const zip = (a, b) => a.map((k, i) => [k, b[i]])

    let cpath = Array(4).fill(path)
    let colors_path = "brga".split("")

    //let npath = zip(cpath, colors_path).map((z)=>z[0].replace("_", z[1]))
    let npath = zip(cpath, colors_path).map((z) => z[0].replaceAll('-', z[1])).join('')

    return npath
}

function buildLayout(npath, width, height, xoff, yoff) {
    var slots = []
    let stepsize = 3 * Piece.r
    let x = width / 2 + xoff
    let y = height / 2 + yoff

    let dx = 1
    let dy = 0

    let current_color = colors.none

    let pop = false

    for (let cmd of npath) {
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
                let slot = new Slot(x, y, current_color)
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
        //slots.push([x, y, null])
        slots.push(new Slot(x, y, colors.none))
    }

    n = 16
    radius = 100.0

    for (let i = 0; i < n; i++) {
        let rho = 2 * Math.PI * i / n
        let x = radius * Math.sin(rho) + width / 2
        let y = radius * Math.cos(rho) + height / 2
        //slots.push([x, y, null])
        slots.push(new Slot(x, y, colors[Object.keys(colors)[i % 4]]))
    }
    return slots
}

function drawSlots(ctx, slots) {
    //for (let [x, y, piece] of slots){
    for (let slot of slots) {
        var [x, y] = slot.pos
        ctx.beginPath()

        if (slot.hasPiece) {
            ctx.fillStyle = slot.piece.color[0]
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
        this.opacity = 1.0
        this.rn = "-"
    }

    roll() {
        this.rn = Math.floor(Math.random() * this.to) + this.from
        console.log(this.rn)
    }

    get number() {
        return this.rn
    }

    opacity_reset() {
        this.opacity = 0.0
    }

    opacity_inc() {
        if (this.opacity < 1)
            this.opacity += 0.1
    }
}

function drawDice(ctx, dice) {
    w = ctx.canvas.width
    h = ctx.canvas.height
    n = dice.number

    ctx.beginPath()
    ctx.fillStyle = 'black';
    ctx.font = 2 * Piece.r + 'px serif';
    ctx.fillText(n, w / 2 - 12, h / 2 + 12)

    ctx.fillStyle = "rgba(241, 241, 241," + dice.opacity + ")"
    ctx.rect(w / 2 - 23, h / 2 - 23, 46, 46)
    ctx.fill()

    ctx.closePath()
}



const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
Piece.r = Math.min(canvas.height, canvas.width) / 45

let dice = new Dice(1, 6)
//let dice_opacity = 0


//let slots = createSlots(canvas.width, canvas.height)
let slots = buildLayout(createClassicLayout(), canvas.width, canvas.height, Piece.r * 3, -Piece.r * 3)
var selected = null

var dr = null

function mousePosition(e) {
    // https://stackoverflow.com/questions/43955925/html5-responsive-canvas-mouse-position-and-resize
    var mouseX = e.offsetX * canvas.width / canvas.clientWidth | 0;
    var mouseY = e.offsetY * canvas.height / canvas.clientHeight | 0;
    //return {x: mouseX, y: mouseY};
    return [mouseX, mouseY]
}

document.addEventListener("mousedown", (e) => {
    var slot = findSlot(slots, mousePosition(e))
    //console.log("down", slot)

    if (slot && slot.hasPiece) {
        selected = slot
    } /* else if (slot && e.button == 1){ // for debugging
                    slot.piece = new Piece(colors.red)
                } */
    dr = mousePosition(e)
})

document.addEventListener("mouseup", (e) => {
    if (selected != null) {
        var new_slot = findSlot(slots, mousePosition(e))
        //console.log("up", new_slot)

        if (new_slot && !(new_slot.hasPiece)) {// && (new_slot.color == current.piece.color || new_slot.color == colors.none)){
            new_slot.piece = selected.piece
            selected.empty()
        } else if (new_slot && (new_slot.hasPiece)) {// && (new_slot.color == current.piece.color || new_slot.color == colors.none)){

            if (new_slot.piece.color == selected.piece.color) {
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
                new_slot.piece = selected.piece
                goHome(p)

                selected.empty()
            }
        }
    }
    selected = null
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
        dice.opacity_reset()
    }
    if (e.code == "Enter") {
        enter_pressed = false
        dice.roll()
        dice.opacity_reset()
    }
})

document.addEventListener("keydown", (e) => {
    //console.log("keydown")
    if (e.code == "Enter") {
        if (!enter_pressed) {
            //console.log("enter down")
            dice.opacity = 0.5
        }
        enter_pressed = true
        dice.opacity_inc()
    }

    if (e.code == "Space") {
        if (!space_pressed) {
            //console.log("space down")
            dice.opacity = 0.5
        }
        space_pressed = true
        dice.opacity_inc()
    }
})


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawSlots(ctx, slots)

    if (dr) {
        ctx.beginPath()
        ctx.strokeStyle = "#999999"
        ctx.arc(dr[0], dr[1], 10, 0, Math.PI * 2)
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.closePath()
    }
    if (selected) {
        ctx.beginPath()
        ctx.fillStyle = selected.piece.color[2]
        ctx.strokeStyle = selected.piece.color[1]
        ctx.arc(dr[0], dr[1], Piece.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.closePath()
    }
    drawDice(ctx, dice)
    requestAnimationFrame(draw)
}

draw()