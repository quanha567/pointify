const FACILITATOR_KEYS_STORAGE_KEY = 'pointify_facilitator_keys';

/**
 * Reads all stored facilitator keys mapped by roomId.
 */
export function getStoredFacilitatorKeys(): Record<string, string> {
  try {
    const raw = localStorage.getItem(FACILITATOR_KEYS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch (error) {
    console.error('Failed to parse stored facilitator keys:', error);
    return {};
  }
}

/**
 * Gets the secret facilitator key for a specific roomId if present.
 */
export function getFacilitatorKey(roomId: string): string | null {
  if (!roomId) return null;
  const keys = getStoredFacilitatorKeys();
  return keys[roomId] || null;
}

/**
 * Saves a facilitator key for a given roomId.
 */
export function saveFacilitatorKey(roomId: string, key: string): void {
  if (!roomId || !key) return;
  try {
    const keys = getStoredFacilitatorKeys();
    keys[roomId] = key;
    localStorage.setItem(FACILITATOR_KEYS_STORAGE_KEY, JSON.stringify(keys));
  } catch (error) {
    console.error('Failed to save facilitator key:', error);
  }
}

/**
 * Removes a facilitator key for a given roomId.
 */
export function removeFacilitatorKey(roomId: string): void {
  if (!roomId) return;
  try {
    const keys = getStoredFacilitatorKeys();
    delete keys[roomId];
    localStorage.setItem(FACILITATOR_KEYS_STORAGE_KEY, JSON.stringify(keys));
  } catch (error) {
    console.error('Failed to remove facilitator key:', error);
  }
}
