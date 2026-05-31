// PlaygroundChat — 채팅 인터페이스 + 스트리밍 응답 렌더링
// @missing-ods:playground-chat

import { useState, useRef, useEffect, useCallback } from 'react';

const EXAMPLE_PROMPTS = [
  '장바구니 화면의 빈 상태(empty state)를 만들어줘. 첫 구매 유도 CTA 포함.',
  '카테고리 홈에서 서브카테고리 탐색 방식을 가로 스크롤 칩 → 그리드 방식으로 바꾼 prototype 보여줘.',
  '상품 상세 페이지 리뷰 섹션 A안·B안 두 가지 만들어줘.',
];

// ─── 메시지 버블 ─────────────────────────────────────────────────
function Message({ msg }) {
  const isError = msg.role === 'error';
  const isStatus = msg.role === 'status';
  return (
    <div className={`pg__msg pg__msg--${isError ? 'error' : msg.role}`}>
      <div className="pg__msg-bubble">
        {isStatus && <span className="pg__status-dot" aria-hidden="true" />}
        {msg.content}
        {msg.streaming && !isStatus && <span className="pg__cursor" aria-hidden="true" />}
      </div>
    </div>
  );
}

// ─── 컨텍스트 모달 ────────────────────────────────────────────────
function ContextModal({ onClose, onAdd, contextItems, onRemove }) {
  const [view, setView] = useState('main'); // 'main' | 'text'
  const [textVal, setTextVal] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const readFileAsText = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('');
    // text 파일만 처리
    if (file.type.startsWith('text/') || file.name.match(/\.(md|txt|csv|json)$/i)) {
      reader.readAsText(file);
    } else {
      resolve(`[바이너리 파일: ${file.name}]`);
    }
  });

  const handleFiles = async (files) => {
    for (const file of Array.from(files)) {
      const content = await readFileAsText(file);
      onAdd({ type: 'file', name: file.name, content });
    }
    onClose();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
  };

  const handleAddText = () => {
    if (!textVal.trim()) return;
    const preview = textVal.trim().slice(0, 40);
    onAdd({ type: 'text', name: `텍스트 입력: "${preview}${textVal.length > 40 ? '…' : ''}"`, content: textVal });
    onClose();
  };

  return (
    <div className="pg__modal-overlay" onClick={onClose}>
      <div className="pg__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="소스 추가">
        <div className="pg__modal-header">
          <span className="pg__modal-title">소스 추가</span>
          <button className="pg__modal-close" onClick={onClose} aria-label="닫기">×</button>
        </div>

        {view === 'main' ? (
          <>
            {/* 드래그 영역 */}
            <div
              className={`pg__drop-area${isDragOver ? ' pg__drop-area--dragover' : ''}`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="파일 드래그 또는 클릭해서 업로드"
            >
              <svg className="pg__drop-icon" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <path d="M18 4C18 4 9 10 9 20a9 9 0 0018 0C27 10 18 4 18 4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M18 4v16M14 16l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="28" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M27.5 10h1M28 9.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="pg__drop-text">여기에 소스를 드래그하세요</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileInput}
              accept=".txt,.md,.csv,.json,.pdf"
              multiple
            />

            {/* 소스 버튼 4개 */}
            <div className="pg__source-btns">
              {/* 업로드 */}
              <button className="pg__source-btn" onClick={() => fileInputRef.current?.click()}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <path d="M11 14V4M7 8l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                업로드
              </button>

              {/* 텍스트 입력 */}
              <button className="pg__source-btn" onClick={() => setView('text')}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M7 9h8M7 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                텍스트 입력
              </button>

              {/* Google 드라이브 (비활성) */}
              <button className="pg__source-btn" disabled title="준비 중">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <path d="M7.5 14.5L4 19h14l-3.5-4.5" stroke="#4285F4" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M11 3L4 14.5h6L16.5 4" stroke="#0F9D58" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M16.5 4L18 7l-4.5 7.5H10" stroke="#FBBC04" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
                Google 드라이브
              </button>

              {/* Slack (비활성) */}
              <button className="pg__source-btn" disabled title="준비 중">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <rect x="5" y="5" width="4" height="7" rx="2" stroke="#E01E5A" strokeWidth="1.4"/>
                  <rect x="13" y="10" width="4" height="7" rx="2" stroke="#2EB67D" strokeWidth="1.4"/>
                  <rect x="10" y="5" width="7" height="4" rx="2" stroke="#ECB22E" strokeWidth="1.4"/>
                  <rect x="5" y="13" width="7" height="4" rx="2" stroke="#36C5F0" strokeWidth="1.4"/>
                </svg>
                Slack
              </button>
            </div>

            {/* 추가된 컨텍스트 목록 — 소스 버튼 하단 */}
            {contextItems.length > 0 && (
              <div className="pg__modal-ctx-list">
                {contextItems.map((item) => (
                  <div key={item.id} className="pg__modal-ctx-item">
                    <span className="pg__modal-ctx-icon">
                      {item.type === 'file' ? '📄' : '📝'}
                    </span>
                    <span className="pg__modal-ctx-name" title={item.name}>{item.name}</span>
                    <button
                      className="pg__modal-ctx-remove"
                      onClick={() => onRemove(item.id)}
                      aria-label={`${item.name} 삭제`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* 텍스트 입력 뷰 */
          <div className="pg__text-input-view">
            <textarea
              placeholder="관련 기획서, 요구사항, 참고 메모를 붙여넣거나 직접 입력하세요…&#10;(최대 5,000자)"
              value={textVal}
              onChange={(e) => setTextVal(e.target.value.slice(0, 5000))}
              autoFocus
            />
            <div className="pg__text-input-actions">
              <button className="pg__text-btn pg__text-btn--secondary" onClick={() => setView('main')}>← 뒤로</button>
              <button className="pg__text-btn pg__text-btn--primary" onClick={handleAddText} disabled={!textVal.trim()}>추가</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 메인 PlaygroundChat ──────────────────────────────────────────
export default function PlaygroundChat({
  onHtmlGenerated,
  onPreviewStatus,
  onPreviewError,
  currentHtml,
  currentVariantId,
  apiKey: propApiKey,
  hasServerKey,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [clientApiKey, setClientApiKey] = useState('');

  // 컨텍스트 — 다중 아이템 방식
  const [contextItems, setContextItems] = useState([]); // [{id, type, name, content}]
  const [showContextModal, setShowContextModal] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  };

  const effectiveApiKey = propApiKey || clientApiKey;
  const canSend = !streaming && input.trim().length > 0;

  const addContextItem = useCallback(({ type, name, content }) => {
    setContextItems((prev) => [...prev, { id: Date.now(), type, name, content }]);
  }, []);

  const removeContextItem = useCallback((id) => {
    setContextItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // 모든 컨텍스트 아이템을 합쳐 API에 전달
  const buildUserContext = () => {
    if (!contextItems.length) return undefined;
    return contextItems
      .map((c) => `[${c.name}]\n${c.content}`)
      .join('\n\n---\n\n');
  };

  const sendMessage = useCallback(async (text) => {
    const userText = text.trim();
    if (!userText || streaming) return;
    const shouldRefine = Boolean(currentHtml) && /수정|바꿔|변경|더|덜|추가|제거|교체|개선|A안|B안|C안|CTA|카피|색|간격|톤|문구/.test(userText);

    const newUserMsg = { role: 'user', content: userText };
    const history = [...messages, newUserMsg];
    setMessages(history);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setStreaming(true);
    onPreviewStatus?.('understanding', '요청을 해석하고 있어요.');

    const assistantId = Date.now();
    const statusId = assistantId + 1;
    setMessages((prev) => [
      ...prev,
      { role: 'status', content: '요청을 해석하고 있어요.', streaming: true, id: statusId },
    ]);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (!hasServerKey && effectiveApiKey) headers['X-API-Key'] = effectiveApiKey;

      const res = await fetch('/api/playground', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: history
            .filter(({ role }) => role === 'user' || role === 'assistant')
            .map(({ role, content }) => ({ role, content })),
          userContext: buildUserContext(),
          mode: shouldRefine ? 'refine' : 'generate',
          targetVariantId: shouldRefine ? currentVariantId : undefined,
          currentHtml: shouldRefine ? currentHtml : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const assistantMessageIds = [];

      const updateStatus = (message) => {
        setMessages((prev) =>
          prev.map((m) => m.id === statusId ? { ...m, content: message, streaming: true } : m)
        );
      };

      const appendAssistantText = (textChunk) => {
        const id = assistantId + 100 + assistantMessageIds.length;
        assistantMessageIds.push(id);
        setMessages((prev) => {
          return [...prev, { role: 'assistant', content: textChunk, streaming: true, id }];
        });
      };

      const handleEvent = (evt) => {
        if (evt.type === 'status') {
          updateStatus(evt.message);
          onPreviewStatus?.(evt.stage, evt.message);
        } else if (evt.type === 'assistant_text' && evt.text) {
          appendAssistantText(evt.text);
        } else if (evt.type === 'prototype_done') {
          if (evt.variants?.length) {
            onHtmlGenerated?.(null, null, evt.variants);
          } else if (evt.html) {
            onHtmlGenerated?.(evt.html, null);
          }
        } else if (evt.type === 'error') {
          onPreviewError?.(evt.message);
          throw new Error(evt.message);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          let evt;
          try {
            evt = JSON.parse(json);
          } catch { /* JSON 파싱 실패 무시 */ }
          if (!evt || evt.type === 'done') continue;
          handleEvent(evt);
        }
      }

      setMessages((prev) =>
        prev.map((m) => {
          if (assistantMessageIds.includes(m.id)) return { ...m, streaming: false };
          if (m.id === statusId) return { ...m, streaming: false };
          return m;
        })
      );

    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류';
      onPreviewError?.(message);
      setMessages((prev) =>
        prev
          .map((m) => m.id === statusId ? { ...m, streaming: false } : m)
          .filter((m) => !assistantMessageIds.includes(m.id))
          .concat({ role: 'error', content: `오류: ${message}`, id: assistantId })
      );
    } finally {
      setStreaming(false);
    }
  }, [
    messages,
    streaming,
    contextItems,
    currentHtml,
    currentVariantId,
    effectiveApiKey,
    hasServerKey,
    onHtmlGenerated,
    onPreviewStatus,
    onPreviewError,
  ]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) sendMessage(input);
    }
  };

  const showEmpty = messages.length === 0;
  const showKeyBanner = !hasServerKey && !effectiveApiKey;

  return (
    <div className="pg__chat">
      {/* API Key 입력 배너 */}
      {!hasServerKey && (
        <div className="pg__key-banner" style={{ display: effectiveApiKey ? 'none' : 'flex' }}>
          <span>OpenAI API Key</span>
          <input
            type="password"
            placeholder="sk-..."
            value={clientApiKey}
            onChange={(e) => setClientApiKey(e.target.value)}
            autoComplete="off"
          />
        </div>
      )}

      {/* ④ 컨텍스트 섹션 */}
      <div className="pg__ctx">
        <button
          className="pg__ctx-trigger"
          onClick={() => setShowContextModal(true)}
          aria-label={`컨텍스트 추가${contextItems.length > 0 ? ` (${contextItems.length}개)` : ''}`}
        >
          <div className="pg__ctx-trigger-left">
            <span className="pg__ctx-trigger-label">컨텍스트 추가</span>
            {contextItems.length > 0 && (
              <span className="pg__ctx-badge">{contextItems.length}</span>
            )}
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 아이템 목록은 모달 내부에서 확인 */}
      </div>

      {/* 메시지 목록 */}
      <div className="pg__messages" role="log" aria-live="polite" aria-label="대화 내용">
        {showEmpty ? (
          <div className="pg__empty">
            <div>
              <p className="pg__empty-title">무엇을 만들어볼까요?</p>
              <p className="pg__empty-subtitle" style={{ marginTop: 6 }}>
                오늘의집 디자인 패턴을 아는 AI가<br />prototype.html을 바로 만들어드립니다.
              </p>
            </div>
            <div className="pg__chips" role="list">
              {EXAMPLE_PROMPTS.map((p) => (
                <button key={p} className="pg__chip" role="listitem" onClick={() => sendMessage(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => <Message key={msg.id ?? i} msg={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="pg__input-area">
        <div className="pg__input-row">
          <textarea
            ref={textareaRef}
            className="pg__textarea"
            placeholder="화면 아이디어를 자연어로 설명하세요…"
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            disabled={streaming}
            rows={1}
          />
          <button
            className="pg__send"
            disabled={!canSend}
            onClick={() => sendMessage(input)}
            aria-label="전송"
          >
            {streaming ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        <p style={{ marginTop: 6, fontSize: 11, color: 'var(--c-text-soft)', textAlign: 'center' }}>
          Shift+Enter 줄바꿈 · Enter 전송
        </p>
      </div>

      {/* 컨텍스트 모달 */}
      {showContextModal && (
        <ContextModal
          onClose={() => setShowContextModal(false)}
          onAdd={(item) => { addContextItem(item); setShowContextModal(false); }}
          contextItems={contextItems}
          onRemove={removeContextItem}
        />
      )}
    </div>
  );
}
