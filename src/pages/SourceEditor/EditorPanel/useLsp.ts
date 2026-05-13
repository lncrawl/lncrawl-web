import { API_BASE_URL } from '@/config';
import { store } from '@/store';
import { Auth } from '@/store/_auth';
import { Editor } from '@/store/_editor';
import type { LspLogEntry, LspStatus } from '@/utils/lsp';
import { LspClient, registerLspProviders } from '@/utils/lsp';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { editorRef } from './EditorRef';

// Callable by the Ctrl+S handler to flush the debounce and sync latest
// content to pylsp before requesting formatting.
export const lspFlushRef: { current: (() => void) | null } = { current: null };

// Subset of LSP capabilities we actually use.
// codeAction + codeActionLiteralSupport is required so pylsp returns CodeAction
// objects (with an inline edit field) instead of bare Command objects.
const CAPABILITIES = {
  textDocument: {
    synchronization: {
      dynamicRegistration: false,
    },
    completion: {
      dynamicRegistration: false,
      completionItem: {
        snippetSupport: true,
        commitCharactersSupport: true,
        documentationFormat: ['markdown', 'plaintext'],
        deprecatedSupport: true,
        preselectSupport: true,
        insertReplaceSupport: true,
        labelDetailsSupport: true,
        tagSupport: { valueSet: [1] }, // 1 = Deprecated
        insertTextModeSupport: { valueSet: [1, 2] }, // 1 = asIs, 2 = adjustIndentation
        resolveSupport: {
          properties: ['detail', 'documentation', 'additionalTextEdits'],
        },
      },
      completionItemKind: {
        valueSet: Array.from({ length: 25 }, (_, i) => i + 1),
      },
      contextSupport: true,
    },
    signatureHelp: {
      dynamicRegistration: false,
      signatureInformation: {
        documentationFormat: ['markdown', 'plaintext'],
        parameterInformation: { labelOffsetSupport: true },
        activeParameterSupport: true,
      },
      contextSupport: true,
    },
    hover: {
      dynamicRegistration: false,
      contentFormat: ['markdown'],
    },
    publishDiagnostics: {
      relatedInformation: true,
      tagSupport: { valueSet: [1, 2] }, // 1 = Unnecessary, 2 = Deprecated
      codeDescriptionSupport: true,
      dataSupport: true,
    },
    formatting: {
      dynamicRegistration: false,
    },
    rename: {
      dynamicRegistration: false,
      prepareSupport: true,
      prepareSupportDefaultBehavior: 1, // 1 = Identifier
      honorsChangeAnnotations: false,
    },
    inlayHint: {
      dynamicRegistration: false,
      resolveSupport: { properties: ['tooltip', 'textEdits'] },
    },
    codeAction: {
      dynamicRegistration: false,
      codeActionLiteralSupport: {
        codeActionKind: {
          valueSet: [
            'quickfix',
            'refactor',
            'source',
            'source.organizeImports',
            'source.fixAll',
          ],
        },
      },
      resolveSupport: { properties: [] as string[] },
    },
  },
  workspace: {
    applyEdit: true,
    workspaceEdit: {
      documentChanges: true,
      resourceOperations: ['create', 'rename', 'delete'],
      failureHandling: 'textOnlyTransactional',
      normalizesLineEndings: true,
      changeAnnotationSupport: { groupsOnLabel: false },
    },
  },
};

function buildURL(token: string): string {
  // Convert http(s)://host → ws(s)://host, fall back to current origin for relative API base.
  const origin = API_BASE_URL || window.location.origin;
  const baseUrl = origin.replace(/^http/, 'ws');
  return `${baseUrl}/api/lsp?token=${encodeURIComponent(token)}`;
}

/**
 * Manages the lifecycle of a pylsp WebSocket connection tied to the Monaco
 * editor. Returns the current connection status for display in the UI.
 */
export function usePythonLanguageServer(ready: boolean) {
  const isAdmin = useSelector(Auth.select.isAdmin);
  const source = useSelector(Editor.select.currentSource);

  const setStatus = (status: LspStatus) => {
    store.dispatch(Editor.action.setLspStatus(status));
  };
  const emit = (level: LspLogEntry['level'], message: string) => {
    store.dispatch(Editor.action.addLspLog({ level, message }));
  };

  useEffect(() => {
    if (!ready || !isAdmin || !source) {
      setStatus('offline');
      return;
    }

    const state = editorRef.current;
    if (!state) {
      setStatus('offline');
      return;
    }

    const token = Auth.select.authToken(store.getState());
    if (!token) {
      setStatus('offline');
      return;
    }

    const { editor, monaco } = state;
    const docUri = `file:///workspace/sources/${source.file_path}`;

    setStatus('connecting');
    emit('info', `Connecting to LSP for ${source.file_path}`);
    const client = new LspClient(buildURL(token));
    let disposeProviders: (() => void) | undefined;
    let changeHandle: { dispose(): void } | undefined;
    let aborted = false;

    void (async () => {
      try {
        await client.waitForOpen();
        if (aborted) return;
        emit('info', 'WebSocket open — initializing language server');

        const initResult = await client.request<{
          capabilities: Record<string, unknown>;
        }>('initialize', {
          processId: null,
          clientInfo: { name: 'lncrawl-web', version: '1.0' },
          rootUri: 'file:///workspace',
          capabilities: CAPABILITIES,
          workspaceFolders: [{ uri: 'file:///workspace', name: 'lncrawl' }],
        });
        if (aborted) return;
        emit('info', 'Language server initialized');

        client.notify('initialized', {});
        client.notify('textDocument/didOpen', {
          textDocument: {
            uri: docUri,
            languageId: 'python',
            version: 0,
            text: editor.getValue(),
          },
        });
        emit('info', `Opened document: ${source.file_path}`);

        disposeProviders = registerLspProviders(
          monaco,
          editor,
          client,
          docUri,
          initResult?.capabilities ?? {}
        );
        setStatus('ready');
        emit('info', 'LSP ready — completions, hover and diagnostics active');

        // Debounce content sync so we don't flood pylsp while the user types.
        let docVersion = 1;
        let debounce: ReturnType<typeof setTimeout>;
        changeHandle = editor.onDidChangeModelContent(() => {
          clearTimeout(debounce);
          debounce = setTimeout(() => {
            client.notify('textDocument/didChange', {
              textDocument: { uri: docUri, version: docVersion++ },
              contentChanges: [{ text: editor.getValue() }],
            });
          }, 300);
        });

        // Expose a flush so the Ctrl+S handler can sync the latest content
        // to pylsp before the debounce fires, avoiding a stale-format race.
        lspFlushRef.current = () => {
          clearTimeout(debounce);
          client.notify('textDocument/didChange', {
            textDocument: { uri: docUri, version: docVersion++ },
            contentChanges: [{ text: editor.getValue() }],
          });
        };
      } catch (err) {
        if (!aborted) {
          const msg = err instanceof Error ? err.message : String(err);
          emit('error', `Connection failed: ${msg}`);
          setStatus('error');
        }
      }
    })();

    return () => {
      aborted = true;
      lspFlushRef.current = null;
      changeHandle?.dispose();
      disposeProviders?.();
      try {
        client.notify('textDocument/didClose', {
          textDocument: { uri: docUri },
        });
      } catch {
        /* ignore if already closed */
      }
      client.close();
      emit('info', 'LSP disconnected');
      setStatus('offline');
    };
  }, [isAdmin, source, ready]);
}
