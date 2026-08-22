/**
 * MCP SERVERS — the built-in default bundle (McpDefaultsSettings) plus any
 * servers the user has added themselves. A custom server is added OFF and
 * consent-gated exactly like a built-in write/secret entry (buildDefaultMcpServers
 * in src/main/hive.ts never arms one without an explicit enabled:true) — arbitrary
 * user-typed commands get no safe-readonly fast path.
 */
import { useEffect, useState } from 'react';
import { PixelButton } from './PixelButton';
import { McpDefaultsSettings } from './McpDefaultsSettings';
import { MCP_CATALOG, type McpCatalogEntry, type McpTier } from '@shared/mcpCatalog';
import type { HarnessConfig } from '@/store/config';

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--cth-font-display)',
  fontSize: 8,
  lineHeight: '12px',
  color: 'var(--cth-ink-500)',
  textTransform: 'uppercase'
};

const inputStyle: React.CSSProperties = {
  padding: '5px 8px',
  background: 'var(--cth-paper-100)',
  color: 'var(--cth-ink-900)',
  border: 'none',
  boxShadow: 'inset 0 0 0 1px var(--cth-ink-300)',
  fontFamily: 'var(--cth-font-ui)',
  fontSize: 12,
  width: '100%'
};

function slugify(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Best-effort split of a command line into argv, honoring simple quotes.
 *  Good enough for `npx -y @scope/pkg --flag "value with spaces"` style input —
 *  this is a form field, not a shell, so no pipes/redirection/expansion. */
function splitArgs(line: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

export function McpServersTab() {
  const [config, setConfig] = useState<HarnessConfig | null>(null);
  useEffect(() => { void window.cth.getConfig().then(setConfig); }, []);
  const onConfigChange = setConfig;

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [command, setCommand] = useState('npx');
  const [argsLine, setArgsLine] = useState('');
  const [envLines, setEnvLines] = useState('');
  const [tier, setTier] = useState<Exclude<McpTier, 'safe-readonly'>>('write');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  // Local mirror so deletes/adds feel instant; still round-trips through
  // updateConfig so it survives a reload the same way mcpDefaults does.
  const [custom, setCustom] = useState<McpCatalogEntry[]>([]);
  useEffect(() => { setCustom(config?.customMcpServers ?? []); }, [config?.customMcpServers]);

  const knownIds = new Set([...MCP_CATALOG.map((e) => e.id), ...custom.map((e) => e.id)]);

  const persist = async (next: McpCatalogEntry[], patch: Partial<HarnessConfig> = {}) => {
    const updated = await window.cth.updateConfig({ customMcpServers: next, ...patch });
    onConfigChange(updated);
  };

  const resetForm = () => {
    setLabel(''); setDescription(''); setCommand('npx'); setArgsLine(''); setEnvLines('');
    setTier('write'); setError(''); setAdding(false);
  };

  const submit = async () => {
    setError('');
    const trimmedLabel = label.trim();
    if (!trimmedLabel) { setError('name is required'); return; }
    if (!command.trim()) { setError('command is required'); return; }
    const id = slugify(trimmedLabel);
    if (!id) { setError('name must contain a letter or number'); return; }
    if (knownIds.has(id)) { setError(`"${id}" is already in use — pick a different name`); return; }

    const env: Record<string, string> = {};
    for (const raw of envLines.split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      const eq = line.indexOf('=');
      if (eq < 1) { setError(`env line "${line}" must be KEY=value`); return; }
      env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }

    const entry: McpCatalogEntry = {
      id,
      label: trimmedLabel,
      description: description.trim() || `Custom MCP server (${command.trim()}).`,
      spec: {
        command: command.trim(),
        args: splitArgs(argsLine),
        ...(Object.keys(env).length ? { env } : {})
      },
      tier,
      defaultEnabled: false
    };

    const next = [...custom, entry];
    setCustom(next);
    // Consent-gate it exactly like a catalog write/secret server: added but
    // OFF until the user flips it on below (mcpDefaults[id].enabled === true).
    await persist(next, { mcpDefaults: { ...(config?.mcpDefaults ?? {}), [id]: { enabled: false } } });
    resetForm();
    setNote(`added ${trimmedLabel} — enable it below when ready`);
    setTimeout(() => setNote(''), 2500);
  };

  const remove = async (id: string) => {
    const next = custom.filter((e) => e.id !== id);
    setCustom(next);
    await persist(next);
  };

  const enabledFor = (id: string): boolean => config?.mcpDefaults?.[id]?.enabled ?? false;

  const toggle = async (id: string) => {
    const next = !enabledFor(id);
    const updated = await window.cth.updateConfig({
      mcpDefaults: { ...(config?.mcpDefaults ?? {}), [id]: { enabled: next } }
    });
    onConfigChange(updated);
  };

  if (!config) {
    return <div style={{ padding: 10, fontSize: 12, color: 'var(--cth-ink-500)' }}>Loading…</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%', overflowY: 'auto', padding: 10, gap: 20 }}>
      <McpDefaultsSettings config={config} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={labelStyle}>Custom servers</span>
          {!adding && (
            <PixelButton variant="ghost" size="sm" onClick={() => setAdding(true)}>+ add server</PixelButton>
          )}
        </div>

        {custom.length === 0 && !adding && (
          <div style={{ fontSize: 12, color: 'var(--cth-ink-500)' }}>
            No custom servers yet. Add any stdio MCP server by command + args — it merges into every
            new agent's session settings once enabled below.
          </div>
        )}

        {custom.map((e) => {
          const on = enabledFor(e.id);
          return (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, padding: '7px 10px',
              background: 'var(--cth-paper-100)',
              boxShadow: `inset 0 0 0 1px ${on ? '#6E1423' : 'var(--cth-ink-300)'}`
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12, lineHeight: '18px', color: 'var(--cth-ink-900)', fontWeight: 600 }}>
                  {e.label}
                  <code style={{ marginLeft: 6, fontFamily: 'var(--cth-font-mono)', fontSize: 11, color: 'var(--cth-ink-500)', fontWeight: 400 }}>
                    {e.id}
                  </code>
                </span>
                <span style={{ fontSize: 12, lineHeight: '16px', color: 'var(--cth-ink-500)', wordBreak: 'break-word' }}>
                  {e.description}
                </span>
                <span style={{ fontFamily: 'var(--cth-font-mono)', fontSize: 10.5, color: 'var(--cth-ink-500)', wordBreak: 'break-all' }}>
                  {e.spec.command} {e.spec.args.join(' ')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => void toggle(e.id)}
                  style={{
                    padding: '3px 10px 1px',
                    background: on ? 'var(--cth-coral-light, #f6d3c4)' : 'var(--cth-cream-200)',
                    boxShadow: `inset 0 0 0 1px ${on ? 'var(--cth-ink-900)' : 'var(--cth-ink-700)'}`,
                    border: 'none', fontFamily: 'var(--cth-font-display)', fontSize: 8,
                    lineHeight: '14px', color: 'var(--cth-ink-900)', cursor: 'pointer', textTransform: 'uppercase'
                  }}
                >{on ? 'on' : 'off'}</button>
                <button
                  type="button"
                  onClick={() => void remove(e.id)}
                  style={{
                    padding: '3px 10px 1px', background: 'var(--cth-cream-200)',
                    boxShadow: 'inset 0 0 0 1px var(--cth-ink-700)', border: 'none',
                    fontFamily: 'var(--cth-font-display)', fontSize: 8, lineHeight: '14px',
                    color: 'var(--cth-ink-900)', cursor: 'pointer', textTransform: 'uppercase'
                  }}
                >remove</button>
              </div>
            </div>
          );
        })}

        {adding && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, background: 'var(--cth-paper-100)', boxShadow: 'inset 0 0 0 1px var(--cth-ink-300)' }}>
            <div>
              <div style={{ ...labelStyle, marginBottom: 3 }}>Name</div>
              <input style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Notion" />
            </div>
            <div>
              <div style={{ ...labelStyle, marginBottom: 3 }}>Description (optional)</div>
              <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this server does" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: '0 0 120px' }}>
                <div style={{ ...labelStyle, marginBottom: 3 }}>Command</div>
                <input style={inputStyle} value={command} onChange={(e) => setCommand(e.target.value)} placeholder="npx" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...labelStyle, marginBottom: 3 }}>Args</div>
                <input style={inputStyle} value={argsLine} onChange={(e) => setArgsLine(e.target.value)} placeholder="-y @some/mcp-server" />
              </div>
            </div>
            <div>
              <div style={{ ...labelStyle, marginBottom: 3 }}>Env vars (one KEY=value per line, optional)</div>
              <textarea
                style={{ ...inputStyle, minHeight: 52, resize: 'vertical', fontFamily: 'var(--cth-font-mono)' }}
                value={envLines}
                onChange={(e) => setEnvLines(e.target.value)}
                placeholder={'API_KEY=sk-...'}
              />
            </div>
            <div>
              <div style={{ ...labelStyle, marginBottom: 3 }}>Tier</div>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as Exclude<McpTier, 'safe-readonly'>)}
                style={{ ...inputStyle, width: 'auto' }}
              >
                <option value="write">write — can mutate state beyond the workspace</option>
                <option value="secret">secret — needs an API key / credentials</option>
              </select>
            </div>
            {error && <span style={{ fontSize: 11, color: 'var(--cth-coral)' }}>{error}</span>}
            <div style={{ display: 'flex', gap: 8 }}>
              <PixelButton variant="primary" size="sm" onClick={() => void submit()}>add</PixelButton>
              <PixelButton variant="ghost" size="sm" onClick={resetForm}>cancel</PixelButton>
            </div>
          </div>
        )}

        {note && <span style={{ fontSize: 12, color: 'var(--cth-mint)' }}>{note}</span>}
      </div>
    </div>
  );
}
