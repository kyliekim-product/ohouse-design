// PlaygroundPreview — OS별 뷰포트 + 동적 스케일 + A/B/C 탭 + Copy/Download
// @missing-ods:playground-preview

import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_VARIANTS   = 3;
const VARIANT_LABELS = ['A', 'B', 'C'];
const DEFAULT_SCALE  = 0.85;   // 디폴트 최대 스케일
const MIN_SCALE      = 0.3;
const MAX_SCALE      = 1.5;
const ZOOM_STEP      = 0.05;

// ─── OS 별 대표 디바이스 뷰포트 스펙 ──────────────────────────────
const OS_SPECS = {
  ios: {
    label: 'iOS',
    device: 'iPhone 16',
    width: 393,    // pt (logical pixel)
    height: 852,
    radius: 50,    // corner radius
    bezel: 12,     // outer frame border (px)
    chrome: 'dynamic-island',
  },
  aos: {
    label: 'AOS',
    device: 'Galaxy S24',
    width: 360,    // dp (Samsung Galaxy S시리즈 표준 — 1080px @ 3x)
    height: 780,
    radius: 42,
    bezel: 10,
    chrome: 'statusbar',
  },
  web: {
    label: 'Web뷰',
    device: 'Mobile Web',
    width: 390,
    height: 780,   // first viewport (above the fold 중심)
    radius: 12,
    bezel: 0,
    chrome: 'browser',
  },
};

// ─── 아이콘 ───────────────────────────────────────────────────────
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
      position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)',
      background:'#0a0a0a', color:'#fff', padding:'8px 18px',
      borderRadius:10, fontSize:13, fontWeight:500, zIndex:9999,
      boxShadow:'0 4px 20px rgba(0,0,0,0.18)',
      animation:'pg-fadein 0.15s ease', pointerEvents:'none',
    }}>
      {msg}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────
export default function PlaygroundPreview({ html, htmls }) {
  const [variants, setVariants]     = useState([{ html: null, label: 'A' }]);
  const [activeIdx, setActiveIdx]   = useState(0);
  const [os, setOs]                 = useState('ios');
  const [scale, setScale]           = useState(DEFAULT_SCALE);
  const [userZoomed, setUserZoomed] = useState(false); // 수동 줌 여부
  const [toast, setToast]           = useState(null);

  const frameAreaRef  = useRef(null);
  const iframeRef     = useRef(null);
  const toastTimerRef = useRef(null);

  // ── 동적 스케일 계산 — 디폴트 0.85, 수동 줌 중엔 건드리지 않음 ──
  useEffect(() => {
    const calc = () => {
      if (!frameAreaRef.current || userZoomed) return;
      const { width: aW, height: aH } = frameAreaRef.current.getBoundingClientRect();
      const spec     = OS_SPECS[os];
      const paddingH = 72;
      const paddingW = 48;
      const fitH = (aH - paddingH) / (spec.height + spec.bezel * 2);
      const fitW = (aW - paddingW) / (spec.width  + spec.bezel * 2);
      setScale(Math.min(fitH, fitW, DEFAULT_SCALE)); // 최대 0.85
    };
    calc();
    const observer = new ResizeObserver(calc);
    if (frameAreaRef.current) observer.observe(frameAreaRef.current);
    return () => observer.disconnect();
  }, [os, userZoomed]);

  // OS 변경 시 수동 줌 초기화
  const handleOsChange = (newOs) => {
    setOs(newOs);
    setUserZoomed(false); // 리셋 → 자동 계산으로 복귀
  };

  const zoomIn  = () => { setScale((s) => Math.min(+(s + ZOOM_STEP).toFixed(2), MAX_SCALE)); setUserZoomed(true); };
  const zoomOut = () => { setScale((s) => Math.max(+(s - ZOOM_STEP).toFixed(2), MIN_SCALE)); setUserZoomed(true); };

  // ── variants 업데이트 ────────────────────────────────────────────
  useEffect(() => {
    if (!html) return;
    setVariants((prev) => {
      const updated = [...prev];
      updated[activeIdx] = { ...updated[activeIdx], html };
      return updated;
    });
  }, [html]);

  useEffect(() => {
    if (!htmls?.length) return;
    setVariants(htmls.map((h, i) => ({ html: h, label: VARIANT_LABELS[i] ?? String(i+1) })));
    setActiveIdx(0);
  }, [htmls]);

  const currentHtml = variants[activeIdx]?.html ?? null;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !currentHtml) return;
    iframe.srcdoc = currentHtml;
  }, [currentHtml]);

  // ── 액션 ─────────────────────────────────────────────────────────
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
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `prototype-${label.toLowerCase()}.html`; a.click();
    URL.revokeObjectURL(url);
    showToast(`prototype-${label.toLowerCase()}.html 다운로드`);
  };

  const addVariant = () => {
    if (variants.length >= MAX_VARIANTS) return;
    setVariants((prev) => [...prev, { html: null, label: VARIANT_LABELS[prev.length] }]);
    setActiveIdx(variants.length);
  };

  const spec     = OS_SPECS[os];
  const hasAny   = variants.some((v) => v.html);
  const showAdd  = variants.length < MAX_VARIANTS && hasAny;

  // 폰 프레임 인라인 스타일 (OS별 크기 + 동적 스케일)
  const phoneStyle = {
    width:        spec.width,
    height:       spec.height,
    borderRadius: spec.radius,
    transform:    `scale(${scale})`,
    ...(spec.bezel > 0 && {
      boxShadow: `0 0 0 ${spec.bezel}px #1a1a1a, 0 20px 60px rgba(0,0,0,0.25)`,
    }),
  };

  return (
    <div className="pg__preview">
      {/* ── 상단 바 ── */}
      <div className="pg__preview-bar">
        <div className="pg__tabs" role="tablist" aria-label="Prototype 변형">
          {variants.map((v, i) => (
            <button
              key={v.label}
              className={`pg__tab${activeIdx === i ? ' pg__tab--active' : ''}`}
              role="tab" aria-selected={activeIdx === i}
              onClick={() => setActiveIdx(i)}
            >
              {v.label}
            </button>
          ))}
          {showAdd && (
            <button className="pg__tab" onClick={addVariant} aria-label="변형 추가">+</button>
          )}
        </div>
        <div className="pg__actions">
          <button className="pg__action-btn" onClick={handleCopy} disabled={!currentHtml}>
            <CopyIcon /> Copy HTML
          </button>
          <button className="pg__action-btn" onClick={handleDownload} disabled={!currentHtml}>
            <DownloadIcon /> 저장
          </button>
        </div>
      </div>

      {/* ── 프레임 영역 ── */}
      <div className="pg__frame-area" ref={frameAreaRef} role="region" aria-label="Prototype 미리보기">

        {/* ③ OS 셀렉터 — 상단 플로팅 pill */}
        <div className="pg__os-selector" role="radiogroup" aria-label="OS 유형 선택">
          {Object.entries(OS_SPECS).map(([key, s]) => (
            <button
              key={key}
              className={`pg__os-btn${os === key ? ' pg__os-btn--active' : ''}`}
              onClick={() => handleOsChange(key)}
              aria-pressed={os === key}
            >
              {s.label}
              <span className="pg__os-device">{s.device}</span>
            </button>
          ))}
        </div>

        {/* 줌 컨트롤 — 우하단 플로팅 */}
        <div className="pg__zoom-controls" role="group" aria-label="줌 조절">
          <button
            className="pg__zoom-btn"
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            aria-label="축소"
          >
            −
          </button>
          <span className="pg__zoom-pct" aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <button
            className="pg__zoom-btn"
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            aria-label="확대"
          >
            +
          </button>
        </div>

        {currentHtml ? (
          <div
            className={`pg__phone pg__phone--${os}`}
            style={phoneStyle}
            aria-label={`${spec.device} 프레임 (${spec.width}×${spec.height})`}
          >
            {/* iOS Dynamic Island */}
            {spec.chrome === 'dynamic-island' && (
              <div className="pg__dynamic-island" aria-hidden="true" />
            )}
            {/* AOS 상태바 */}
            {spec.chrome === 'statusbar' && (
              <div className="pg__phone-statusbar" aria-hidden="true" />
            )}
            {/* Web뷰 브라우저 크롬 */}
            {spec.chrome === 'browser' && (
              <div className="pg__browser-bar" aria-hidden="true">
                <div className="pg__browser-dots">
                  <span className="pg__browser-dot" style={{ background: '#ff5f57' }} />
                  <span className="pg__browser-dot" style={{ background: '#febc2e' }} />
                  <span className="pg__browser-dot" style={{ background: '#28c840' }} />
                </div>
                <div className="pg__browser-url">prototype.html</div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              className="pg__iframe"
              title={`Prototype ${variants[activeIdx]?.label} — ${spec.device}`}
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
