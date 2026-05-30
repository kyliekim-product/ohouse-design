// PlaygroundChat — 채팅 인터페이스 + 스트리밍 응답 렌더링
// @missing-ods:playground-chat

import { useState, useRef, useEffect, useCallback } from 'react';

const EXAMPLE_PROMPTS = [
  '장바구니 화면의 빈 상태(empty state)를 만들어줘. 첫 구매 유도 CTA 포함.',
  '카테고리 홈에서 서브카테고리 탐색 방식을 가로 스크롤 칩 → 그리드 방식으로 바꾼 prototype 보여줘.',
  '상품 상세 페이지 리뷰 섹션 A안·B안 두 가지 만들어줘.',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  const isError = msg.role === 'error';

  return (
    <div className={`pg__msg pg__msg--${isError ? 'error' : msg.role}`}>
      <div className="pg__msg-bubble">
        {msg.content}
        {msg.streaming && <span className="pg__cursor" aria-hidden="true" />}
      </div>
    </div>
  );
}

export default function PlaygroundChat({ onHtmlGenerated, apiKey: propApiKey, hasServerKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [ctxOpen, setCtxOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [clientApiKey, setClientApiKey] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // textarea 자동 높이
  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  };

  const effectiveApiKey = propApiKey || clientApiKey;
  // key가 없어도 서버가 OPENAI_API_KEY env var로 처리 가능 — 블로킹하지 않음
  const canSend = !streaming && input.trim().length > 0;

  const extractHtml = (text) => {
    // ```html ... ``` 블록 추출
    const match = text.match(/```html\s*([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  const sendMessage = useCallback(async (text) => {
    const userText = text.trim();
    if (!userText || streaming) return;

    const newUserMsg = { role: 'user', content: userText };
    const history = [...messages, newUserMsg];
    setMessages(history);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setStreaming(true);

    // 스트리밍용 assistant placeholder
    const assistantId = Date.now();
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', streaming: true, id: assistantId },
    ]);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (!hasServerKey && effectiveApiKey) {
        headers['X-API-Key'] = effectiveApiKey;
      }

      const res = await fetch('/api/playground', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          userContext: context || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        for (const line of raw.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (!json) continue;

          try {
            const evt = JSON.parse(json);
            if (evt.type === 'delta' && evt.text) {
              fullText += evt.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: fullText, streaming: true }
                    : m
                )
              );
              // HTML 감지 → preview 즉시 업데이트 (코드 블록 완성 전 partial도 전달)
              const partial = extractHtml(fullText);
              if (partial) onHtmlGenerated?.(partial);
            } else if (evt.type === 'done') {
              break;
            } else if (evt.type === 'error') {
              throw new Error(evt.message);
            }
          } catch {
            // JSON 파싱 실패 시 무시
          }
        }
      }

      // 스트리밍 완료 — cursor 제거
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m
        )
      );

      // 최종 HTML 다시 파싱
      const finalHtml = extractHtml(fullText);
      if (finalHtml) onHtmlGenerated?.(finalHtml);

    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { role: 'error', content: `오류: ${err.message}`, id: assistantId }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, context, effectiveApiKey, hasServerKey, onHtmlGenerated]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) sendMessage(input);
    }
  };

  const showEmpty = messages.length === 0;
  // 클라이언트 key 미입력 시 배너만 보여줌 (전송 블로킹 없음 — 서버 env var로 처리)
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

      {/* 컨텍스트 패널 */}
      <div className="pg__ctx">
        <button
          className="pg__ctx-toggle"
          aria-expanded={ctxOpen}
          onClick={() => setCtxOpen((v) => !v)}
        >
          <span>컨텍스트 추가 (PRD / 기획 초안)</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {ctxOpen && (
          <div className="pg__ctx-body">
            <textarea
              className="pg__ctx-textarea"
              placeholder="관련 기획서, 요구사항, 참고 내용을 붙여넣으세요…"
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, 5000))}
            />
            <div className="pg__ctx-meta">
              <span>{context.length} / 5,000자</span>
              {context && (
                <button className="pg__ctx-clear" onClick={() => setContext('')}>
                  초기화
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 메시지 목록 / 빈 상태 */}
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
                <button
                  key={p}
                  className="pg__chip"
                  role="listitem"
                  onClick={() => sendMessage(p)}
                  >
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
    </div>
  );
}
