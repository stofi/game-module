import seed from 'seed-random'

let fn: () => number

export function setSeed(s: string) {
    fn = seed(s)
}

export function random() {
    return fn()
}

export function randomInt(min: number, max: number) {
    return Math.floor(random() * (max - min + 1)) + min
}
