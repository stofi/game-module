import sha256 from 'crypto-js/sha256'

export function createHash(data: string): string {
    return sha256(data).toString()
}
