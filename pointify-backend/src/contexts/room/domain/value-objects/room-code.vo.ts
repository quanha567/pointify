import * as crypto from 'node:crypto';

/**
 * Unambiguous character set (excludes 0, O, 1, I, L) for easy reading/sharing.
 */
const ROOM_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export class RoomCode {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  /**
   * Generates a 6-character human readable room code, e.g. "PT-8942" or "K9M-2W7"
   */
  public static generate(prefix = 'PT'): RoomCode {
    const bytes = crypto.randomBytes(4);
    let code = '';
    for (let i = 0; i < 4; i++) {
      const byte = bytes[i];
      if (byte !== undefined) {
        code += ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length];
      }
    }
    return new RoomCode(`${prefix}-${code}`);
  }

  /**
   * Normalize and validate room code input from user
   */
  public static parse(raw: string): RoomCode {
    const cleaned = raw.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleaned) {
      throw new Error('Room code cannot be empty');
    }
    return new RoomCode(cleaned);
  }

  public toString(): string {
    return this._value;
  }
}
