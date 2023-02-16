import MapNode from './node'
import { v4 } from 'uuid'
import { MapTileType } from './map'

export class MapTile {
    parent: MapNode | null = null
    distanceToInside = Infinity
    id: string = v4()
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
}
export interface MapTileJSON {
    type: MapTileType
    x: number
    y: number
}
