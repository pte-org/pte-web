// Records the live stream of one question generation job as a replay fixture (NDJSON, one `{ atMs, event }` a line).
//
//   PTE_REPLAY_TOKEN=<bearer token> PTE_API_BASE_URL=http://localhost:8091 \
//     node tests/tools/recordReplayFixture.mjs <job-public-id> <fixture-name>
//
// The token comes from the environment only and is never written anywhere. The output is cleaned before it is
// written: real ids are replaced by fixed placeholders, and the run is refused if the text still holds anything that
// looks like a credential.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const LIVE_EVENT_TYPES = new Set([
  "snapshot", "begin", "token", "thinking", "stage", "media", "draft", "review", "check", "item", "end",
]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const CREDENTIAL = /Bearer|eyJ/;
const THINKING_KEPT = 200;
const FACT_KEPT = 200;
const MEDIA_FIELDS = new Set(["audioRef", "imageRef"]);
// Pieces of text that arrive within this long of the first of them are kept as one event: the replay types by time.
const COALESCE_MS = 50;

/** Prints a failure without the URL, the headers or the body, which may hold what must not be shown. */
function fail(message) {
  console.error(`recordReplayFixture: ${message}`);
  process.exit(1);
}

function baseUrl() {
  const raw = process.env.PTE_API_BASE_URL;
  if (!raw) fail("PTE_API_BASE_URL is not set");
  const url = new URL(raw);
  if (url.protocol !== "https:" && !LOCAL_HOSTS.has(url.hostname)) {
    fail("refusing to send a token over a connection that is not HTTPS (only localhost may be plain HTTP)");
  }
  return url.origin;
}

/** Stand-ins that are the same for the same real value, so references between events still match. */
function placeholders() {
  const seen = new Map();
  return (value, label) => {
    if (!seen.has(value)) seen.set(value, `${label}-${seen.size + 1}`);
    return seen.get(value);
  };
}

function clean(value, key, stand) {
  if (typeof value === "string") {
    if (MEDIA_FIELDS.has(key)) return stand(value, "media");
    if (key === "thinking") return value.slice(-THINKING_KEPT);
    return value.replace(UUID, (id) => stand(id, "id"));
  }
  if (Array.isArray(value)) return value.map((entry) => clean(entry, key, stand));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([name, entry]) => {
        const cleaned = clean(entry, name, stand);
        const shortened = name === "facts" || name === "details" ? JSON.stringify(cleaned).length > FACT_KEPT * 4 : false;
        return [name, shortened ? {} : cleaned];
      }),
    );
  }
  return value;
}

/** Joins runs of token (or thinking) events of one agent that arrive almost together; every other event stays. */
function coalesce(events) {
  const out = [];
  let groupStart = 0;
  for (const entry of events) {
    const last = out.at(-1);
    const joinable =
      last &&
      (entry.event.type === "token" || entry.event.type === "thinking") &&
      last.event.type === entry.event.type &&
      last.event.index === entry.event.index &&
      last.event.agent === entry.event.agent &&
      entry.atMs - groupStart < COALESCE_MS;
    if (joinable) last.event = { ...last.event, delta: last.event.delta + entry.event.delta };
    else {
      out.push({ atMs: entry.atMs, event: { ...entry.event } });
      groupStart = entry.atMs;
    }
  }
  return out;
}

async function readEvents(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const started = Date.now();
  const events = [];
  let name = "message";
  let data = [];
  let buffered = "";
  const handle = (line) => {
    if (line === "") {
      if (data.length > 0 && LIVE_EVENT_TYPES.has(name)) {
        events.push({ atMs: Date.now() - started, event: { ...JSON.parse(data.join("\n")), type: name } });
      }
      name = "message";
      data = [];
    } else if (line.startsWith("event:")) name = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
  };
  for (;;) {
    const { done, value } = await reader.read();
    buffered += decoder.decode(value, { stream: !done });
    const lines = buffered.split(/\r\n|\r|\n/);
    buffered = done ? "" : (lines.pop() ?? "");
    lines.forEach(handle);
    if (done) {
      handle("");
      return events;
    }
  }
}

async function main() {
  const [jobId, name] = process.argv.slice(2);
  const token = process.env.PTE_REPLAY_TOKEN;
  if (!jobId || !name) fail("usage: node recordReplayFixture.mjs <job-public-id> <fixture-name>");
  if (!token) fail("PTE_REPLAY_TOKEN is not set");
  if (!/^[a-z0-9-]+$/.test(name)) fail("the fixture name may only hold lower case letters, digits and dashes");
  const path = `/api/v1/question-generation/jobs/${encodeURIComponent(jobId)}/live`;
  const response = await fetch(`${baseUrl()}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
    redirect: "error",
  }).catch(() => fail("the request could not be sent"));
  if (!response.ok || !response.body) fail(`the server answered ${response.status} for ${path.replace(jobId, ":job")}`);
  const stand = placeholders();
  const events = coalesce(await readEvents(response)).map(({ atMs, event }) => ({ atMs, event: clean(event, "", stand) }));
  const text = `${events.map((entry) => JSON.stringify(entry)).join("\n")}\n`;
  if (CREDENTIAL.test(text)) fail("the recording holds something that looks like a credential; nothing was written");
  const target = fileURLToPath(new URL(`../fixtures/replay/${name}.ndjson`, import.meta.url));
  writeFileSync(target, text, "utf8");
  console.log(`recorded ${events.length} events as ${name}.ndjson`);
}

main().catch(() => fail("recording failed"));
