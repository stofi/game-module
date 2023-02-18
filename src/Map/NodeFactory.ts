import MapNode from './node'
import type { EntranceI, NodeData } from './node'
import { randomInt } from '../seed'
export type NodeTemplateType =
    | '3x3'
    | '5x5'
    | '3x5'
    | '5x3'
    | '5x5'
    | '7x7'
    | '5x7'
    | '7x5'

interface NodeTemplate {
    type: NodeTemplateType
    data: NodeData[]
    width: number
    height: number
    entrances: EntranceI[]
    maxXOffset: number
    maxYOffset: number
}

export default class NodeFactory {
    static nodeTemplates: Record<NodeTemplateType, NodeTemplate> = {
        '3x3': {
            type: '3x3',
            data: [],
            width: 3,
            height: 3,
            maxXOffset: 5,
            maxYOffset: 5,
            entrances: [
                { side: 'top', i: 1 },
                { side: 'bottom', i: 1 },
                { side: 'left', i: 1 },
                { side: 'right', i: 1 },
            ],
        },
        '3x5': {
            type: '3x5',
            data: [],
            width: 3,
            height: 5,
            maxXOffset: 5,
            maxYOffset: 3,
            entrances: [
                { side: 'top', i: 1 },
                { side: 'bottom', i: 1 },
                { side: 'left', i: 1 },
                { side: 'right', i: 1 },
                { side: 'left', i: 3 },
                { side: 'right', i: 3 },
            ],
        },
        '5x3': {
            type: '5x3',
            data: [],
            width: 5,
            height: 3,
            maxXOffset: 3,
            maxYOffset: 5,
            entrances: [
                { side: 'top', i: 1 },
                { side: 'bottom', i: 1 },
                { side: 'left', i: 1 },
                { side: 'right', i: 1 },
                { side: 'top', i: 3 },
                { side: 'bottom', i: 3 },
            ],
        },
        '5x5': {
            type: '5x5',
            data: [],
            width: 5,
            height: 5,
            maxXOffset: 3,
            maxYOffset: 3,
            entrances: [
                { side: 'top', i: 1 },
                { side: 'bottom', i: 1 },
                { side: 'left', i: 1 },
                { side: 'right', i: 1 },
                { side: 'top', i: 3 },
                { side: 'bottom', i: 3 },
                { side: 'left', i: 3 },
                { side: 'right', i: 3 },
            ],
        },
        '5x7': {
            type: '5x7',
            data: [],
            width: 5,
            height: 7,
            maxXOffset: 3,
            maxYOffset: 1,
            entrances: [
                { side: 'top', i: 1 },
                { side: 'bottom', i: 1 },
                { side: 'left', i: 1 },
                { side: 'right', i: 1 },
                { side: 'top', i: 3 },
                { side: 'bottom', i: 3 },
                { side: 'left', i: 3 },
                { side: 'right', i: 3 },
                { side: 'left', i: 5 },
                { side: 'right', i: 5 },
            ],
        },
        '7x5': {
            type: '7x5',
            data: [],
            width: 7,
            height: 5,
            maxXOffset: 1,
            maxYOffset: 3,
            entrances: [
                { side: 'top', i: 1 },
                { side: 'bottom', i: 1 },
                { side: 'left', i: 1 },
                { side: 'right', i: 1 },
                { side: 'top', i: 3 },
                { side: 'bottom', i: 3 },
                { side: 'left', i: 3 },
                { side: 'right', i: 3 },
                { side: 'top', i: 5 },
                { side: 'bottom', i: 5 },
            ],
        },
        '7x7': {
            type: '7x7',
            data: [],
            width: 7,
            height: 7,
            maxXOffset: 1,
            maxYOffset: 1,
            entrances: [
                { side: 'top', i: 1 },
                { side: 'bottom', i: 1 },
                { side: 'left', i: 1 },
                { side: 'right', i: 1 },
                { side: 'top', i: 3 },
                { side: 'bottom', i: 3 },
                { side: 'left', i: 3 },
                { side: 'right', i: 3 },
                { side: 'top', i: 5 },
                { side: 'bottom', i: 5 },
                { side: 'left', i: 5 },
                { side: 'right', i: 5 },
            ],
        },
    }

    static createNode(type: NodeTemplateType, x: number, y: number): MapNode {
        const { data, width, height, entrances, maxXOffset, maxYOffset } =
            NodeFactory.nodeTemplates[type]
        const node = new MapNode(x, y, [], 0, 0, width, height, entrances)
        node.x += randomInt(0, maxXOffset)
        node.y += randomInt(0, maxYOffset)
        node.data = data
        node.type = type
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
