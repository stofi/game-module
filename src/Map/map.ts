import { createHash } from '../crypto'
import MapGraph from './graph'
import MapNode from './node'

type MapTileType = 'outside' | 'wall' | 'path' | 'inside'

export class MapTile {
    parent: MapNode | null = null
    constructor(public type: MapTileType, public x: number, public y: number) {}

    setType(type: MapTileType) {
        this.type = type
    }
}

export class MapDualTile {
    parent: MapNode | null = null
    constructor(
        public x: number,
        public y: number,
        public topLeft: MapTile | null,
        public topRight: MapTile | null,
        public bottomLeft: MapTile | null,
        public bottomRight: MapTile | null
    ) {}
    // number of combinations
    // 5^4 = 625

    types() {
        return [
            this.topLeft?.type ?? 'outside',
            this.topRight?.type ?? 'outside',
            this.bottomLeft?.type ?? 'outside',
            this.bottomRight?.type ?? 'outside',
        ]
    }

    hasOneWalls() {
        return this.types().filter((type) => type === 'wall').length > 0
    }

    hasOnePaths() {
        return this.types().filter((type) => type === 'path').length > 0
    }

    hasOneInsides() {
        return this.types().filter((type) => type === 'inside').length > 0
    }

    hasOneOutsides() {
        return this.types().filter((type) => type === 'outside').length > 0
    }
    hasTwoWalls() {
        return this.types().filter((type) => type === 'wall').length > 1
    }

    hasTwoPaths() {
        return this.types().filter((type) => type === 'path').length > 1
    }

    hasTwoInsides() {
        return this.types().filter((type) => type === 'inside').length > 1
    }

    hasTwoOutsides() {
        return this.types().filter((type) => type === 'outside').length > 1
    }

    marchingSquares() {
        return [
            this.topLeft?.type === 'outside' || this.topLeft === null ? 0 : 1,
            this.topRight?.type === 'outside' || this.topRight === null ? 0 : 1,
            this.bottomLeft?.type === 'outside' || this.bottomLeft === null
                ? 0
                : 1,
            this.bottomRight?.type === 'outside' || this.bottomRight === null
                ? 0
                : 1,
        ]
    }
}

export default class GameMap {
    graph: MapGraph
    index = 0
    sameHashCount = 0
    tiles: MapTile[] = []
    dualTiles: MapDualTile[] = []
    covered = 0

    constructor(
        readonly width: number,
        readonly height: number,
        readonly count: number,
        seed = 'map',
        readonly wallBuffer = 3,
        readonly overlapBuffer = 3
    ) {
        this.graph = MapGraph.createDefaultMapGraph(this.count)
        // this.graph = MapGraph.createDistributedMapGraph(
        //   this.count,
        //   this.width,
        //   this.height,
        // )
        this.graph.setSeed(seed)
        const center = this.graph.getCenter()

        this.graph.translate(
            Math.floor(width / 2 - center.x),
            Math.floor(height / 2 - center.y)
        )

        // set the tiles
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const tile = new MapTile('outside', i, j)
                this.tiles.push(tile)
            }
        }
    }
    setSeed(seed: string) {
        this.graph.setSeed(seed)
    }

    makeLine(
        { x: x1, y: y1 }: { x: number; y: number },
        { x: x2, y: y2 }: { x: number; y: number }
    ): { x: number; y: number }[] {
        const points: { x: number; y: number }[] = []
        const xDiff = x2 - x1
        const yDiff = y2 - y1
        const xDir = xDiff > 0 ? 1 : -1
        const yDir = yDiff > 0 ? 1 : -1
        const xSteps = Math.abs(xDiff)
        const ySteps = Math.abs(yDiff)
        const steps = Math.max(xSteps, ySteps)

        for (let i = 0; i < steps; i++) {
            const x = x1 + Math.round((xDir * i * xSteps) / steps)
            const y = y1 + Math.round((yDir * i * ySteps) / steps)
            points.push({ x, y })
        }

        return points
    }

    manhattanLine(
        { x: x1, y: y1 }: { x: number; y: number },
        { x: x2, y: y2 }: { x: number; y: number }
    ): { x: number; y: number }[] {
        const center = {
            x: x1 + Math.floor((x2 - x1) / 2),
            y: y1 + Math.floor((y2 - y1) / 2),
        }

        const firstCorner = {
            x: center.x,
            y: y1,
        }

        const secondCorner = {
            x: center.x,
            y: y2,
        }
        const firstLine = this.makeLine({ x: x1, y: y1 }, firstCorner)
        const secondLine = this.makeLine(firstCorner, secondCorner)
        const thirdLine = this.makeLine(secondCorner, { x: x2, y: y2 })

        return [...firstLine, ...secondLine, ...thirdLine]
    }

    setTiles() {
        const nodes = this.graph.getNodes()
        const edges = this.graph.getEdges()

        for (const tile of this.tiles) {
            tile.type = 'outside'
            tile.parent = null
        }

        this.setWalls(nodes)
        this.setPaths(edges)
        this.setInsides(nodes)
    }

    private setInsides(nodes: MapNode[]) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if (!node) continue
            const area = node.getArea()

            for (let j = 0; j < area.length; j++) {
                const a = area[j]
                if (!a) continue
                const x = a.x
                const y = a.y
                const tile = this.getTile(x, y)
                if (!tile || tile.type === 'wall') continue
                tile.type = 'inside'
                tile.parent = node
            }
        }
    }

    private setPaths(edges: { node1: MapNode; node2: MapNode | undefined }[]) {
        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i]
            if (!edge) continue
            const node1 = edge.node1
            const node2 = edge.node2
            if (!node1 || !node2) continue
            const entrance1 = node1.getEntraceDirectionClosestToNode(node2)
            const entrance2 = node2.getEntraceDirectionClosestToNode(node1)
            const entrancePos1 = node1.getEntranceCoordinates(entrance1)
            const entrancePos2 = node2.getEntranceCoordinates(entrance2)

            const points = this.manhattanLine(entrancePos1, entrancePos2)

            for (let j = 0; j < points.length; j++) {
                const point = points[j]
                if (!point) continue
                const x = point.x
                const y = point.y
                const tile = this.getTile(x, y)
                if (!tile) continue
                tile.type = 'path'
            }
        }
    }

    private setWalls(nodes: MapNode[]) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if (!node) continue
            const walls = node.getWalls()

            for (let j = 0; j < walls.length; j++) {
                const wall = walls[j]
                if (!wall) continue
                const x = wall.x
                const y = wall.y
                const tile = this.getTile(x, y)
                if (!tile) continue
                tile.type = 'wall'
            }
        }
    }

    setDualTiles() {
        this.dualTiles = []

        for (let i = 0; i < this.width + 1; i++) {
            for (let j = 0; j < this.height + 1; j++) {
                this.dualTiles.push(
                    new MapDualTile(
                        i,
                        j,
                        this.getTile(i - 1, j - 1),
                        this.getTile(i, j - 1),
                        this.getTile(i - 1, j),
                        this.getTile(i, j)
                    )
                )
            }
        }
    }

    getTile(x: number, y: number) {
        return this.tiles.find((tile) => tile.x === x && tile.y === y) ?? null
    }

    // isInBounds(x: number, y: number) {
    //     return x >= 0 && x < this.width && y >= 0 && y < this.height
    // }

    isInBounds(node: MapNode, buffer = this.wallBuffer) {
        const area = node.getArea()

        for (let i = 0; i < area.length; i++) {
            const a = area[i]
            if (!a) continue
            const x = a.x
            const y = a.y

            if (
                x < 0 + buffer ||
                x >= this.width - buffer ||
                y < 0 + buffer ||
                y >= this.height - buffer
            ) {
                return false
            }
        }

        return true
    }

    overlaps(node: MapNode, buffer = this.overlapBuffer) {
        return this.graph.anyNodeOverlaps(node, buffer)
    }

    inflateNode(node: MapNode, center: { x: number; y: number }) {
        const xDiff = node.x - center.x
        const yDiff = node.y - center.y

        const newX = Math.ceil(xDiff) > 0 ? 1 : -1
        const newY = Math.ceil(yDiff) > 0 ? 1 : -1

        node.translate(newX, newY)

        if (!this.isInBounds(node)) {
            node.translate(-newX, -newY)
        }
    }

    increaseSize(node: MapNode) {
        // choose random direction
        // const direction = Math.floor(Math.random() * 4)

        const directions = [
            {
                add: (node: MapNode) => node.addTop(),
                remove: (node: MapNode) => node.removeTop(),
            },
            {
                add: (node: MapNode) => node.addRight(),
                remove: (node: MapNode) => node.removeRight(),
            },
            {
                add: (node: MapNode) => node.addBottom(),
                remove: (node: MapNode) => node.removeBottom(),
            },
            {
                add: (node: MapNode) => node.addLeft(),
                remove: (node: MapNode) => node.removeLeft(),
            },
        ]

        // shuffle directions
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            let di = directions[i]
            let dj = directions[j]
            if (!di || !dj) continue
            ;[di, dj] = [dj, di]
        }

        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i]
            if (!dir) continue
            dir.add(node)
            const overlaps = this.overlaps(node)
            const isInBounds = this.isInBounds(node)

            if (overlaps || !isInBounds) {
                dir.remove(node)
            } else {
                break
            }
        }
    }
    moveAwayFromNearestNode(randomNode: MapNode) {
        const closeNode = this.graph.getClosestNode(randomNode)
        if (!closeNode) return
        const xDiff2 = randomNode.x - closeNode.x
        const yDiff2 = randomNode.y - closeNode.y

        const newX2 = Math.ceil(xDiff2) > 0 ? 1 : -1
        const newY2 = Math.ceil(yDiff2) > 0 ? 1 : -1

        randomNode.translate(newX2, newY2)

        const isInBounds = this.isInBounds(randomNode)

        const isNotOverlapping = !this.overlaps(randomNode)

        if (!isInBounds || !isNotOverlapping) {
            randomNode.translate(-newX2, -newY2)
        }
    }

    moveAwayFromNearestEdge(node: MapNode) {
        const xDiff = node.x - this.width / 2
        const yDiff = node.y - this.height / 2

        const newX = Math.ceil(xDiff) > 0 ? 1 : -1
        const newY = Math.ceil(yDiff) > 0 ? 1 : -1

        node.translate(newX, newY)

        const overlaps = this.overlaps(node)
        const isInBounds = this.isInBounds(node)

        if (overlaps || !isInBounds) {
            node.translate(-newX, -newY)
        }
    }

    iterate(node: MapNode) {
        const graphCenter = this.graph.getCenter()

        const mapCenter = {
            x: Math.floor(this.width / 2),
            y: Math.floor(this.height / 2),
        }

        const center = {
            x: Math.floor((graphCenter.x + mapCenter.x) / 2),
            y: Math.floor((graphCenter.y + mapCenter.y) / 2),
        }

        const { x, y, x0, x1, y0, y1 } = node

        // this.inflateNode(node, center)
        this.moveAwayFromNearestNode(node)
        this.moveAwayFromNearestEdge(node)
        this.increaseSize(node)

        const overlaps = this.overlaps(node)
        const isInBounds = this.isInBounds(node)

        if (overlaps || !isInBounds) {
            node.x = x
            node.y = y
            node.x0 = x0
            node.x1 = x1
            node.y0 = y0
            node.y1 = y1
        }
    }
    step() {
        const hash = this.hash()

        const shuffled = this.shuffleNodes()

        for (let i = 0; i < shuffled.length; i++) {
            const node = shuffled[i]
            if (!node) continue
            this.iterate(node)
        }

        this.graph.removeRandomConnection()

        const newHash = this.hash()

        if (newHash === hash) {
            this.sameHashCount++
        } else {
            this.sameHashCount = 0
        }
        this.covered = this.graph.getTotalArea() / this.getArea()
        this.graph.findMostDistancedNodes()
        this.setTiles()
        this.setDualTiles()
    }
    getArea() {
        return this.width * this.height
    }
    hash() {
        const graph = this.graph
            .getNodes()
            .map((node) => node.hash())
            .join('')

        const string = graph + `_${this.width}_${this.height}`

        return createHash(string)
    }

    shuffleNodes() {
        const nodes = this.graph.getNodes()

        for (let i = nodes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            let ni = nodes[i]
            let nj = nodes[j]
            if (!ni || !nj) continue
            ;[ni, nj] = [nj, ni]
        }

        return nodes
    }

    static toJSON(map: GameMap) {
        const { width, height, graph, count } = map

        return {
            width,
            height,
            count,
            graph: MapGraph.toJSON(graph),
        }
    }

    static fromJSON(json: string | any) {
        const data = typeof json === 'string' ? JSON.parse(json) : json

        const { width, height, graph, count } = data
        const map = new GameMap(width, height, count)
        map.graph = MapGraph.fromJSON(graph)

        return map
    }
}

//
