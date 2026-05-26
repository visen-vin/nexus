# Nexus — Handoff: Create Topic Button in Chat

## What is Nexus
A personal learning platform. Guru Ji is an AI mentor (DeepSeek API) embedded as a chat widget. Users can open topics, chat with Guru Ji, and Guru Ji can save new topics directly to the curriculum DB via tool calling.

---

## The Problem
Guru Ji has a `create_topic` tool (function calling) that should save new lessons directly to the database. But when users ask naturally ("create a topic on X"), Guru Ji outputs the content as text in the chat instead of calling the tool.

The fix attempted so far: `tool_choice: { type: 'function', function: { name: 'create_topic' } }` when creation intent is detected via keyword regex — but this was unreliable because Hindi/Hinglish messages don't match the regex.

---

## What Needs to Be Built

**A dedicated "Create Topic" button in the chat input area.**

When clicked:
1. Input placeholder changes to "Topic name..." and a small label shows "Create Mode"
2. User types the topic name (e.g. "German Greetings") and hits Enter or Send
3. A message is sent to Guru Ji: `Create a comprehensive topic on: "${input}" for the "${activeModuleLabel}" module`
4. `streamChat` is called with `forceCreateTopic = true` — this forces `tool_choice: { type: 'function', function: { name: 'create_topic' } }` at the API level
5. After send, `createMode` resets to `false`

---

## Key Files

### `/Users/vin/nexus/src/lib/chat.ts`
`streamChat` already accepts `forceCreateTopic = false` as 7th param:
```ts
export async function streamChat(
  messages: Message[],
  systemPrompt: string,
  onChunk: (delta: string) => void,
  onDone: () => void,
  signal?: AbortSignal,
  onToolCall?: OnToolCall,
  forceCreateTopic = false   // ← already added, just pass true
): Promise<void>
```
When `forceCreateTopic = true`, it passes `tool_choice: { type: 'function', function: { name: 'create_topic' } }` to DeepSeek — this FORCES the tool call, no keyword guessing needed.

### `/Users/vin/nexus/src/components/ChatAgent.tsx`
This is where the UI lives. Key state already added:
```ts
const [createMode, setCreateMode] = useState(false);
```

**What to add:**

1. A `sendCreateTopic` function that calls `streamChat(..., true)` for forced tool use:
```ts
const sendCreateTopic = async (topicName: string) => {
  const msg = `Create a comprehensive topic on: "${topicName}" for the "${activeModuleLabel || activeModuleId || 'current'}" module.`;
  // same as sendMessage but passes forceCreateTopic=true to streamChat
};
```

2. In the input area JSX (around line 462), add a `FilePlus` icon button next to the input that toggles `createMode`. The `FilePlus` icon is already imported.

3. When `createMode` is true:
   - Input placeholder = `"Topic name to create..."`  
   - A small pill badge above input showing `"📝 Create Mode — type topic name & send"`
   - On send, call `sendCreateTopic(input)` instead of `sendMessage(input)`, then `setCreateMode(false)`

---

## Input Area Current JSX (lines 462–484)
```tsx
{/* Input */}
<div className="shrink-0 px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#111113' }}>
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
    <input
      ref={inputRef}
      value={input}
      onChange={e => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      onFocus={() => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 300)}
      placeholder="Ask Guru Ji..."
      disabled={streaming}
      className="flex-1 bg-transparent text-[16px] sm:text-[13px] text-[#f1f1f1] placeholder-[#444] outline-none disabled:opacity-50"
    />
    <button onClick={send} disabled={!input.trim() || streaming} ...>
      <Send />
    </button>
  </div>
</div>
```

Modify to:
- Add `FilePlus` button before the text input (toggles `createMode`)
- Change placeholder to `"Topic name to create..."` when `createMode` is true
- Add a badge/pill above the input row when `createMode` is true
- `send()` function should check `createMode` and call `sendCreateTopic` or `sendMessage` accordingly

---

## sendMessage function (lines ~200–272) — for reference
The new `sendCreateTopic` should be identical to `sendMessage` except:
- Message text is constructed as `Create a comprehensive topic on: "${topicName}"...`  
- `streamChat` call passes `true` as 7th arg

---

## Style Guide
- Dark theme: `#111113` bg, `rgba(255,255,255,0.06)` borders, `rgba(255,255,255,0.04)` subtle fills
- Accent color via CSS var: `var(--domain-accent, #4db8ff)`
- Active mode badge: accent color tint with a close (×) button to cancel
- Tailwind + inline styles (no CSS files)

---

## Server (already complete — no changes needed)
POST `/api/topics` accepts `{ id, moduleId, order, group, title, description, sections[] }` and saves to SQLite.

---

## After implementing — Full Deploy Steps

### Stack
- **Frontend**: React + TypeScript + Vite — builds to `/Users/vin/nexus/dist/`
- **Backend**: Express + better-sqlite3 — running on VPS at `root@187.127.156.138`
- **Process manager**: pm2, process name `nexus-api`, id 16
- **Nginx** proxies `/api/*` → `localhost:3005`, and serves `/var/www/nexus/dist/` for the frontend

### Step 1 — Build frontend
```bash
cd /Users/vin/nexus
npm run build
```
Output will be in `dist/`. TypeScript errors will fail the build — fix them first.

### Step 2 — Deploy frontend (rsync to VPS)
```bash
rsync -avz --delete /Users/vin/nexus/dist/ root@187.127.156.138:/var/www/nexus/dist/
```
The `--delete` flag removes old hashed JS/CSS files from the server. This is safe — Vite generates new hashed filenames on every build.

### Step 3 — Deploy backend (only if server.js changed)
```bash
scp /Users/vin/nexus/server-deploy/server.js root@187.127.156.138:/opt/nexus-api/server.js
ssh root@187.127.156.138 "pm2 restart nexus-api"
```
For this task (UI only change), **Step 3 is NOT needed** — only frontend files changed.

### Verify
```bash
ssh root@187.127.156.138 "pm2 show nexus-api | grep status"
```
Should show `status: online`.

### Live URL
`https://nexus.kibm.in`

### Notes
- No `.env` on server — API key is in Vite env (`VITE_DEEPSEEK_API_KEY`) baked into the JS bundle at build time
- DB lives at `/opt/nexus-api/nexus.db` on the VPS — never overwrite it
- SSH access: `root@187.127.156.138` (key-based, no password needed from this machine)
