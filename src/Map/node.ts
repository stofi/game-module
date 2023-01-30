import { createHash } from '../crypto'
import { v4 } from 'uuid'
export default class MapNode {
    x0 = 0
    y0 = 0
    x1 = 1
    y1 = 1
    start = false
    end = false
    id = v4()
    constructor(
        public x: number,
        public y: number,
        public connections: MapNode[]
    ) {}

    public translate(x: number, y: number) {
        this.x += x
        this.y += y
    }

    public hasArea(x: number, y: number) {
        return x >= this.x0 && x <= this.x1 && y >= this.y0 && y <= this.y1
    }

    public getArea() {
        const w = this.x1 - this.x0
        const h = this.y1 - this.y0

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
        }
    }

    public addBottom() {
        this.y1++

        if (this.areaSizeIsLessThanOne()) {
            this.y1--
        }
    }

    public addLeft() {
        this.x0--

        if (this.areaSizeIsLessThanOne()) {
            this.x0++
        }
    }

    public addRight() {
        this.x1++

        if (this.areaSizeIsLessThanOne()) {
            this.x1--
        }
    }

    public removeTop() {
        this.y0++

        if (this.areaSizeIsLessThanOne()) {
            this.y0--
        }
    }

    public removeBottom() {
        this.y1--

        if (this.areaSizeIsLessThanOne()) {
            this.y1++
        }
    }

    public removeLeft() {
        this.x0++

        if (this.areaSizeIsLessThanOne()) {
            this.x0--
        }
    }

    public removeRight() {
        this.x1--

        if (this.areaSizeIsLessThanOne()) {
            this.x1++
        }
    }

    public overlaps(node: MapNode) {
        return (
            this.x + this.x0 - 1 < node.x + node.x1 &&
            this.x + this.x1 + 1 > node.x + node.x0 &&
            this.y + this.y0 - 1 < node.y + node.y1 &&
            this.y + this.y1 + 1 > node.y + node.y0
        )
    }

    public hash() {
        const string = `${this.x},${this.y},${this.x0},${this.y0},${this.x1},${this.y1}`

        return createHash(string)
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
