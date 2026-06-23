let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new AudioContext();
  }
  if (sharedAudioContext.state === "suspended") {
    sharedAudioContext.resume().catch((err) => console.warn("Failed to resume AudioContext:", err));
  }
  return sharedAudioContext;
}

// AudioContext.setSinkId is a Chromium-only API (available in Tauri on Windows via WebView2).
// On macOS/Linux (WebKit) this silently no-ops so callers don't need to guard.
export async function setAudioOutputDevice(deviceId: string | null): Promise<void> {
  const ctx = getAudioContext();
  const setSinkId = (ctx as AudioContext & { setSinkId?: (id: string) => Promise<void> }).setSinkId;
  if (typeof setSinkId === "function") {
    await setSinkId.call(ctx, deviceId ?? "").catch((err: unknown) => {
      console.warn("Failed to set audio output device:", err);
    });
  }
}
