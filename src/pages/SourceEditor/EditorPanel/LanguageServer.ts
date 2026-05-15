import { API_BASE_URL } from '@/config';
import { store } from '@/store';
import { Auth } from '@/store/_auth';
import { Editor } from '@/store/_editor';
import type { LspLogEntry, LspStatus } from '@/utils/lsp';
import { LspClient, registerLspProviders } from '@/utils/lsp';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentEditor } from './EditorRef';

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
      contentFormat: ['markdown', 'plaintext'],
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

const MAX_RETRIES = 10;
const MAX_DELAY = 30000;

/**
 * Manages the lifecycle of a pylsp WebSocket connection tied to the Monaco
 * editor. Reconnects automatically with exponential backoff on failure.
 */
export const PythonLanguageServer: React.FC<any> = () => {
  const editorRef = useCurrentEditor();
  const isAdmin = useSelector(Auth.select.isAdmin);
  const source = useSelector(Editor.select.currentSource);
  const retryKey = useSelector(Editor.select.lspRetryKey);

  const setStatus = (status: LspStatus) => {
    store.dispatch(Editor.action.setLspStatus(status));
  };
  const emit = (level: LspLogEntry['level'], message: string) => {
    store.dispatch(Editor.action.addLspLog({ level, message }));
  };

  useEffect(() => {
    if (!isAdmin || !source || !editorRef) {
      setStatus('offline');
      return;
    }

    const token = Auth.select.authToken(store.getState());
    if (!token) {
      setStatus('offline');
      return;
    }

    const { editor, monaco } = editorRef;
    const docUri = `file:///workspace/sources/${source.file_path}`;

    let aborted = false;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;
    let abortResolve!: () => void;
    const abortPromise = new Promise<void>((res) => {
      abortResolve = res;
    });

    // Resolves when the delay elapses OR the effect is torn down.
    const sleep = (ms: number) =>
      Promise.race([
        new Promise<void>((res) => {
          retryTimeout = setTimeout(res, ms);
        }),
        abortPromise,
      ]);

    let activeClient: LspClient | undefined;
    let disposeProviders: (() => void) | undefined;
    let changeHandle: { dispose(): void } | undefined;

    void (async () => {
      let failCount = 0;
      let firstIter = true;

      while (!aborted) {
        if (firstIter) {
          emit('info', `Connecting to LSP for ${source.file_path}`);
          setStatus('connecting');
          firstIter = false;
        } else if (failCount > 0) {
          const delay = Math.min(MAX_DELAY, 1000 * 2 ** (failCount - 1));
          emit(
            'warn',
            `Reconnecting in ${delay / 1000}s... (attempt ${failCount} of ${MAX_RETRIES})`
          );
          setStatus('connecting');
          await sleep(delay);
          if (aborted) break;
        } else {
          // Unexpected drop after a successful session — reconnect immediately.
          emit('info', 'Reconnecting to LSP...');
          setStatus('connecting');
        }

        // Dispose providers from the previous iteration before creating a new client.
        disposeProviders?.();
        disposeProviders = undefined;
        changeHandle?.dispose();
        changeHandle = undefined;

        const client = new LspClient(buildURL(token));
        activeClient = client;

        // Resolved by onClose so we can detect an unexpected drop while running.
        let resolveClose!: () => void;
        const closedPromise = new Promise<void>((res) => {
          resolveClose = res;
        });
        client.onClose = () => resolveClose();

        try {
          await client.waitForOpen();
          if (aborted) {
            client.close();
            break;
          }
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
          if (aborted) {
            client.close();
            break;
          }
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
          failCount = 0; // reset backoff on successful initialisation

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

          // Block until the WebSocket closes unexpectedly or the effect is torn down.
          await Promise.race([closedPromise, abortPromise]);

          if (!aborted) {
            emit('warn', 'LSP connection dropped — will reconnect');
            lspFlushRef.current = null;
            // failCount stays 0 → next iteration retries immediately.
          }
        } catch (err) {
          if (aborted) break;
          failCount++;
          const msg = err instanceof Error ? err.message : String(err);
          emit('error', `Lost connection: ${msg}`);
          if (failCount > MAX_RETRIES) {
            emit('error', `Giving up after ${MAX_RETRIES} failed attempts`);
            setStatus('error');
            break;
          }
        } finally {
          client.close();
        }
      }
    })();

    return () => {
      aborted = true;
      abortResolve();
      clearTimeout(retryTimeout);
      lspFlushRef.current = null;
      changeHandle?.dispose();
      disposeProviders?.();
      try {
        activeClient?.notify('textDocument/didClose', {
          textDocument: { uri: docUri },
        });
      } catch {
        /* ignore if already closed */
      }
      activeClient?.close();
      emit('info', 'LSP disconnected');
      setStatus('offline');
    };
  }, [isAdmin, source, retryKey, editorRef]);

  return null;
};
