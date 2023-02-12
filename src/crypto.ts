export async function createHash(data: string): Promise<string> {
    return await crypto.subtle
        .digest('SHA-256', new TextEncoder().encode(data))
        .then((hash) => {
            return Array.from(new Uint8Array(hash))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('')
        })
}
