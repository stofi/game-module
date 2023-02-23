import { createHash } from '../crypto'
import { v4 } from 'uuid'
import type { NodeTemplateType } from './NodeFactory'
export interface EntranceI {
    side: 'top' | 'bottom' | 'left' | 'right'
    i: number
}

import { randomInt } from '../seed'

export type NodeDataType = 'object' | 'enemy' | 'item' | 'trap' | 'empty'

export interface NodeDataTemplate {
    position:
        | {
              x: number
              y: number
          }
        | { x: number; y: number }[]

    size?: {
        width: number
        height: number
    }
    type: NodeDataType
}
export interface NodeData extends NodeDataTemplate {
    position: {
        x: number
        y: number
    }
}

export default class MapNode {
    start = false
    end = false
    id = v4()
    index = 0
    entrances: EntranceI[] = []
    data: NodeData[] = []
    type?: NodeTemplateType
    constructor(
        public x: number,
        public y: number,
        public connections: MapNode[],
        public x0 = 0,
        public y0 = 0,
        public x1 = 1,
        public y1 = 1,
        entrances: EntranceI[] = []
    ) {
        this.entrances = entrances
        if (!this.entrances || this.entrances.length === 0) {
            throw new Error('no entrances')
        }
    }

    get width() {
        return this.x1 - this.x0
    }

    get height() {
        return this.y1 - this.y0
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

    public getEntranceCoordinates(e: EntranceI) {
        const i = e.i
        let x = this.x
        let y = this.y
        switch (e.side) {
            case 'top':
                x += this.x0 + i
                y += this.y0 - 1
                break
            case 'bottom':
                x += this.x1 - i - 1
                y += this.y1 //- 1
                break
            case 'left':
                x += this.x0 - 1
                y += this.y0 + i
                break
            case 'right':
                x += this.x1 //- 1
                y += this.y1 - i - 1
                break
        }

        return { x, y }
    }

    public getEntraceClosestToNode(node: MapNode): {
        x: number
        y: number
        entrance: EntranceI | undefined
    } {
        const coordinates = this.entrances.map((e) => {
            return this.getEntranceCoordinates(e)
        })

        const distances = coordinates.map((c) => ({
            x: c.x - node.x,
            y: c.y - node.y,
        }))
        const distancesSquared = distances.map((d) => d.x * d.x + d.y * d.y)
        const minDistance = Math.min(...distancesSquared)
        const minDistanceIndex = distancesSquared.indexOf(minDistance)

        return {
            x: coordinates[minDistanceIndex]?.x ?? 0,
            y: coordinates[minDistanceIndex]?.y ?? 0,
            entrance: this.entrances[minDistanceIndex] ?? undefined,
        }
    }

    public getEntrances() {
        return this.entrances.map((e) => {
            return this.getEntranceCoordinates(e)
        })
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
            entrances: node.entrances,
            type: node.type,
            data: node.data,
        }
    }

    static fromJSON(json: string | any) {
        const data = typeof json === 'string' ? JSON.parse(json) : json
        const node = new MapNode(
            data.x,
            data.y,
            [],
            data.x0,
            data.y0,
            data.x1,
            data.y1,
            data.entrances
        )
        node.id = data.id
        node.x0 = data.x0
        node.y0 = data.y0
        node.x1 = data.x1
        node.y1 = data.y1
        node.start = data.start
        node.end = data.end
        node.entrances = data.entrances
        node.type = data.type
        node.data = data.data

        return node
    }

    dispose() {
        this.connections = []
        this.entrances = []
        this.data = []
    }
}
