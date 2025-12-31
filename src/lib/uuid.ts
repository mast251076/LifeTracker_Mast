export function generateId(prefix: string = 'id'): string {
    // Use crypto.randomUUID if available (secure context)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${prefix}_${crypto.randomUUID()}`;
    }

    // Fallback to timestamp + random string for non-secure contexts (HTTP)
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`;
}
