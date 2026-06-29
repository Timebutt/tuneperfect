const RECONNECT_DELAY_MS = 2000;

let webSocket: WebSocket | undefined;

export async function initWebSocket() {
  await new Promise<void>((resolve) => {
    webSocket = new WebSocket("ws://localhost:8080");

    // TO-DO: do we need to handle multiple messages coming in, when people push the button multiple times?
    webSocket.onopen = () => {
      console.log("new websocket opened!");

      if (!webSocket) {
        return;
      }

      resolve();
    };

    webSocket.onclose = () => {
      console.log("websocket connection lost!");

      setTimeout(() => initWebSocket(), RECONNECT_DELAY_MS);
    };
  });
}

export function sendWebsocketMessage(message: string) {
  if (!webSocket) {
    return;
  }

  webSocket.send(message);
  console.log("sent message!");
}
