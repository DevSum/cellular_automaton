'use strict'
function Cellar(x, y) {
    this.x = x
    this.y = y
}
const LifeState = {
    alive: 'alive',
    dead: 'dead',
}

class CellarController {
    SCALE = 10
    RULE_LIST = {
        [LifeState.alive]: [
            {le: 1, state: LifeState.dead},
            {le: 3, state: LifeState.alive},
            {le: 8, state: LifeState.dead},
        ],
        [LifeState.dead]: [
            {le: 2, state: LifeState.dead},
            {le: 3, state: LifeState.alive},
            {le: 8, state: LifeState.dead},
        ],
    }
    refreshTimer = null

    constructor(cavansElement) {
        this.canvas = cavansElement
        this.canvas.getContext('2d').scale(this.SCALE, this.SCALE)
        this.cellarBag = new Set()
        if (!cavansElement) {
            console.error('No canvas!')
            return
        }
        this.testCanvas()
        this.bindMouseAdder()
    }


    testCanvas = () => {
        // console.log('pass', this)
    }
    newCellar = (x, y) => {
        const cellar = new Cellar(x, y)
        this.cellarBag.add(cellar)
        this.refresh()
    }

    clear = () => {
        const canvas = this.canvas
        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)
    }
    draw() {
        const ctx = this.canvas.getContext('2d')
        this.cellarBag.forEach(cellar =>  {
            ctx.fillStyle = '#000000'
            ctx.fillRect(cellar.x, cellar.y, 1, 1)
        })
    }
    refresh = () => {
        this.clear()
        this.draw()
    }

    start() {
        this.setFrequency(1000)
    }

    getPositionFromClick(x, y) {
        // let t
        // const scollor = (((t = document.documentElement) || (t = document.body.parentNode))
        // && typeof t.scrollLeft == 'number' ? t : document.body)
        //
        // const { scrollLeft, scrollTop } = scollor
        const { top, left } = this.canvas.getBoundingClientRect()
        return [Math.floor((x - left) / this.SCALE), Math.floor((y - top) / this.SCALE)]
    }
    bindMouseAdder() {
        // this.canvas.addEventListener('click', (e) => {
        //     const [x, y] = this.getPositionFromClick(e.clientX, e.clientY)
        //     this.newCellar(x, y)
        // })
        this.canvas.addEventListener('mousemove', (e) => {
            const [x, y] = this.getPositionFromClick(e.clientX, e.clientY)
            this.newCellar(x, y)
        })
    }

    applyRules(state, neighborCount) {
        for (const rule of this.RULE_LIST[state]) {
            if (neighborCount <= rule.le) {
                return rule.state
            }
        }
        return LifeState.dead
    }

    nextGeneration() {
        const positionAlive = {}
        this.cellarBag.forEach(cellar => {
            positionAlive[`${cellar.x}-${cellar.y}`] = true
        })
        const nextGenerationCalculated = new Set()
        const nextGenerationBag = new Set()
        this.cellarBag.forEach(cellar => {
            for (let i=-1; i <= 1; i++) {
                for (let j=-1; j <= 1; j++) {
                    const x = cellar.x + i
                    const y = cellar.y + j
                    if (!nextGenerationCalculated.has(`${x}-${y}`)) {
                        nextGenerationCalculated.add(`${x}-${y}`)

                        let neighborCount = 0
                        for (let k=-1; k <= 1; k++) {
                            for (let l = -1; l <= 1; l++) {
                                if (k === 0 && l === 0) {
                                    continue
                                }
                                if (positionAlive[`${x+k}-${y+l}`]) {
                                    neighborCount += 1
                                }
                            }
                        }
                        const state = this.applyRules(positionAlive[`${x}-${y}`] ? LifeState.alive : LifeState.dead, neighborCount)
                        if (state === LifeState.alive) {
                            nextGenerationBag.add(new Cellar(x, y))
                        }
                    }
                }
            }
        })
        this.cellarBag = nextGenerationBag
    }

    reset() {
        this.cellarBag = new Set()
        this.refresh()
    }

    setFrequency(interval) {
        console.log(interval)
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer)
        }
        this.refreshTimer = setInterval(() => {
            this.nextGeneration()
            this.refresh()
        }, interval)
    }
}
