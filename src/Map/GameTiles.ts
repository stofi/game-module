import MapNode from './node'
import { MapDualTile } from './MapDualTile'
import { MapTile } from './MapTile'
import { MapTileOptional } from './map'

export class GameTiles {
    tiles: MapTile[] = []
    dualTiles: MapDualTile[] = []
    constructor(readonly width: number, readonly height: number) {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const tile = new MapTile('outside', i, j)
                this.tiles.push(tile)
            }
        }
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
        /**
         * 1. Find the dimension D with the largest difference
         * 2. Find the center coordinate C of the line
         * 3. Find edge coordinates E1 and E2
         */

        const dimensionD = Math.abs(x2 - x1) < Math.abs(y2 - y1) ? 'x' : 'y'

        if (dimensionD === 'x') {
            const coordinateC = y1 + Math.floor((y2 - y1) / 2)
            const e1 = { x: x1, y: coordinateC }
            const e2 = { x: x2, y: coordinateC }

            const firstLine = this.makeLine({ x: x1, y: y1 }, e1)
            const secondLine = this.makeLine(e1, e2)
            const thirdLine = this.makeLine(e2, { x: x2, y: y2 })

            return [...firstLine, ...secondLine, ...thirdLine]
        } else {
            const coordinateC = x1 + Math.floor((x2 - x1) / 2)
            const e1 = { x: coordinateC, y: y1 }
            const e2 = { x: coordinateC, y: y2 }

            const firstLine = this.makeLine({ x: x1, y: y1 }, e1)

            const secondLine = this.makeLine(e1, e2)
            const thirdLine = this.makeLine(e2, { x: x2, y: y2 })

            return [...firstLine, ...secondLine, ...thirdLine]
        }

        // const center = {
        //     x: x1 + Math.floor((x2 - x1) / 2),
        //     y: y1 + Math.floor((y2 - y1) / 2),
        // }

        // const firstCorner = {
        //     x: center.x,
        //     y: y1,
        // }

        // const secondCorner = {
        //     x: center.x,
        //     y: y2,
        // }
        // const firstLine = this.makeLine({ x: x1, y: y1 }, firstCorner)
        // const secondLine = this.makeLine(firstCorner, secondCorner)
        // const thirdLine = this.makeLine(secondCorner, { x: x2, y: y2 })

        // return [...firstLine, ...secondLine, ...thirdLine]
    }
    getTile(x: number, y: number) {
        return this.tiles.find((tile) => tile.x === x && tile.y === y) ?? null
    }

    getTileNeighbors(
        tile: MapTile
    ): [MapTileOptional, MapTileOptional, MapTileOptional, MapTileOptional] {
        const { x, y } = tile
        return [
            this.getTile(x, y - 1),
            this.getTile(x + 1, y),
            this.getTile(x, y + 1),
            this.getTile(x - 1, y),
        ]
    }

    getTileNeighborsLowestDistance(tile: MapTile): number {
        const neighbors = this.getTileNeighbors(tile)
        const distances = neighbors.map((n) => n?.distanceToInside ?? Infinity)
        const lowest = Math.min(...distances)
        return lowest
    }

    setInsides(nodes: MapNode[]) {
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

    setPaths(edges: { node1: MapNode; node2: MapNode | undefined }[]) {
        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i]
            if (!edge) continue
            const node1 = edge.node1
            const node2 = edge.node2
            if (!node1 || !node2) continue
            const entrance1 = node1.getEntraceClosestToNode(node2)
            const entrance2 = node2.getEntraceClosestToNode(node1)
            const original1 = { ...entrance1 }
            const original2 = { ...entrance2 }
            if (!entrance1 || !entrance2) continue
            // const points = this.makeLine(node1, node2)

            let en1 = this.getTile(entrance1.x, entrance1.y)
            if (en1) en1.type = 'path'
            let en2 = this.getTile(entrance2.x, entrance2.y)
            if (en2) en2.type = 'path'

            offsetEntrance(entrance1, node1, 1)
            offsetEntrance(entrance2, node2, 1)

            en1 = this.getTile(entrance1.x, entrance1.y)
            if (en1) en1.type = 'path'
            en2 = this.getTile(entrance2.x, entrance2.y)
            if (en2) en2.type = 'path'

            offsetEntrance(entrance1, node1, 1)
            offsetEntrance(entrance2, node2, 1)

            const points = this.manhattanLine(entrance1, entrance2)

            for (let j = 0; j < points.length; j++) {
                const point = points[j]
                if (!point) continue
                const x = point.x
                const y = point.y
                const tile = this.getTile(x, y)
                if (!tile) continue
                tile.type = 'path'
            }
            const s = this.getTile(entrance1.x, entrance1.y)
            if (s) s.type = 'path'
            const e = this.getTile(entrance2.x, entrance2.y)
            if (en1) en1.type = 'path'
            const s1 = this.getTile(original1.x, original1.y)
            if (s1) s1.type = 'path'
            const e1 = this.getTile(original2.x, original2.y)
            if (e1) e1.type = 'path'
        }

        function offsetEntrance(
            e: { x: number; y: number },
            n: MapNode,
            o: number
        ) {
            if (e.x === n.x + n.x0 - 1) {
                e.x -= o
            } else if (e.x === n.x + n.x1 - 1) {
                e.x += o
            } else if (e.y === n.y + n.y0 - 1) {
                e.y -= o
            } else if (e.y === n.y + n.y1 - 1) {
                e.y += o
            }
            return e
        }
    }

    setWalls(nodes: MapNode[]) {
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
                tile.parent = node
            }
        }
    }
    setDoors(nodes: MapNode[]) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if (!node) continue
            const entrances = node.getEntrances()

            for (let j = 0; j < entrances.length; j++) {
                const wall = entrances[j]
                if (!wall) continue
                const x = wall.x
                const y = wall.y
                const tile = this.getTile(x, y)
                if (!tile) continue
                tile.type = 'door'
            }
        }
    }

    setDistances(nodes: MapNode[], passes = 1) {
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
                if (!tile) continue

                tile.distanceToInside = tile.type === 'outside' ? Infinity : 0
            }
        }

        const pass = () => {
            for (let i = 0; i < this.tiles.length; i++) {
                const tile = this.tiles[i]
                if (!tile) continue
                if (tile.type === 'inside') continue
                const lowest = this.getTileNeighborsLowestDistance(tile)
                if (lowest < tile.distanceToInside) {
                    tile.distanceToInside = lowest + 1
                }
            }
        }

        for (let i = 0; i < passes; i++) {
            pass()
        }
    }

    setTiles(
        nodes: MapNode[],
        edges: { node1: MapNode; node2: MapNode | undefined }[]
    ) {
        for (const tile of this.tiles) {
            tile.type = 'outside'
            tile.parent = null
        }

        this.setWalls(nodes)
        // this.setDoors(nodes)
        this.setPaths(edges)
        this.setInsides(nodes)
        this.setDistances(nodes)
        this.setDualTiles()
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
    toString() {
        const output: string[][] = []

        for (let j = 0; j < this.width; j++) {
            output.push([])
            for (let i = 0; i < this.height; i++) {
                const tile = this.getTile(j, i)
                const row = output[j]
                if (!tile) continue
                if (!row) continue
                row.push(tile.toString())
            }
        }

        // for (let i = 0; i < this.width + 1; i++) {
        //     for (let j = 0; j < this.height + 1; j++) {
        //         const tile = this.getDualTile(i, j)
        //         if (!tile) continue
        //         str += tile.toString()[0]
        //         str += tile.toString()[2]
        //     }
        //     str += '\n'
        //     for (let j = 0; j < this.height + 1; j++) {
        //         const tile = this.getDualTile(i, j)
        //         if (!tile) continue
        //         str += tile.toString()[1]
        //         str += tile.toString()[3]
        //     }
        //     str += '\n'
        // }

        return output.map((r) => r.reverse().join('')).join('\n')
    }
    getDualTile(i: number, j: number) {
        return (
            this.dualTiles.find((tile) => tile.x === i && tile.y === j) ?? null
        )
    }
}
