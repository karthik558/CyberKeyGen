/**
 * CyberKeyGen Cryptographically Secure Random Number & Password Generator
 * 
 * Replaces all non-cryptographic Math.random() usage with crypto.getRandomValues().
 * Uses rejection sampling to eliminate modulo bias and Fisher-Yates for unbiased shuffling.
 */

export const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?/~",
  ambiguous: "0OIl1|[]{}(),.;:'\"/\\`~",
} as const;

/**
 * Returns an unbiased cryptographically secure random integer in [0, max - 1].
 * Uses rejection sampling to avoid modulo bias.
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  if (max === 1) return 0;

  const uint32Max = 0x100000000;
  const limit = uint32Max - (uint32Max % max);
  const buffer = new Uint32Array(1);

  let rand: number;
  do {
    crypto.getRandomValues(buffer);
    rand = buffer[0];
  } while (rand >= limit);

  return rand % max;
}

/**
 * Unbiased cryptographically secure float in [0, 1).
 */
export function getSecureRandomFloat(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 0x100000000;
}

/**
 * Selects a random element from an array or string.
 */
export function getSecureRandomItem<T>(items: ArrayLike<T>): T {
  if (!items || items.length === 0) {
    throw new Error("Cannot select from an empty collection");
  }
  const idx = getSecureRandomInt(items.length);
  return items[idx];
}

/**
 * In-place cryptographically secure Fisher-Yates array shuffle.
 */
export function secureShuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

export interface PasswordGenerationOptions {
  length: number;
  includeLowercase?: boolean;
  includeUppercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean;
  avoidRepeating?: boolean;
  requireAllTypes?: boolean;
  usePronounceable?: boolean;
}

/**
 * Generates a cryptographically secure random password meeting all requested constraints.
 */
export function generateSecurePassword(options: PasswordGenerationOptions): string {
  const {
    length = 16,
    includeLowercase = true,
    includeUppercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeAmbiguous = false,
    avoidRepeating = false,
    requireAllTypes = true,
    usePronounceable = false,
  } = options;

  if (usePronounceable) {
    return generateSecurePronounceablePassword(length, includeUppercase, includeNumbers, includeSymbols);
  }

  // Build character pools
  let lowerPool = includeLowercase ? CHARSETS.lowercase : "";
  let upperPool = includeUppercase ? CHARSETS.uppercase : "";
  let numberPool = includeNumbers ? CHARSETS.numbers : "";
  let symbolPool = includeSymbols ? CHARSETS.symbols : "";

  if (excludeAmbiguous) {
    const ambigSet = new Set(CHARSETS.ambiguous);
    lowerPool = lowerPool.split("").filter(c => !ambigSet.has(c)).join("");
    upperPool = upperPool.split("").filter(c => !ambigSet.has(c)).join("");
    numberPool = numberPool.split("").filter(c => !ambigSet.has(c)).join("");
    symbolPool = symbolPool.split("").filter(c => !ambigSet.has(c)).join("");
  }

  const selectedPools: string[] = [];
  if (lowerPool) selectedPools.push(lowerPool);
  if (upperPool) selectedPools.push(upperPool);
  if (numberPool) selectedPools.push(numberPool);
  if (symbolPool) selectedPools.push(symbolPool);

  if (selectedPools.length === 0) {
    // Fallback safe alphanumeric if all turned off
    lowerPool = CHARSETS.lowercase;
    selectedPools.push(lowerPool);
  }

  const fullPool = selectedPools.join("");
  const targetLength = Math.max(8, Math.min(128, length));

  // Determine effective length when avoidRepeating is active to prevent impossible states
  const effectiveLength = avoidRepeating ? Math.min(targetLength, fullPool.length) : targetLength;
  const resultChars: string[] = [];
  const usedChars = new Set<string>();

  // Ensure at least one character from each selected pool
  if (requireAllTypes && selectedPools.length > 0) {
    for (const pool of selectedPools) {
      if (resultChars.length < effectiveLength) {
        let picked: string;
        let attempts = 0;
        do {
          picked = getSecureRandomItem(pool);
          attempts++;
        } while (avoidRepeating && usedChars.has(picked) && attempts < 50);

        resultChars.push(picked);
        if (avoidRepeating) usedChars.add(picked);
      }
    }
  }

  // Fill remaining slots
  while (resultChars.length < effectiveLength) {
    let picked: string;
    let attempts = 0;
    do {
      picked = getSecureRandomItem(fullPool);
      attempts++;
    } while (avoidRepeating && usedChars.has(picked) && attempts < 50);

    resultChars.push(picked);
    if (avoidRepeating) usedChars.add(picked);
  }

  // Shuffle characters to remove any positional bias from required characters
  secureShuffle(resultChars);

  return resultChars.join("");
}

/**
 * Generates a cryptographically secure numeric PIN.
 */
export function generateSecurePin(length: number, avoidRepeating: boolean = false): string {
  const digits = CHARSETS.numbers;
  const targetLength = Math.max(4, Math.min(12, length));

  if (avoidRepeating) {
    // If length <= 10, strictly unique digits
    if (targetLength <= 10) {
      const digitArr = digits.split("");
      secureShuffle(digitArr);
      return digitArr.slice(0, targetLength).join("");
    }
    // If length > 10, avoid adjacent repeating digits
    const result: string[] = [];
    let lastDigit = "";
    for (let i = 0; i < targetLength; i++) {
      let nextDigit: string;
      do {
        nextDigit = getSecureRandomItem(digits);
      } while (nextDigit === lastDigit);
      result.push(nextDigit);
      lastDigit = nextDigit;
    }
    return result.join("");
  }

  const result: string[] = [];
  for (let i = 0; i < targetLength; i++) {
    result.push(getSecureRandomItem(digits));
  }
  return result.join("");
}

/**
 * Consonants and vowels for secure pronounceable password generation.
 */
const CONSONANTS = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "y", "z"];
const VOWELS = ["a", "e", "i", "o", "u"];
const CONSONANT_PAIRS = ["bl", "br", "ch", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sh", "sk", "sl", "sp", "st", "th", "tr"];

export function generateSecurePronounceablePassword(
  length: number,
  includeUppercase: boolean = true,
  includeNumbers: boolean = true,
  includeSymbols: boolean = true
): string {
  const targetLength = Math.max(8, Math.min(128, length));
  let pwd = "";

  // Build syllable alternating pattern
  while (pwd.length < targetLength) {
    const usePair = getSecureRandomFloat() < 0.25;
    const cons = usePair ? getSecureRandomItem(CONSONANT_PAIRS) : getSecureRandomItem(CONSONANTS);
    const vow = getSecureRandomItem(VOWELS);
    pwd += cons + vow;
  }

  const chars = pwd.slice(0, targetLength).split("");

  if (includeUppercase && chars.length > 0) {
    const pos = getSecureRandomInt(chars.length);
    chars[pos] = chars[pos].toUpperCase();
  }

  if (includeNumbers && chars.length > 1) {
    const pos = getSecureRandomInt(chars.length);
    chars[pos] = getSecureRandomItem(CHARSETS.numbers);
  }

  if (includeSymbols && chars.length > 2) {
    const pos = getSecureRandomInt(chars.length);
    chars[pos] = getSecureRandomItem(CHARSETS.symbols);
  }

  return chars.join("");
}

/**
 * Leet speak character mapping with cryptographically secure substitution rate.
 */
const LEET_MAP: Record<string, string> = {
  a: "@", b: "8", c: "(", d: "D", e: "3", f: "F", g: "6", h: "H",
  i: "1", j: "J", k: "K", l: "L", m: "M", n: "N", o: "0", p: "P",
  q: "Q", r: "R", s: "5", t: "7", u: "U", v: "V", w: "W", x: "X",
  y: "Y", z: "Z",
};

export function convertToSecureLeetSpeak(text: string): string {
  if (!text) return "";
  return text
    .split("")
    .map(char => {
      // 70% conversion chance using cryptographic randomness
      if (getSecureRandomFloat() < 0.7) {
        const lower = char.toLowerCase();
        return LEET_MAP[lower] || char;
      }
      return char;
    })
    .join("");
}

export function createSecureMixedPassword(
  baseText: string,
  length: number,
  includeLowercase: boolean,
  includeUppercase: boolean,
  includeNumbers: boolean,
  includeSymbols: boolean,
  excludeAmbiguous: boolean
): string {
  if (!baseText) return "";
  const leet = convertToSecureLeetSpeak(baseText);
  if (leet.length >= length) {
    return leet.slice(0, length);
  }

  const remaining = length - leet.length;
  const extra = generateSecurePassword({
    length: remaining,
    includeLowercase,
    includeUppercase,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    avoidRepeating: false,
    requireAllTypes: false,
  });

  return leet + extra;
}
