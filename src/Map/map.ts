import { createHash } from '../crypto'
import { random, setSeed, randomInt } from '../seed'
import MapGraph from './graph'
import MapNode from './node'
import NodeFactory from './NodeFactory'

import { MapDualTile, MapDualTileJSON } from './MapDualTile'
import { MapTile, MapTileJSON } from './MapTile'
import { GameTiles } from './GameTiles'
export type MapTileType = 'outside' | 'wall' | 'path' | 'inside' | 'door'

export type MapTileOptional = MapTile | null

export default class GameMap {
    graph: MapGraph
    index = 0
    sameHashCount = 0
    gametiles: GameTiles
    covered = 0
    count = 0
    maxCount: number
    get tiles() {
        return this.gametiles.tiles
    }

    constructor(
        readonly width: number,
        readonly height: number,
        count: number,
        public seed = 'map',
        public level = 1
    ) {
        setSeed(seed)
        this.graph = new MapGraph([])
        this.gametiles = new GameTiles(width, height)

        // how many 10x10 squares fit in the map?
        const maxWidth = Math.floor(width / 10)
        const maxHeight = Math.floor(height / 10)
        const maxCount = maxWidth * maxHeight

        console.log('maxWidth', maxWidth)
        console.log('maxHeight', maxHeight)
        console.log('maxCount', maxCount)
        console.log('count', count)

        this.maxCount = maxCount
        this.count = Math.min(count, maxCount)
        this.count = Math.max(this.count, 2)
        if (this.count < 2) {
            throw new Error(`Map count is too small: ${count}`)
        }
        if (this.count > maxCount) {
            throw new Error(`Map count is too large: ${count}`)
        }

        const grid: Array<MapNode | null>[] = new Array(maxWidth)
            .fill(null)
            .map(() => new Array(maxHeight).fill(null))

        for (let i = 0; i < maxWidth; i++) {
            for (let j = 0; j < maxHeight; j++) {
                const x = i * 10
                const y = j * 10

                const node = NodeFactory.createRandomNodeForLevel(level, x, y)
                // const node = NodeFactory.createRandomNode(x, y)

                if (
                    grid[i] &&
                    grid[i] !== undefined &&
                    grid[i]![j] !== undefined
                )
                    grid[i]![j] = node

                this.graph.addNode(node)
            }
        }

        // add connections in a grid
        for (let i = 0; i < maxWidth; i++) {
            const row = grid[i]
            if (!row) continue
            for (let j = 0; j < maxHeight; j++) {
                const node = row[j]
                if (!node) continue
                const row1 = grid[i + 1]
                const right = row1 ? row1[j] : null
                const bottom = row[j + 1] ? row[j + 1] : null
                const left = row[j - 1] ? row[j - 1] : null
                const top = row1 ? row1[j - 1] : null
                if (right) node.connections.push(right)
                if (bottom) node.connections.push(bottom)
                if (left) node.connections.push(left)
                if (top) node.connections.push(top)
            }
        }

        const shuffled = this.graph.getNodes().sort(() => 0.5 - random())
        let toRemove = maxCount - this.count
        for (let i = 0; i < shuffled.length; i++) {
            const node = shuffled[i]
            if (!node) continue
            if (toRemove <= 0) break
            const connections = node.connections.map((c) => c)
            this.graph.removeNode(node)
            toRemove--
            if (!this.graph.isTraversable()) {
                // for each pair of nodes in connections, if not graph.nodesAreConnected then add connection
                for (let i = 0; i < connections.length; i++) {
                    const a = connections[i]
                    if (!a) continue
                    for (let j = i + 1; j < connections.length; j++) {
                        const b = connections[j]
                        if (!b) continue
                        if (!this.graph.nodesAreConnected(a, b)) {
                            a.connections.push(b)
                            b.connections.push(a)
                        }
                    }
                }
            }
        }

        this.setTiles()
    }

    setTiles() {
        const nodes = this.graph.getNodes()
        const edges = this.graph.getEdges()

        this.gametiles.setTiles(nodes, edges)
    }

    isInBounds(node: MapNode, buffer = 1) {
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

    overlaps(node: MapNode, buffer = 1) {
        return this.graph.anyNodeOverlaps(node, buffer)
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

    step() {
        const hash = this.hash()

        if (!this.graph.isTraversable()) {
            console.log('not traversable, adding connection')
            this.graph.addRandomConnection()
        } else {
            console.log('traversable, removing connection')
            this.graph.removeRandomConnection()
        }
        console.log('step')
        const newHash = this.hash()

        if (newHash === hash) {
            this.sameHashCount++
        } else {
            this.sameHashCount = 0
        }
        this.covered = this.graph.getTotalArea() / this.getArea()
        this.graph.findMostDistancedNodes()
        this.setTiles()
    }
    getArea() {
        return this.width * this.height
    }
    hash() {
        const graph = this.graph.getNodes().map((node) => node.hash())

        const string = graph + `_${this.width}_${this.height}`

        return createHash(string)
    }

    shuffleNodes() {
        const nodes = this.graph.getNodes()

        for (let i = nodes.length - 1; i > 0; i--) {
            const j = randomInt(0, i + 1)
            let ni = nodes[i]
            let nj = nodes[j]
            if (!ni || !nj) continue
            ;[ni, nj] = [nj, ni]
        }

        return nodes
    }

    static toJSON(map: GameMap) {
        const { width, height, graph, count, maxCount } = map

        return {
            width,
            height,
            count,
            maxCount,
            graph: MapGraph.toJSON(graph),
            level: map.level,
            tiles: map.gametiles.tiles.map((tile) => tile.toJSON()),
            dualTiles: map.gametiles.dualTiles.map((tile) => tile.toJSON()),
            seed: map.seed,
        }
    }

    static fromJSON(json: string | any) {
        const data = typeof json === 'string' ? JSON.parse(json) : json

        const {
            width,
            height,
            graph,
            count,
            tiles,
            dualTiles,
            maxCount,
            level,
            seed,
        } = data
        const map = new GameMap(width, height, count, seed, level)
        map.graph = MapGraph.fromJSON(graph)
        map.gametiles = new GameTiles(width, height)
        map.gametiles.tiles = tiles.map((tile: MapTileJSON) =>
            MapTile.fromJSON(tile)
        )
        map.gametiles.dualTiles = dualTiles.map((tile: MapDualTileJSON) =>
            MapDualTile.fromJSON(tile, map.tiles)
        )
        map.maxCount = maxCount

        return map
    }
}

//
