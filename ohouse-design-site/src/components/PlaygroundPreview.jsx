// PlaygroundPreview — iframe 프리뷰 + OS 셀렉터 + A/B/C 탭 + Copy/Download
// @missing-ods:playground-preview

import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_VARIANTS = 3;
const VARIANT_LABELS = ['A', 'B', 'C'];
const OS_OPTIONS = [
  { id: 'ios',  label: 'iOS'   },
  { id: 'aos',  label: 'AOS'   },
  { id: 'web',  label: 'Web뷰' },
];

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1 8.5V2a1 1 0 011-1h6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 1v7M4 6l2.5 2.5L9 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.5 10.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function Toast({ msg }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: '#0a0a0a', color: '#fff', padding: '8px 18px',
      borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      animation: 'pg-fadein 0.15s ease',
      pointerEvents: 'none',
    }}>
      {msg}
    </div>
  );
}

export default function PlaygroundPreview({ html, htmls }) {
  const [variants, setVariants] = useState([{ html: null, label: 'A' }]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [os, setOs] = useState('ios');
  const [toast, setToast] = useState(null);
  const iframeRef = useRef(null);
  const toastTimerRef = useRef(null);

  // 단일 html — active variant에 적용
  useEffect(() => {
    if (!html) return;
    setVariants((prev) => {
      const updated = [...prev];
      updated[activeIdx] = { ...updated[activeIdx], html };
      return updated;
    });
  }, [html]);

  // A/B/C 다중 htmls — 자동 variants 생성
  useEffect(() => {
    if (!htmls?.length) return;
    setVariants(htmls.map((h, i) => ({ html: h, label: VARIANT_LABELS[i] ?? String(i + 1) })));
    setActiveIdx(0);
  }, [htmls]);

  const currentHtml = variants[activeIdx]?.html ?? null;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !currentHtml) return;
    iframe.srcdoc = currentHtml;
  }, [currentHtml]);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const handleCopy = async () => {
    if (!currentHtml) return;
    try {
      await navigator.clipboard.writeText(currentHtml);
      showToast('HTML 복사됨 · 에디터에 붙여넣으세요');
    } catch {
      showToast('복사 실패 — 브라우저 권한을 확인하세요');
    }
  };

  const handleDownload = () => {
    if (!currentHtml) return;
    const label = variants[activeIdx]?.label ?? 'A';
    const blob = new Blob([currentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prototype-${label.toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`prototype-${label.toLowerCase()}.html 다운로드`);
  };

  const addVariant = () => {
    if (variants.length >= MAX_VARIANTS) return;
    setVariants((prev) => [...prev, { html: null, label: VARIANT_LABELS[prev.length] }]);
    setActiveIdx(variants.length);
  };

  const hasAny = variants.some((v) => v.html);
  const showAddTab = variants.length < MAX_VARIANTS && hasAny;

  return (
    <div className="pg__preview">
      {/* 상단 바 */}
      <div className="pg__preview-bar">
        <div className="pg__tabs" role="tablist" aria-label="Prototype 변형">
          {variants.map((v, i) => (
            <button
              key={v.label}
              className={`pg__tab${activeIdx === i ? ' pg__tab--active' : ''}`}
              role="tab"
              aria-selected={activeIdx === i}
              onClick={() => setActiveIdx(i)}
            >
              {v.label}
            </button>
          ))}
          {showAddTab && (
            <button className="pg__tab" onClick={addVariant} aria-label="변형 추가">+</button>
          )}
        </div>
        <div className="pg__actions">
          <button className="pg__action-btn" onClick={handleCopy} disabled={!currentHtml} title="HTML 클립보드 복사">
            <CopyIcon /> Copy HTML
          </button>
          <button className="pg__action-btn" onClick={handleDownload} disabled={!currentHtml} title="prototype.html 다운로드">
            <DownloadIcon /> 저장
          </button>
        </div>
      </div>

      {/* 프레임 영역 */}
      <div className="pg__frame-area" role="region" aria-label="Prototype 미리보기">

        {/* ③ OS 셀렉터 — 폰 상단 플로팅 */}
        <div className="pg__os-selector" role="radiogroup" aria-label="OS 유형 선택">
          {OS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`pg__os-btn${os === opt.id ? ' pg__os-btn--active' : ''}`}
              onClick={() => setOs(opt.id)}
              aria-pressed={os === opt.id}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {currentHtml ? (
          <div className={`pg__phone pg__phone--${os}`} aria-label={`${os.toUpperCase()} 프레임`}>
            {/* OS별 상단 요소 */}
            {os === 'ios' && <div className="pg__phone-notch" aria-hidden="true" />}
            {os === 'aos' && <div className="pg__phone-statusbar" aria-hidden="true" />}
            {/* Web뷰는 상단 요소 없음 */}
            <iframe
              ref={iframeRef}
              className="pg__iframe"
              title={`Prototype ${variants[activeIdx]?.label}`}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="pg__preview-empty" aria-label="프리뷰 없음">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="12" y="6" width="24" height="36" rx="4" stroke="currentColor" strokeWidth="2"/>
              <circle cx="24" cy="38" r="2" fill="currentColor"/>
              <rect x="18" y="12" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="16" y="17" width="16" height="2" rx="1" fill="currentColor"/>
              <rect x="16" y="22" width="10" height="2" rx="1" fill="currentColor"/>
            </svg>
            <p>왼쪽 채팅에서<br />화면을 요청하면<br />여기에 표시됩니다</p>
          </div>
        )}
      </div>

      {toast && <Toast msg={toast} />}
    </div>
  );
}
