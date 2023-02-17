import MapNode from './node'
import type { EntranceI, NodeData } from './node'
import { randomInt } from '../seed'
type NodeTemplateType = '3x3' | '5x5' | '7x7'

interface NodeTemplate {
    type: NodeTemplateType
    data: NodeData[]
    width: number
    height: number
    entrances: EntranceI[]
}

export default class NodeFactory {
    static nodeTemplates: Record<NodeTemplateType, NodeTemplate> = {
        '3x3': {
            type: '3x3',
            data: [],
            width: 3,
            height: 3,
            entrances: [
                { side: 'top', i: 1 },
                { side: 'bottom', i: 1 },
                { side: 'left', i: 1 },
                { side: 'right', i: 1 },
            ],
        },
        '5x5': {
            type: '5x5',
            data: [],
            width: 5,
            height: 5,
            entrances: [
                { side: 'top', i: 2 },
                { side: 'bottom', i: 2 },
                { side: 'left', i: 2 },
                { side: 'right', i: 2 },
            ],
        },
        '7x7': {
            type: '7x7',
            data: [],
            width: 7,
            height: 7,
            entrances: [
                { side: 'top', i: 2 },
                { side: 'bottom', i: 2 },
                { side: 'left', i: 2 },
                { side: 'right', i: 2 },
                { side: 'top', i: 5 },
                { side: 'bottom', i: 5 },
                { side: 'left', i: 5 },
                { side: 'right', i: 5 },
            ],
        },
    }

    static createNode(type: NodeTemplateType, x: number, y: number): MapNode {
        const { data, width, height, entrances } =
            NodeFactory.nodeTemplates[type]
        const node = new MapNode(x, y, [], 0, 0, width, height, entrances)
        node.data = data
        return node
    }

    static createRandomNode(x: number, y: number): MapNode {
        const types = Object.keys(
            NodeFactory.nodeTemplates
        ) as NodeTemplateType[]
        const type = types[randomInt(0, types.length - 1)] as NodeTemplateType
        return NodeFactory.createNode(type, x, y)
    }
}
