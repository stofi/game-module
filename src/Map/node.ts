import { createHash } from '../crypto'
import { v4 } from 'uuid'

interface EntranceI {
    i: number
}
type EntracesT = {
    top: EntranceI
    bottom: EntranceI
    left: EntranceI
    right: EntranceI
}
import { randomInt } from '../seed'

export default class MapNode {
    x0 = 0
    y0 = 0
    x1 = 1
    y1 = 1
    start = false
    end = false
    id = v4()
    index = 0
    entrances: EntracesT
    constructor(
        public x: number,
        public y: number,
        public connections: MapNode[]
    ) {
        this.entrances = {
            top: { i: 1 },
            bottom: { i: 1 },
            left: { i: 1 },
            right: { i: 1 },
        }
    }

    public translate(x: number, y: number) {
        this.x += x
        this.y += y
    }

    public hasArea(x: number, y: number) {
        return x >= this.x0 && x <= this.x1 && y >= this.y0 && y <= this.y1
    }

    public getArea(buffer = 0) {
        const w = this.x1 - this.x0 + 2 * buffer
        const h = this.y1 - this.y0 + 2 * buffer

        const area = new Array(w * h).fill(0).map((_, i) => ({
            x: this.x + this.x0 + (i % w),
            y: this.y + this.y0 + Math.floor(i / w),
        }))

        return area
    }

    public getWalls() {
        const area = this.getArea()

        const walls = area.filter((p) => {
            // filter out points that are not on the edge of the area
            return (
                !area.some((p2) => p2.x === p.x && p2.y === p.y - 1) ||
                !area.some((p2) => p2.x === p.x && p2.y === p.y + 1) ||
                !area.some((p2) => p2.x === p.x - 1 && p2.y === p.y) ||
                !area.some((p2) => p2.x === p.x + 1 && p2.y === p.y)
            )
        })

        return walls
    }

    public getAreaSize() {
        return (this.x1 - this.x0) * (this.y1 - this.y0)
    }

    public areaSizeIsLessThanOne() {
        return this.getAreaSize() < 1
    }

    public addTop() {
        this.y0--

        if (this.areaSizeIsLessThanOne()) {
            this.y0++
        } else {
            this.randomizeEntrances()
        }
    }

    private randomizeEntrances() {
        this.entrances.left.i = randomInt(1, this.y1 - this.y0 - 1)
        this.entrances.right.i = randomInt(1, this.y1 - this.y0 - 1)
        this.entrances.top.i = randomInt(1, this.x1 - this.x0 - 1)
        this.entrances.bottom.i = randomInt(1, this.x1 - this.x0 - 1)
    }

    public addBottom() {
        this.y1++

        if (this.areaSizeIsLessThanOne()) {
            this.y1--
        } else {
            this.randomizeEntrances()
        }
    }

    public addLeft() {
        this.x0--

        if (this.areaSizeIsLessThanOne()) {
            this.x0++
        } else {
            this.randomizeEntrances()
        }
    }

    public addRight() {
        this.x1++

        if (this.areaSizeIsLessThanOne()) {
            this.x1--
        } else {
            this.randomizeEntrances()
        }
    }

    public removeTop() {
        this.y0++

        if (this.areaSizeIsLessThanOne()) {
            this.y0--
        } else {
            this.randomizeEntrances()
        }
    }

    public removeBottom() {
        this.y1--

        if (this.areaSizeIsLessThanOne()) {
            this.y1++
        } else {
            this.randomizeEntrances()
        }
    }

    public removeLeft() {
        this.x0++

        if (this.areaSizeIsLessThanOne()) {
            this.x0--
        } else {
            this.randomizeEntrances()
        }
    }

    public removeRight() {
        this.x1--

        if (this.areaSizeIsLessThanOne()) {
            this.x1++
        } else {
            this.randomizeEntrances()
        }
    }

    public hasPoint(x: number, y: number) {
        return (
            x >= this.x + this.x0 &&
            x <= this.x + this.x1 &&
            y >= this.y + this.y0 &&
            y <= this.y + this.y1
        )
    }

    public overlaps(node: MapNode, buffer = 0) {
        const points = this.getArea(buffer)

        return points.some((p) => node.hasPoint(p.x, p.y))
    }

    public hash() {
        const string = `${this.x},${this.y},${this.x0},${this.y0},${this.x1},${this.y1}`

        return createHash(string)
    }

    public getEntraceDirectionClosestToNode(node: MapNode) {
        const x = this.x - node.x
        const y = this.y - node.y

        if (Math.abs(x) > Math.abs(y)) {
            return x > 0 ? 'left' : 'right'
        } else {
            return y > 0 ? 'top' : 'bottom'
        }
    }

    public getEntranceCoordinates(
        direction: 'top' | 'bottom' | 'left' | 'right'
    ) {
        const w = this.x1 - this.x0
        const h = this.y1 - this.y0

        const i = this.entrances[direction].i

        switch (direction) {
            case 'top':
                return {
                    x: this.x + this.x0 + Math.floor(i / h),
                    y: this.y + this.y0,
                }
            case 'bottom':
                return {
                    x: this.x + this.x0 + Math.floor(i / h),
                    y: this.y + this.y1,
                }
            case 'left':
                return {
                    x: this.x + this.x0,
                    y: this.y + this.y0 + Math.floor(i / w),
                }
            case 'right':
                return {
                    x: this.x + this.x1,
                    y: this.y + this.y0 + Math.floor(i / w),
                }
        }
    }

    static toJSON(node: MapNode) {
        return {
            id: node.id,
            x: node.x,
            y: node.y,
            x0: node.x0,
            y0: node.y0,
            x1: node.x1,
            y1: node.y1,
            start: node.start,
            end: node.end,
            connections: node.connections.map((c) => c.id),
        }
    }

    static fromJSON(json: string | any) {
        const data = typeof json === 'string' ? JSON.parse(json) : json
        const node = new MapNode(data.x, data.y, [])
        node.id = data.id
        node.x0 = data.x0
        node.y0 = data.y0
        node.x1 = data.x1
        node.y1 = data.y1
        node.start = data.start
        node.end = data.end

        return node
    }
}
