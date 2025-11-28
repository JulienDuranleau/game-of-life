const { floor, round, random } = Math

const initial_spawn_ratio = 0.25
const cell_size = 15
const fps = 1000 / 10
const rows = floor(window.innerHeight / cell_size)
const cols = floor(window.innerWidth / cell_size)

// Canvas setup
const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

canvas.width = cols * cell_size
canvas.height = rows * cell_size

// Swappable arrays
let cells = new Array(cols * rows)
let old_cells = new Array(cells.length)

// Interval
let runtime_interval = null

// Events
document.querySelector(".box").addEventListener("click", e => e.currentTarget.classList.add("autohide"))
document.querySelector(".resume").addEventListener("click", flow_resume)
document.querySelector(".pause").addEventListener("click", flow_pause)
document.querySelector(".reset").addEventListener("click", flow_reset)
document.querySelector(".step").addEventListener("click", tick)

// Start
flow_reset()
flow_resume()

function flow_resume() {
    clearInterval(runtime_interval)
    runtime_interval = setInterval(tick, fps)
}

function flow_pause() {
    clearInterval(runtime_interval)
}

function flow_reset() {
    for (let i = 0; i < cells.length; i++) {
        const is_alive = Math.random() < initial_spawn_ratio
        cells[i] = is_alive ? round(random() * 360) : 0
    }

    drawCells()
}

function tick() {
    updateCells()
    drawCells()
}

function updateCells() {
    // Flip arrays
    [cells, old_cells] = [old_cells, cells]

    // 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
    // 2. Any live cell with two or three live neighbours lives on to the next generation.
    // 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
    // 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

    for (let i = 0; i < old_cells.length; i++) {
        const neighbours = getNeighbourIndices(i)
        const neighbours_alive = neighbours.map(i => old_cells[i]).filter(v => v !== 0)

        const is_alive = old_cells[i] > 0

        if (is_alive) {
            if (neighbours_alive.length < 2) { // #1
                cells[i] = 0
            } else if (neighbours_alive.length > 3) { // #3
                cells[i] = 0
            } else { // #2
                cells[i] = old_cells[i]
            }
        } else {
            if (neighbours_alive.length === 3) { // #4
                cells[i] = neighbours_alive[floor(random() * neighbours_alive.length)]
            } else {
                cells[i] = 0
            }
        }
    }
}

function drawCells() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const index = y * cols + x

            const cellx = x * cell_size
            const celly = y * cell_size

            const color = cells[index]

            if (cells[index]) {
                ctx.fillStyle = `hsl(${color}, 100%, 65%)`

                // ctx.fillRect(cellx, celly, cell_size, cell_size)

                ctx.beginPath()
                ctx.arc(cellx + cell_size * 0.5, celly + cell_size * 0.5, cell_size * 0.5, 0, Math.PI * 2)
                ctx.fill()
            }
        }
    }
}

function getNeighbourIndices(i) {
    const neighbours = []

    const x = i % cols
    const y = floor(i / cols)

    for (let offset_y = -1; offset_y <= 1; offset_y++) {
        for (let offset_x = -1; offset_x <= 1; offset_x++) {
            if (offset_y === 0 && offset_x === 0) {
                continue // skip self
            }

            let neighbour_x = x + offset_x
            let neighbour_y = y + offset_y

            if (neighbour_x === -1) {
                neighbour_x = cols - 1
            } else if (neighbour_x === cols) {
                neighbour_x = 0
            }

            if (neighbour_y === -1) {
                neighbour_y = rows - 1
            } else if (neighbour_y === rows) {
                neighbour_y = 0
            }

            neighbours.push(neighbour_y * cols + neighbour_x)
        }
    }

    return neighbours
}