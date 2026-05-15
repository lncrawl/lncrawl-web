import type { Monaco } from '@monaco-editor/react';
import type { editor, IPosition, IRange } from 'monaco-editor';

// ─── External LSP types ───────────────────────────────────────────────────────

export type LspStatus = 'offline' | 'connecting' | 'ready' | 'error';

export interface LspLogEntry {
  time: number;
  level: 'info' | 'warn' | 'error';
  message: string;
}

// ─── Internal LSP types ───────────────────────────────────────────────────────

interface LspPos {
  line: number;
  character: number;
}

interface LspRange {
  start: LspPos;
  end: LspPos;
}

interface LspDiagnostic {
  range: LspRange;
  severity: 1 | 2 | 3 | 4;
  message: string;
  source?: string;
}

interface LspWorkspaceEdit {
  changes?: Record<string, Array<{ range: LspRange; newText: string }>>;
  documentChanges?: Array<{
    textDocument: { uri: string };
    edits: Array<{ range: LspRange; newText: string }>;
  }>;
}

interface LspInlayHint {
  position: LspPos;
  label: string | Array<{ value: string }>;
  kind?: number;
  paddingLeft?: boolean;
  paddingRight?: boolean;
}

// ─── WebSocket JSON-RPC client ────────────────────────────────────────────────

export class LspClient {
  private _ws: WebSocket;
  private _nextId = 0;
  private _pending = new Map<
    number,
    [(v: unknown) => void, (e: unknown) => void]
  >();

  onDiagnostics?: (uri: string, diags: LspDiagnostic[]) => void;
  onApplyEdit?: (params: { edit: LspWorkspaceEdit }) => Promise<void>;
  onClose?: (ev: CloseEvent) => void;

  constructor(url: string) {
    this._ws = new WebSocket(url);
    this._ws.onmessage = ({ data }) => {
      try {
        this._dispatch(JSON.parse(data as string));
      } catch {
        /* ignore malformed frames */
      }
    };
    this._ws.onclose = (ev) => this.onClose?.(ev);
  }

  waitForOpen(): Promise<void> {
    if (this._ws.readyState === WebSocket.OPEN) return Promise.resolve();
    return new Promise((res, rej) => {
      this._ws.addEventListener('open', () => res(), { once: true });
      this._ws.addEventListener(
        'error',
        () => rej(new Error('LSP WebSocket error')),
        { once: true }
      );
      this._ws.addEventListener(
        'close',
        (ev) =>
          rej(
            new Error(
              `LSP WebSocket closed before open (code ${(ev as CloseEvent).code})`
            )
          ),
        { once: true }
      );
    });
  }

  private _dispatch(msg: Record<string, unknown>) {
    // Server-initiated requests have both `method` and `id`.
    if (msg.method === 'workspace/applyEdit' && msg.id != null) {
      const id = msg.id;
      void (async () => {
        const applied = this.onApplyEdit
          ? await this.onApplyEdit(msg.params as { edit: LspWorkspaceEdit })
              .then(() => true)
              .catch(() => false)
          : false;
        this._send({ jsonrpc: '2.0', id, result: { applied } });
      })();
      return;
    }
    const id = msg.id as number | undefined;
    if (id != null) {
      const handlers = this._pending.get(id);
      if (handlers) {
        this._pending.delete(id);
        if (msg.error) {
          handlers[1](msg.error);
        } else {
          handlers[0](msg.result);
        }
      }
    }
    if (msg.method === 'textDocument/publishDiagnostics') {
      const p = msg.params as { uri: string; diagnostics: LspDiagnostic[] };
      this.onDiagnostics?.(p.uri, p.diagnostics);
    }
  }

  private _send(obj: object) {
    if (this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify(obj));
    }
  }

  request<T = unknown>(method: string, params: unknown): Promise<T> {
    const id = ++this._nextId;
    return new Promise<T>((res, rej) => {
      this._pending.set(id, [res as (v: unknown) => void, rej]);
      this._send({ jsonrpc: '2.0', id, method, params });
    });
  }

  notify(method: string, params: unknown) {
    this._send({ jsonrpc: '2.0', method, params });
  }

  close() {
    for (const [, [, rej]] of this._pending)
      rej(new Error('LSP client closed'));
    this._pending.clear();
    this._ws.close();
  }
}

// ─── Position / range conversion ──────────────────────────────────────────────

function toMonacoRange(r: LspRange): IRange {
  return {
    startLineNumber: r.start.line + 1,
    startColumn: r.start.character + 1,
    endLineNumber: r.end.line + 1,
    endColumn: r.end.character + 1,
  };
}

function fromMonacoPos(p: { lineNumber: number; column: number }): LspPos {
  return { line: p.lineNumber - 1, character: p.column - 1 };
}

// LSP DiagnosticSeverity (1–4) → Monaco MarkerSeverity (8/4/2/1)
const SEVERITY: Record<number, 1 | 2 | 4 | 8> = { 1: 8, 2: 4, 3: 2, 4: 1 };

// ─── Monaco provider registration ────────────────────────────────────────────

export function registerLspProviders(
  monaco: Monaco,
  ed: editor.IStandaloneCodeEditor,
  client: LspClient,
  docUri: string,
  serverCaps: Record<string, unknown> = {}
): () => void {
  const ownsModel = (m: editor.ITextModel | null) => m === ed.getModel();

  // Wrap every LSP request so provider errors don't surface as unhandled rejections.
  async function ask<T>(method: string, params: unknown): Promise<T | null> {
    try {
      return await client.request<T>(method, params);
    } catch {
      return null;
    }
  }

  const disposables = [
    // ── Completions ──────────────────────────────────────────────────────────
    monaco.languages.registerCompletionItemProvider('python', {
      triggerCharacters: ['.'],
      async provideCompletionItems(m: editor.ITextModel, pos: IPosition) {
        if (!ownsModel(m)) return null;
        const raw = await ask<{ items?: unknown[] } | unknown[]>(
          'textDocument/completion',
          { textDocument: { uri: docUri }, position: fromMonacoPos(pos) }
        );
        const items: any[] =
          raw == null ? [] : Array.isArray(raw) ? raw : (raw.items ?? []);

        // Monaco requires a range on every completion item.
        const word = m.getWordUntilPosition(pos);
        const defaultRange: IRange = {
          startLineNumber: pos.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: pos.lineNumber,
          endColumn: word.endColumn,
        };

        return {
          suggestions: items.map((item) => ({
            label: item.label,
            kind: item.kind ?? 1,
            insertText: item.textEdit?.newText ?? item.insertText ?? item.label,
            detail: item.detail ?? undefined,
            documentation:
              typeof item.documentation === 'string'
                ? item.documentation
                : (item.documentation?.value ?? undefined),
            range: item.textEdit?.range
              ? toMonacoRange(item.textEdit.range as LspRange)
              : defaultRange,
          })),
        };
      },
    }),

    // ── Hover ────────────────────────────────────────────────────────────────
    monaco.languages.registerHoverProvider('python', {
      async provideHover(m: editor.ITextModel, pos: IPosition) {
        if (!ownsModel(m)) return null;
        const result = await ask<{ contents: unknown; range?: LspRange }>(
          'textDocument/hover',
          { textDocument: { uri: docUri }, position: fromMonacoPos(pos) }
        );
        if (!result?.contents) return null;
        const raw = Array.isArray(result.contents)
          ? result.contents
          : [result.contents];
        return {
          range: result.range ? toMonacoRange(result.range) : undefined,
          contents: raw.map((c) => ({
            value: typeof c === 'string' ? c : ((c as any)?.value ?? ''),
          })),
        };
      },
    }),

    // ── Formatting (wires into Format Document command and formatOnPaste) ────
    monaco.languages.registerDocumentFormattingEditProvider('python', {
      async provideDocumentFormattingEdits(m: editor.ITextModel) {
        if (!ownsModel(m)) return [];
        const edits = await ask<Array<{ range: LspRange; newText: string }>>(
          'textDocument/formatting',
          {
            textDocument: { uri: docUri },
            options: { tabSize: 4, insertSpaces: true },
          }
        );
        return (edits ?? []).map((e) => ({
          range: toMonacoRange(e.range),
          text: e.newText,
        }));
      },
    }),

    // ── Signature help ───────────────────────────────────────────────────────
    monaco.languages.registerSignatureHelpProvider('python', {
      signatureHelpTriggerCharacters: ['(', ','],
      signatureHelpRetriggerCharacters: [','],
      async provideSignatureHelp(
        m: editor.ITextModel,
        pos: IPosition,
        _token: unknown,
        context: {
          triggerKind: number;
          triggerCharacter?: string;
          isRetrigger: boolean;
        }
      ) {
        if (!ownsModel(m)) return null;
        const result = await ask<{
          signatures: Array<{
            label: string;
            documentation?: string | { value: string };
            parameters?: Array<{
              label: string | [number, number];
              documentation?: string | { value: string };
            }>;
          }>;
          activeSignature?: number;
          activeParameter?: number;
        }>('textDocument/signatureHelp', {
          textDocument: { uri: docUri },
          position: fromMonacoPos(pos),
          context: {
            triggerKind: context.triggerKind,
            triggerCharacter: context.triggerCharacter,
            isRetrigger: context.isRetrigger,
          },
        });
        if (!result?.signatures.length) return null;
        const docString = (d: string | { value: string } | undefined) =>
          d == null
            ? undefined
            : { value: typeof d === 'string' ? d : d.value };
        return {
          value: {
            signatures: result.signatures.map((sig) => ({
              label: sig.label,
              documentation: docString(sig.documentation),
              parameters: (sig.parameters ?? []).map((p) => ({
                label: p.label,
                documentation: docString(p.documentation),
              })),
            })),
            activeSignature: result.activeSignature ?? 0,
            activeParameter: result.activeParameter ?? 0,
          },
          dispose() {},
        };
      },
    }),

    // ── Rename ───────────────────────────────────────────────────────────────
    monaco.languages.registerRenameProvider('python', {
      async resolveRenameLocation(m: editor.ITextModel, pos: IPosition) {
        if (!ownsModel(m)) return null;
        const result = await ask<
          | { range: LspRange; placeholder: string }
          | { defaultBehavior: boolean }
        >('textDocument/prepareRename', {
          textDocument: { uri: docUri },
          position: fromMonacoPos(pos),
        });
        if (!result) return null;
        if ('defaultBehavior' in result) {
          const word = m.getWordAtPosition(pos);
          if (!word) return { rejectReason: 'Nothing to rename here.' };
          return {
            range: {
              startLineNumber: pos.lineNumber,
              startColumn: word.startColumn,
              endLineNumber: pos.lineNumber,
              endColumn: word.endColumn,
            },
            text: word.word,
          };
        }
        return { range: toMonacoRange(result.range), text: result.placeholder };
      },
      async provideRenameEdits(
        m: editor.ITextModel,
        pos: IPosition,
        newName: string
      ) {
        if (!ownsModel(m)) return null;
        const result = await ask<LspWorkspaceEdit>('textDocument/rename', {
          textDocument: { uri: docUri },
          position: fromMonacoPos(pos),
          newName,
        });
        if (!result) return null;
        const edits: any[] = [];
        if (result.documentChanges) {
          for (const dc of result.documentChanges) {
            for (const e of dc.edits) {
              edits.push({
                resource: monaco.Uri.parse(dc.textDocument.uri),
                versionId: undefined,
                textEdit: { range: toMonacoRange(e.range), text: e.newText },
              });
            }
          }
        } else if (result.changes) {
          for (const [uri, fileEdits] of Object.entries(result.changes)) {
            for (const e of fileEdits) {
              edits.push({
                resource: monaco.Uri.parse(uri),
                versionId: undefined,
                textEdit: { range: toMonacoRange(e.range), text: e.newText },
              });
            }
          }
        }
        return { edits };
      },
    }),
  ];

  // ── Inlay hints (only if the server advertises support) ──────────────────
  if (serverCaps.inlayHintProvider) {
    disposables.push(
      monaco.languages.registerInlayHintsProvider('python', {
        async provideInlayHints(m: editor.ITextModel, range: IRange) {
          if (!ownsModel(m)) return null;
          const result = await ask<LspInlayHint[]>('textDocument/inlayHint', {
            textDocument: { uri: docUri },
            range: {
              start: {
                line: range.startLineNumber - 1,
                character: range.startColumn - 1,
              },
              end: {
                line: range.endLineNumber - 1,
                character: range.endColumn - 1,
              },
            },
          });
          if (!result) return null;
          return {
            hints: result.map((h) => ({
              position: {
                lineNumber: h.position.line + 1,
                column: h.position.character + 1,
              },
              label: Array.isArray(h.label)
                ? h.label.map((p) => p.value).join('')
                : h.label,
              kind: h.kind,
              paddingLeft: h.paddingLeft,
              paddingRight: h.paddingRight,
            })),
            dispose() {},
          };
        },
      })
    );
  }

  // ── Diagnostics (server-pushed) ───────────────────────────────────────────
  client.onDiagnostics = (uri, diags) => {
    if (uri !== docUri) return;
    const m = ed.getModel();
    if (!m) return;
    monaco.editor.setModelMarkers(
      m,
      'pylsp',
      diags.map((d) => ({
        ...toMonacoRange(d.range),
        severity: SEVERITY[d.severity] ?? 8,
        message: d.message,
        source: d.source,
      }))
    );
  };

  // ── workspace/applyEdit (server-pushed, used by code actions) ────────────
  client.onApplyEdit = async ({ edit }) => {
    const m = ed.getModel();
    if (!m) return;
    const fileEdits: Array<{ range: LspRange; newText: string }> = [];
    if (edit.documentChanges) {
      for (const dc of edit.documentChanges) {
        if (dc.textDocument.uri === docUri) fileEdits.push(...dc.edits);
      }
    } else if (edit.changes?.[docUri]) {
      fileEdits.push(...edit.changes[docUri]);
    }
    if (fileEdits.length > 0) {
      ed.executeEdits(
        'pylsp',
        fileEdits.map((e) => ({
          range: toMonacoRange(e.range),
          text: e.newText,
        }))
      );
    }
  };

  return () => {
    disposables.forEach((d) => d.dispose());
    client.onDiagnostics = undefined;
    client.onApplyEdit = undefined;
    const m = ed.getModel();
    if (m) monaco.editor.setModelMarkers(m, 'pylsp', []);
  };
}
