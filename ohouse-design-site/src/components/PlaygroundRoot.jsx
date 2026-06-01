// PlaygroundRoot — Chat과 Preview를 연결하는 상태 허브
// html: 단일 prototype | htmls: A/B/C 다중 variants

import { useState, useCallback, useRef, useEffect } from 'react';
import PlaygroundChat from './PlaygroundChat.jsx';
import PlaygroundPreview from './PlaygroundPreview.jsx';
import { mergeTargetVariantHtml } from '../lib/variant-merge.js';

const VARIANT_LABELS = ['A', 'B', 'C'];

export default function PlaygroundRoot({ hasServerKey }) {
  const [variants, setVariants] = useState([{ id: 'A', html: null, label: 'A' }]);
  const [activeVariantId, setActiveVariantId] = useState('A');
  const activeVariantIdRef = useRef(activeVariantId);
  useEffect(() => { activeVariantIdRef.current = activeVariantId; }, [activeVariantId]);
  const [previewStatus, setPreviewStatus] = useState('idle');
  const [previewStatusMessage, setPreviewStatusMessage] = useState('');
  const [previewError, setPreviewError] = useState(null);

  // Chat → Preview 브릿지
  // html: 단일 prototype (partial 포함), htmls: A/B/C 완성 배열
  const handleHtmlGenerated = useCallback((html, _htmls, variantItems, targetVariantId) => {
    setPreviewError(null);
    if (variantItems?.length) {
      setVariants(variantItems.map((v, i) => ({
        id: v.id ?? VARIANT_LABELS[i] ?? String(i + 1),
        html: v.html,
        label: v.id ?? v.label ?? VARIANT_LABELS[i] ?? String(i + 1),
        summary: v.summary,
      })));
      setActiveVariantId(variantItems[0]?.id ?? 'A');
    } else if (html && targetVariantId) {
      setVariants((prev) => mergeTargetVariantHtml(prev, targetVariantId, html));
    } else if (html) {
      setVariants((prev) => mergeTargetVariantHtml(prev, activeVariantIdRef.current, html));
    }
  }, []);

  const handlePreviewStatus = useCallback((stage, message) => {
    setPreviewStatus(stage);
    setPreviewStatusMessage(message || '');
    if (stage !== 'error') setPreviewError(null);
  }, []);

  const handlePreviewError = useCallback((message) => {
    setPreviewStatus('error');
    setPreviewError(message);
  }, []);

  const handleOptimisticTabSwitch = useCallback((targetId) => {
    setActiveVariantId(targetId);
  }, []);

  const handleActiveVariantChange = useCallback((variant) => {
    if (!variant) return;
    setActiveVariantId(variant.id ?? variant.label ?? 'A');
  }, []);

  return (
    <div className="pg">
      <PlaygroundChat
        onHtmlGenerated={handleHtmlGenerated}
        onPreviewStatus={handlePreviewStatus}
        onPreviewError={handlePreviewError}
        variants={variants}
        activeVariantId={activeVariantId}
        onOptimisticTabSwitch={handleOptimisticTabSwitch}
        hasServerKey={hasServerKey}
      />
      <PlaygroundPreview
        variantItems={variants}
        activeVariantId={activeVariantId}
        status={previewStatus}
        statusMessage={previewStatusMessage}
        error={previewError}
        onActiveVariantChange={handleActiveVariantChange}
      />
    </div>
  );
}
