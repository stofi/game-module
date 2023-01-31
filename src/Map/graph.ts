import { createHash } from '../crypto'
import MapNode from './node'

import { setSeed, random } from '../seed'

export default class MapGraph {
    getNode(x: number, y: number) {
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i]
            if (!node) continue
            if (node.x === x && node.y === y) {
                return node
            }
        }

        return null
    }

    areaOccupied(x: number, y: number) {
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i]
            if (!node) continue
            if (node.hasArea(x, y)) {
                return true
            }
        }

        return false
    }

    static createDefaultMapGraph(count: number) {
        const width = Math.floor(Math.sqrt(count))
        const height = Math.ceil(count / width)
        const nodes = []

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const node = new MapNode(i * 4, j * 4, [])
                node.x1 = 3
                node.y1 = 3
                nodes.push(node)
            }
        }

        // connect nodes in a grid
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                if (i > 0) {
                    const source = nodes[i * height + j]
                    const target = nodes[(i - 1) * height + j]
                    if (source && target) {
                        source.connections.push(
                            target
                        )
                    }
                }

                if (i < width - 1) {
                    const source = nodes[i * height + j]
                    const target = nodes[(i + 1) * height + j]
                    if (source && target) {
                        source.connections.push(
                            target
                        )
                    }
                }

                if (j > 0) {
                    const source = nodes[i * height + j]
                    const target = nodes[i * height + j - 1]
                    if (source && target) {
                        source.connections.push(
                            target
                        )
                    }
                }

                if (j < height - 1) {
                    const source = nodes[i * height + j]
                    const target = nodes[i * height + j + 1]
                    if (source && target) {
                        source.connections.push(
                            target
                        )
                    }
                }
            }
        }

        return new MapGraph(nodes)
    }

    static createDistributedMapGraph(
        count: number,
        width: number,
        height: number,
        seed?: string
    ) {
        setSeed(seed || 'map')
        const nodes = []
        // evenly distribute nodes in 2d grid space
        // calculate column and row count plus spacing
        const columnCount = Math.floor(Math.sqrt(count)) + 1
        const rowCount = Math.ceil(count / columnCount) + 1
        const columnSpacing = width / columnCount
        const rowSpacing = height / rowCount

        for (let i = 0; i < columnCount; i++) {
            for (let j = 0; j < rowCount; j++) {
                const node = new MapNode(
                    i * columnSpacing + columnSpacing / 2,
                    j * rowSpacing + rowSpacing / 2,
                    []
                )
                node.x1 = 1
                node.y1 = 1
                nodes.push(node)
            }
        }

        // connect nodes in a grid
        for (let i = 0; i < columnCount; i++) {
            for (let j = 0; j < rowCount; j++) {
                if (i > 0) {
                    const source = nodes[i * rowCount + j]
                    const target = nodes[(i - 1) * rowCount + j]
                    if (source && target) source.connections.push(target)
                }

                if (i < columnCount - 1) {
                    const source = nodes[i * rowCount + j]
                    const target = nodes[(i + 1) * rowCount + j]
                    if (source && target) source.connections.push(target)
                }

                if (j > 0) {
                    const source = nodes[i * rowCount + j]
                    const target = nodes[i * rowCount + j - 1]
                    if (source && target) source.connections.push(target)
                }

                if (j < rowCount - 1) {
                    const source = nodes[i * rowCount + j]
                    const target = nodes[i * rowCount + j + 1]
                    if (source && target) source.connections.push(target)
                }
            }
        }

        return new MapGraph(nodes)
    }

    setSeed(seed: string) {
        setSeed(seed)
    }

    constructor(public nodes: MapNode[]) {}

    public addNode(node: MapNode) {
        this.nodes.push(node)
    }

    public addConnection(node1: MapNode, node2: MapNode) {
        node1.connections.push(node2)
        node2.connections.push(node1)
    }

    public removeConnection(node1: MapNode, node2: MapNode) {
        node1.connections.splice(node1.connections.indexOf(node2), 1)
        node2.connections.splice(node2.connections.indexOf(node1), 1)
    }

    public removeNode(node: MapNode) {
        this.nodes.splice(this.nodes.indexOf(node), 1)

        for (let i = 0; i < this.nodes.length; i++) {
            const other = this.nodes[i]
            if (!other) continue
            this.removeConnection(node, other)
        }
    }

    public getConnections(node: MapNode) {
        return node.connections
    }

    public getNodes() {
        return this.nodes
    }

    public getEdges() {
        const edges = []

        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i]
            if (!node || !node.connections) continue
            for (let j = 0; j < node.connections.length; j++) {
                edges.push({
                    node1: node,
                    node2: node.connections[j],
                })
            }
        }

        return edges
    }

    public getDistance(node1: MapNode, node2: MapNode) {
        return Math.sqrt(
            Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
        )
    }

    public getClosestNode(node: MapNode) {
        let closestNode = this.nodes[0]
        if(!closestNode) return null
        let closestDistance = this.getDistance(closestNode, node)

        for (let i = 1; i < this.nodes.length; i++) {
            const other = this.nodes[i]
            if(!other) continue
            const distance = this.getDistance(other, node)

            if (node === other) {
                continue
            }

            if (distance < closestDistance) {
                closestNode = other
                closestDistance = distance
            }
        }

        return closestNode
    }
    public getClosestNeighbor(node: MapNode) {
        let closestNode = node.connections[0]
        if(!closestNode) return null
        let closestDistance = this.getDistance(closestNode, node)

        for (let i = 1; i < node.connections.length; i++) {
            const other = node.connections[i]
            if(!other) continue
            const distance = this.getDistance(other, node)

            if (distance < closestDistance) {
                closestNode = other
                closestDistance = distance
            }
        }

        return closestNode
    }

    public isTraversable(start?: MapNode) {
        if (!start) {
            start = this.nodes[0]
        }
        const visited = new Set()
        const stack = [start]

        while (stack.length > 0) {
            const node = stack.pop()
            if (!node) continue

            if (visited.has(node)) {
                continue
            }
            visited.add(node)

            for (let i = 0; i < node.connections.length; i++) {
                stack.push(node.connections[i])
            }
        }

        return visited.size === this.nodes.length
    }

    public isTraversableWithoutConnection(node1: MapNode, node2: MapNode) {
        this.removeConnection(node1, node2)
        const result = this.isTraversable()
        this.addConnection(node1, node2)

        return result
    }

    public translate(x: number, y: number) {
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i]
            if (!node) continue
            node.translate(x, y)
        }
    }

    public getCenter() {
        let x = 0
        let y = 0

        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i]
            if (!node) continue
            x += node.x
            y += node.y
        }

        return { x: x / this.nodes.length, y: y / this.nodes.length }
    }

    public removeRandomConnection() {
        const edges = this.getEdges()
        const edge = edges[Math.floor(random() * edges.length)]

        if(!edge) return
        if(!edge.node1 || !edge.node2) return

        if (!this.isTraversableWithoutConnection(edge.node1, edge.node2)) {
            return
        }

        this.removeConnection(edge.node1, edge.node2)
    }

    public anyNodeOverlaps(node: MapNode) {
        for (let i = 0; i < this.nodes.length; i++) {
            const other = this.nodes[i]
            if (!other) continue
            if (other === node) {
                continue
            }

            if (other.overlaps(node)) {
                return true
            }
        }

        return false
    }

    public hash() {
        const nodes = this.getNodes()
        let hash = ''

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if (!node) continue
            hash += node.hash()
        }

        return createHash(hash)
    }

    getCrossedConnections() {
        const connections = this.getEdges()
        const crossedConnections = [] as typeof connections

        for (let i = 0; i < connections.length; i++) {
            const connection = connections[i]
            if (!connection) continue
            if (!connection.node1 || !connection.node2) continue
            const node1 = connection.node1
            const node2 = connection.node2

            const node1Area = node1.getArea()
            const node2Area = node2.getArea()

            for (let j = 0; j < node1Area.length; j++) {
                const node1Tile = node1Area[j]

                for (let k = 0; k < node2Area.length; k++) {
                    const node2Tile = node2Area[k]

                    if (!node1Tile || !node2Tile) continue
                    if (
                        node1Tile.x === node2Tile.x &&
                        node1Tile.y === node2Tile.y
                    ) {
                        crossedConnections.push(connection)
                    }
                }
            }
        }

        return crossedConnections
    }

    removeRandomCrossedConnection() {
        const crossedConnections = this.getCrossedConnections()

        if (crossedConnections.length === 0) {
            return
        }

        const connection =
            crossedConnections[
                Math.floor(random() * crossedConnections.length)
            ]
        
        if(!connection) return
        if(!connection.node1 || !connection.node2) return

        if (
            !this.isTraversableWithoutConnection(
                connection.node1,
                connection.node2
            )
        ) {
            return
        }

        this.removeConnection(connection.node1, connection.node2)
    }

    public getTotalArea() {
        let totalArea = 0

        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i]
            if (!node) continue
            totalArea += node.getAreaSize()
        }

        return totalArea
    }

    public findMostDistancedNodes(): [MapNode, MapNode] {
        const n1 = this.nodes[0]
        const n2 = this.nodes[1]

        if (!n1 || !n2) {
            throw new Error('No nodes')
        }

        let mostDistancedNodes: [MapNode, MapNode] = [
            n1,
            n2,
        ]
        let mostDistance = this.getDistance(n1, n2)

        for (let i = 0; i < this.nodes.length; i++) {
            const other = this.nodes[i]
            if (!other) continue
            other.start = false
            other.end = false

            for (let j = i + 1; j < this.nodes.length; j++) {
                const another = this.nodes[j]
                if (!another) continue
                const distance = this.getDistance(other, another)

                if (distance > mostDistance) {
                    mostDistancedNodes = [other, another]
                    mostDistance = distance
                }
            }
        }
        mostDistancedNodes[0].start = true
        mostDistancedNodes[1].end = true

        return mostDistancedNodes
    }

    static toJSON(map: MapGraph) {
        const nodes = map.getNodes()
        const json = {
            nodes: [] as any[],
        }

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if (!node) continue
            json.nodes.push(MapNode.toJSON(node))
        }

        return json
    }

    static fromJSON(json: string) {
        const nodes: Record<
            string,
            {
                node: MapNode
                connections: string[]
            }
        > = {}

        const data = typeof json === 'string' ? JSON.parse(json) : json

        for (let i = 0; i < data.nodes.length; i++) {
            const node = MapNode.fromJSON(data.nodes[i])
            nodes[node.id] = {
                node,
                connections: data.nodes[i].connections,
            }
        }

        Object.keys(nodes).forEach((id) => {
            const nodeValue = nodes[id]
            if (!nodeValue) return
            const node = nodeValue.node
            const connections = nodeValue.connections
            if (!node) return
            if (!connections) return
            for (let i = 0; i < connections.length; i++) {
                const connection = connections[i]
                if(!connection) continue
                const connected = nodes[connection]
                if(!connected) continue
                node.connections.push(connected.node)
            }
        })

        const nodesArray = Object.keys(nodes).map((id) => {
            const node = nodes[id]
            if(!node) return
            return node.node
        }).filter((node) => !!node) as MapNode[]
        
        const map = new MapGraph(nodesArray)

        return map
    }
}
