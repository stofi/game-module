import MapNode from './node'
import { v4 } from 'uuid'
import { MapTileType } from './map'

export class MapTile {
    parent: MapNode | null = null
    distanceToInside = Infinity
    id: string = v4()
    connectedNodes: MapNode[] = []
    constructor(public type: MapTileType, public x: number, public y: number) {}
    setType(type: MapTileType) {
        this.type = type
    }

    toJSON(): MapTileJSON {
        return {
            type: this.type,
            x: this.x,
            y: this.y,
        }
    }

    static fromJSON(json: MapTileJSON) {
        return new MapTile(json.type, json.x, json.y)
    }

    toString() {
        // export type MapTileType = 'outside' | 'wall' | 'path' | 'inside' | 'door'

        switch (this.type) {
            case 'wall':
                return ' '
            case 'inside':
                return this.parent?.start ? 'S' : this.parent?.end ? 'E' : ' '
            case 'outside':
                return '■'
            case 'path':
                return '.'
            case 'door':
                return '_'

            default:
                return ' '
        }
    }
}
export interface MapTileJSON {
    type: MapTileType
    x: number
    y: number
}
