import MapNode from './node'
import type { EntranceI, NodeData, NodeDataTemplate } from './node'
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
    data: NodeDataTemplate[]
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
            data: [
                {
                    position: [
                        { x: 0, y: 0 },
                        { x: 2, y: 0 },
                        { x: 0, y: 2 },
                        { x: 2, y: 2 },
                    ],
                    type: 'enemy',
                },
            ],
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
            data: [
                {
                    position: { x: 1, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 1, y: 3 },
                    type: 'enemy',
                },
            ],
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
            data: [
                {
                    position: { x: 1, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 1 },
                    type: 'enemy',
                },
            ],
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
            data: [
                {
                    position: { x: 1, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 1, y: 3 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 3 },
                    type: 'enemy',
                },
            ],
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
            data: [
                {
                    position: { x: 1, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 1, y: 3 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 3 },
                    type: 'enemy',
                },
                {
                    position: { x: 1, y: 5 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 5 },
                    type: 'enemy',
                },
            ],
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
            data: [
                {
                    position: { x: 1, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 5, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 1, y: 3 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 3 },
                    type: 'enemy',
                },
                {
                    position: { x: 5, y: 3 },
                    type: 'enemy',
                },
            ],
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
            data: [
                {
                    position: { x: 1, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 5, y: 1 },
                    type: 'enemy',
                },
                {
                    position: { x: 1, y: 3 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 3 },
                    type: 'enemy',
                },
                {
                    position: { x: 5, y: 3 },
                    type: 'enemy',
                },
                {
                    position: { x: 1, y: 5 },
                    type: 'enemy',
                },
                {
                    position: { x: 3, y: 5 },
                    type: 'enemy',
                },
                {
                    position: { x: 5, y: 5 },
                    type: 'enemy',
                },
            ],
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

    static levelToNodeTemplateChance: Record<
        number,
        Record<NodeTemplateType, number>
    > = {
        1: {
            '3x3': 2,
            '3x5': 1,
            '5x3': 1,
            '5x5': 0,
            '7x5': 0,
            '5x7': 0,
            '7x7': 0,
        },
        3: {
            '3x3': 2,
            '3x5': 2,
            '5x3': 2,
            '5x5': 1,
            '5x7': 0,
            '7x5': 0,
            '7x7': 0,
        },
        5: {
            '3x3': 1,
            '3x5': 2,
            '5x3': 2,
            '5x5': 2,
            '5x7': 1,
            '7x5': 1,
            '7x7': 0,
        },
        8: {
            '3x3': 0,
            '3x5': 1,
            '5x3': 1,
            '5x5': 4,
            '5x7': 2,
            '7x5': 2,
            '7x7': 1,
        },
        10: {
            '3x3': 0,
            '3x5': 0,
            '5x3': 0,
            '5x5': 2,
            '5x7': 2,
            '7x5': 2,
            '7x7': 2,
        },
    }

    static chooseNodeTemplate(level: number): NodeTemplateType {
        // find nearest lower level
        const levelToUse = parseInt(
            Object.keys(NodeFactory.levelToNodeTemplateChance).find(
                (key) => level <= parseInt(key)
            ) ?? '1'
        ) as keyof typeof NodeFactory.levelToNodeTemplateChance

        const nodeTemplates = NodeFactory.levelToNodeTemplateChance[levelToUse]

        if (!nodeTemplates) {
            throw new Error('No node templates found for level ' + level)
        }

        const types = Object.entries(nodeTemplates).flatMap(([type, chance]) =>
            Array(chance)
                .fill(0)
                .map(() => type as NodeTemplateType)
        )

        const type = types[randomInt(0, types.length - 1)]

        if (!type) {
            throw new Error('No node templates found for level ' + level)
        }

        return type
    }

    static createNode(type: NodeTemplateType, x: number, y: number): MapNode {
        const { data, width, height, entrances, maxXOffset, maxYOffset } =
            NodeFactory.nodeTemplates[type]
        const node = new MapNode(x, y, [], 0, 0, width, height, entrances)
        const xOffset = randomInt(0, maxXOffset)
        const yOffset = randomInt(0, maxYOffset)
        node.x += xOffset
        node.y += yOffset
        node.data = data.map((d) => {
            const position = (
                Array.isArray(d.position)
                    ? d.position[randomInt(0, d.position.length - 1)]
                    : d.position
            ) as { x: number; y: number }
            const m: NodeData = {
                ...d,
                position,
            }
            return m
        })

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

    static createRandomNodeForLevel(level: number, x: number, y: number) {
        const type = NodeFactory.chooseNodeTemplate(level)
        return NodeFactory.createNode(type, x, y)
    }
}
