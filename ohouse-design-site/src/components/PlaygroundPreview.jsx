// PlaygroundPreview — OS별 뷰포트 + 동적 스케일 + A/B/C 탭 + Copy/Download
// @missing-ods:playground-preview

import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_VARIANTS   = 3;
const VARIANT_LABELS = ['A', 'B', 'C'];
const DEFAULT_SCALE  = 0.85;   // 디폴트 최대 스케일
const MIN_SCALE      = 0.3;
const MAX_SCALE      = 1.5;
const ZOOM_STEP      = 0.05;
const WORKING_STATUSES = new Set(['understanding', 'retrieving', 'generating', 'rendering']);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

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
function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function NoteIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <path d="M4 2.5h6.6L13.5 5.4V14a1 1 0 01-1 1H4a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10.5 2.8V5a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5.5 8.2h5.5M5.5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
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

function AnnotationEditor({ draft, point, onChange, onSave, onCancel, onDelete }) {
  if (!draft || !point) return null;
  const isSaved = Boolean(draft.id);

  return (
    <div
      className="pg__annotation-editor"
      style={{ left: point.x, top: point.y }}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="pg__annotation-editor-head">
        <span>Annotation</span>
        <button className="pg__annotation-close" onClick={onCancel} aria-label="annotation 닫기">
          <CloseIcon />
        </button>
      </div>
      <textarea
        className="pg__annotation-textarea"
        value={draft.text}
        placeholder="Add an annotation"
        autoFocus
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            onSave();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
          }
        }}
      />
      <div className="pg__annotation-editor-actions">
        {isSaved && (
          <button className="pg__annotation-danger" onClick={onDelete}>삭제</button>
        )}
        <button className="pg__annotation-secondary" onClick={onCancel}>취소</button>
        <button className="pg__annotation-primary" onClick={onSave} disabled={!draft.text.trim()}>
          저장
        </button>
      </div>
    </div>
  );
}

function AnnotationLayer({
  active,
  annotations,
  draft,
  draftPoint,
  draggingId,
  onLayerClick,
  onMarkerPointerDown,
  onMarkerClick,
  onDraftChange,
  onDraftSave,
  onDraftCancel,
  onDraftDelete,
}) {
  return (
    <div
      className={`pg__annotation-layer${active ? ' pg__annotation-layer--active' : ''}`}
      onClick={onLayerClick}
      aria-hidden={!active && annotations.length === 0}
    >
      {annotations.map((annotation, index) => (
        <button
          key={annotation.id}
          className={`pg__annotation-marker${draggingId === annotation.id ? ' pg__annotation-marker--dragging' : ''}`}
          style={{ left: annotation.point.x, top: annotation.point.y }}
          onPointerDown={(event) => onMarkerPointerDown(event, annotation.id)}
          onClick={(event) => onMarkerClick(event, annotation.source)}
          aria-label={`annotation ${index + 1}: ${annotation.text || '내용 없음'}`}
          title={annotation.text}
        >
          {index + 1}
        </button>
      ))}
      <AnnotationEditor
        draft={draft}
        point={draftPoint}
        onChange={onDraftChange}
        onSave={onDraftSave}
        onCancel={onDraftCancel}
        onDelete={onDraftDelete}
      />
    </div>
  );
}

function PreviewStatus({ status, message, error, hasHtml }) {
  const isWorking = WORKING_STATUSES.has(status);
  const isError = status === 'error';
  if (!isWorking && !isError) return null;

  const title = isError
    ? '생성에 실패했어요'
    : status === 'rendering'
      ? 'Preview에 반영 중'
      : 'Prototype 생성 중';
  const body = error || message || '잠시만 기다려주세요.';

  return (
    <div className={`pg__preview-status${hasHtml ? ' pg__preview-status--overlay' : ''}`} role="status" aria-live="polite">
      <div className="pg__preview-status-graphic" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="pg__preview-status-text">
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────
export default function PlaygroundPreview({
  html,
  htmls,
  variantItems,
  activeVariantId,
  status = 'idle',
  statusMessage = '',
  error = null,
  onActiveVariantChange,
}) {
  const [variants, setVariants]     = useState([{ id: 'A', html: null, label: 'A' }]);
  const [activeIdx, setActiveIdx]   = useState(0);
  const [os, setOs]                 = useState('ios');
  const [scale, setScale]           = useState(DEFAULT_SCALE);
  const [userZoomed, setUserZoomed] = useState(false); // 수동 줌 여부
  const [toast, setToast]           = useState(null);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [draftAnnotation, setDraftAnnotation] = useState(null);
  const [cursorPos, setCursorPos] = useState(null);
  const [draggingAnnotationId, setDraggingAnnotationId] = useState(null);
  const [annotationBox, setAnnotationBox] = useState(null);

  const frameAreaRef  = useRef(null);
  const phoneRef      = useRef(null);
  const iframeRef     = useRef(null);
  const toastTimerRef = useRef(null);
  const dragStateRef  = useRef(null);

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
    setVariants(htmls.map((h, i) => ({
      id: VARIANT_LABELS[i] ?? String(i+1),
      html: h,
      label: VARIANT_LABELS[i] ?? String(i+1),
    })));
    setActiveIdx(0);
  }, [htmls]);

  useEffect(() => {
    if (!variantItems?.length) return;
    setVariants(variantItems.map((variant, i) => ({
      id: variant.id ?? VARIANT_LABELS[i] ?? String(i+1),
      html: variant.html,
      label: variant.id ?? variant.label ?? VARIANT_LABELS[i] ?? String(i+1),
      summary: variant.summary,
    })));
  }, [variantItems]);

  useEffect(() => {
    if (!activeVariantId) return;
    const idx = variants.findIndex((v) => v.id === activeVariantId);
    if (idx >= 0 && idx !== activeIdx) setActiveIdx(idx);
  }, [activeVariantId, variants]);

  const currentHtml = variants[activeIdx]?.html ?? null;
  const currentVariant = variants[activeIdx] ?? null;
  const currentVariantId = currentVariant?.id ?? currentVariant?.label ?? 'A';
  const currentAnnotations = annotations.filter((annotation) => annotation.variantId === currentVariantId);

  useEffect(() => {
    onActiveVariantChange?.(currentVariant);
  }, [currentVariant, onActiveVariantChange]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !currentHtml) return;
    iframe.srcdoc = currentHtml;
  }, [currentHtml]);

  const updateAnnotationBox = useCallback(() => {
    const frameRect = frameAreaRef.current?.getBoundingClientRect();
    const phoneRect = phoneRef.current?.getBoundingClientRect();
    if (!frameRect || !phoneRect) {
      setAnnotationBox(null);
      return;
    }
    setAnnotationBox({
      left: phoneRect.left - frameRect.left,
      top: phoneRect.top - frameRect.top,
      width: phoneRect.width,
      height: phoneRect.height,
      frameWidth: frameRect.width,
      frameHeight: frameRect.height,
    });
  }, []);

  useEffect(() => {
    updateAnnotationBox();
    const observer = new ResizeObserver(updateAnnotationBox);
    if (frameAreaRef.current) observer.observe(frameAreaRef.current);
    if (phoneRef.current) observer.observe(phoneRef.current);
    return () => observer.disconnect();
  }, [currentHtml, os, scale, updateAnnotationBox]);

  useEffect(() => {
    if (!annotationMode) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAnnotationMode(false);
        setDraftAnnotation(null);
        setCursorPos(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [annotationMode]);

  useEffect(() => {
    if (!draggingAnnotationId) return;

    const handlePointerMove = (event) => {
      const coords = getPhonePercent(event);
      if (!coords) return;
      dragStateRef.current = { ...(dragStateRef.current ?? {}), moved: true };
      setAnnotations((prev) =>
        prev.map((annotation) =>
          annotation.id === draggingAnnotationId
            ? { ...annotation, x: coords.x, y: coords.y }
            : annotation
        )
      );
    };

    const handlePointerUp = () => {
      setDraggingAnnotationId(null);
      window.setTimeout(() => {
        dragStateRef.current = null;
      }, 0);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingAnnotationId]);

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
    setVariants((prev) => [...prev, {
      id: VARIANT_LABELS[prev.length],
      html: null,
      label: VARIANT_LABELS[prev.length],
    }]);
    setActiveIdx(variants.length);
  };

  const getPhonePercent = (event, { requireInside = false } = {}) => {
    const rect = phoneRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const isInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (requireInside && !isInside) return null;
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
    };
  };

  const handleFrameMouseMove = (event) => {
    if (!annotationMode || !frameAreaRef.current) return;
    updateAnnotationBox();
    const rect = frameAreaRef.current.getBoundingClientRect();
    setCursorPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleAnnotationLayerClick = (event) => {
    if (!annotationMode) return;
    const coords = getPhonePercent(event, { requireInside: true });
    if (!coords) return;
    setDraftAnnotation({
      id: null,
      variantId: currentVariantId,
      x: coords.x,
      y: coords.y,
      text: '',
    });
    setAnnotationMode(false);
  };

  const handleAnnotationDraftChange = (text) => {
    setDraftAnnotation((draft) => draft ? { ...draft, text } : draft);
  };

  const handleAnnotationSave = () => {
    const draft = draftAnnotation;
    if (!draft?.text.trim()) return;
    if (draft.id) {
      setAnnotations((prev) =>
        prev.map((annotation) =>
          annotation.id === draft.id
            ? { ...annotation, text: draft.text.trim(), x: draft.x, y: draft.y }
            : annotation
        )
      );
    } else {
      setAnnotations((prev) => [
        ...prev,
        {
          id: `annotation-${Date.now()}`,
          variantId: draft.variantId,
          x: draft.x,
          y: draft.y,
          text: draft.text.trim(),
          createdAt: Date.now(),
        },
      ]);
    }
    setDraftAnnotation(null);
  };

  const handleAnnotationCancel = () => {
    setDraftAnnotation(null);
  };

  const handleAnnotationDelete = () => {
    const id = draftAnnotation?.id;
    if (!id) return;
    setAnnotations((prev) => prev.filter((annotation) => annotation.id !== id));
    setDraftAnnotation(null);
  };

  const handleMarkerPointerDown = (event, id) => {
    event.preventDefault();
    event.stopPropagation();
    dragStateRef.current = { id, moved: false };
    setDraggingAnnotationId(id);
  };

  const handleMarkerClick = (event, annotation) => {
    event.preventDefault();
    event.stopPropagation();
    if (dragStateRef.current?.moved) return;
    setDraftAnnotation({ ...annotation });
    setAnnotationMode(false);
  };

  const spec     = OS_SPECS[os];
  const hasAny   = variants.some((v) => v.html);
  const showAdd  = variants.length < MAX_VARIANTS && hasAny;
  const toFramePoint = (annotation) => {
    if (!annotationBox) return null;
    return {
      x: annotationBox.left + (annotationBox.width * annotation.x) / 100,
      y: annotationBox.top + (annotationBox.height * annotation.y) / 100,
    };
  };
  const toEditorPoint = (annotation) => {
    const point = toFramePoint(annotation);
    if (!point || !annotationBox) return null;
    return {
      x: clamp(point.x + 12, 16, Math.max(16, annotationBox.frameWidth - 292)),
      y: clamp(point.y - 20, 16, Math.max(16, annotationBox.frameHeight - 190)),
    };
  };
  const displayAnnotations = currentAnnotations.flatMap((annotation) => {
    const point = toFramePoint(annotation);
    if (!point) return [];
    return [{ ...annotation, point, source: annotation }];
  });
  const draftPoint = draftAnnotation ? toEditorPoint(draftAnnotation) : null;

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
      <div
        className={`pg__frame-area${annotationMode ? ' pg__frame-area--annotating' : ''}`}
        ref={frameAreaRef}
        role="region"
        aria-label="Prototype 미리보기"
        onMouseMove={handleFrameMouseMove}
        onMouseLeave={() => setCursorPos(null)}
      >

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
            ref={phoneRef}
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
          <PreviewStatus status={status} message={statusMessage} error={error} hasHtml={false} />
        )}
        {!currentHtml && !WORKING_STATUSES.has(status) && status !== 'error' && (
          <div className="pg__preview-empty" aria-label="프리뷰 없음">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="12" y="6" width="24" height="36" rx="4" stroke="currentColor" strokeWidth="2"/>
              <circle cx="24" cy="38" r="2" fill="currentColor"/>
              <rect x="18" y="12" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="16" y="17" width="16" height="2" rx="1" fill="currentColor"/>
              <rect x="16" y="22" width="10" height="2" rx="1" fill="currentColor"/>
            </svg>
            <p>왼쪽 채팅에서 화면을 요청하면<br />여기에 표시됩니다</p>
          </div>
        )}
        {currentHtml && <PreviewStatus status={status} message={statusMessage} error={error} hasHtml />}
        {currentHtml && (
          <AnnotationLayer
            active={annotationMode || Boolean(draftAnnotation) || Boolean(draggingAnnotationId)}
            annotations={displayAnnotations}
            draft={draftAnnotation}
            draftPoint={draftPoint}
            draggingId={draggingAnnotationId}
            onLayerClick={handleAnnotationLayerClick}
            onMarkerPointerDown={handleMarkerPointerDown}
            onMarkerClick={handleMarkerClick}
            onDraftChange={handleAnnotationDraftChange}
            onDraftSave={handleAnnotationSave}
            onDraftCancel={handleAnnotationCancel}
            onDraftDelete={handleAnnotationDelete}
          />
        )}
        {currentHtml && (
          <button
            className={`pg__annotation-fab${annotationMode ? ' pg__annotation-fab--active' : ''}`}
            onClick={() => {
              setAnnotationMode((prev) => !prev);
              setDraftAnnotation(null);
            }}
            aria-pressed={annotationMode}
            aria-label={annotationMode ? 'annotation 추가 취소' : 'annotation 추가'}
          >
            {annotationMode ? <PlusIcon /> : <NoteIcon />}
          </button>
        )}
        {annotationMode && cursorPos && (
          <div
            className="pg__annotation-cursor"
            style={{ left: cursorPos.x, top: cursorPos.y }}
            aria-hidden="true"
          >
            <PlusIcon />
          </div>
        )}
      </div>

      {toast && <Toast msg={toast} />}
    </div>
  );
}
