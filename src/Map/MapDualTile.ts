import MapNode from './node'
import { MapTile } from './MapTile'

export interface MapDualTileJSON {
    x: number
    y: number
    topLeft: string | null
    topRight: string | null
    bottomLeft: string | null
    bottomRight: string | null
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

    toJSON(): MapDualTileJSON {
        return {
            x: this.x,
            y: this.y,
            topLeft: this.topLeft?.id ?? null,
            topRight: this.topRight?.id ?? null,
            bottomLeft: this.bottomLeft?.id ?? null,
            bottomRight: this.bottomRight?.id ?? null,
        }
    }

    static fromJSON(json: MapDualTileJSON, tiles: MapTile[]) {
        return new MapDualTile(
            json.x,
            json.y,
            tiles.find((tile) => tile.id === json.topLeft) ?? null,
            tiles.find((tile) => tile.id === json.topRight) ?? null,
            tiles.find((tile) => tile.id === json.bottomLeft) ?? null,
            tiles.find((tile) => tile.id === json.bottomRight) ?? null
        )
    }

    toString(): [string, string, string, string] {
        return [
            this.topLeft?.toString() ?? 'x',
            this.topRight?.toString() ?? 'x',
            this.bottomLeft?.toString() ?? 'x',
            this.bottomRight?.toString() ?? 'x',
        ]
    }
}
