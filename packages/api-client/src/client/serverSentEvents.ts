/** One server-sent event: its name (`message` when the server gave none) and its data lines joined. */
export interface ServerSentEvent {
  name: string;
  data: string;
}

const DEFAULT_EVENT_NAME = "message";
const LINE_BREAK = /\r\n|\r|\n/;

/**
 * Reads a `text/event-stream` body and calls `onEvent` for every complete event, in order. Comment lines
 * (keep-alives) and fields other than `event` and `data` are skipped. Resolves when the stream ends.
 */
export async function readServerSentEvents(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: ServerSentEvent) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffered = "";
  let name = DEFAULT_EVENT_NAME;
  let data: string[] = [];

  const handleLine = (line: string): void => {
    if (line === "") {
      if (data.length > 0) onEvent({ name, data: data.join("\n") });
      name = DEFAULT_EVENT_NAME;
      data = [];
      return;
    }
    if (line.startsWith(":")) return;
    const colon = line.indexOf(":");
    const field = colon < 0 ? line : line.slice(0, colon);
    // One optional space after the colon belongs to the syntax, not to the value.
    const value = colon < 0 ? "" : line.slice(colon + 1).replace(/^ /, "");
    if (field === "event") name = value || DEFAULT_EVENT_NAME;
    if (field === "data") data.push(value);
  };

  for (;;) {
    const { done, value } = await reader.read();
    buffered += decoder.decode(value, { stream: !done });
    const lines = buffered.split(LINE_BREAK);
    // The last piece may be a line cut in half; it waits for the next chunk.
    buffered = done ? "" : (lines.pop() ?? "");
    lines.forEach(handleLine);
    if (done) {
      handleLine("");
      return;
    }
  }
}
