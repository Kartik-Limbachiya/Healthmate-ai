/**
 * Text-to-Speech utility using the browser's SpeechSynthesis API.
 * No external dependencies required.
 */

let isTTSEnabled = false;

export function setTTSEnabled(enabled: boolean) {
  isTTSEnabled = enabled;
  if (!enabled) {
    stopSpeaking();
  }
}

export function getTTSEnabled(): boolean {
  return isTTSEnabled;
}

/**
 * Speak the given text aloud. Cancels any current speech first.
 * Only speaks if TTS is enabled via setTTSEnabled(true).
 */
export function speak(text: string) {
  if (!isTTSEnabled) return;
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Clean up markdown-like formatting for natural speech
  const cleanText = text
    .replace(/[*_#`~]/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();

  if (!cleanText) return;

  // Split into chunks of ~200 chars at sentence boundaries
  // (SpeechSynthesis can choke on very long text)
  const chunks = splitIntoChunks(cleanText, 200);

  chunks.forEach((chunk, index) => {
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a natural-sounding English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function splitIntoChunks(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    // Find the last sentence boundary within maxLen
    let splitAt = remaining.lastIndexOf(". ", maxLen);
    if (splitAt === -1 || splitAt < maxLen / 2) {
      splitAt = remaining.lastIndexOf(" ", maxLen);
    }
    if (splitAt === -1) {
      splitAt = maxLen;
    }
    chunks.push(remaining.slice(0, splitAt + 1).trim());
    remaining = remaining.slice(splitAt + 1).trim();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
}
