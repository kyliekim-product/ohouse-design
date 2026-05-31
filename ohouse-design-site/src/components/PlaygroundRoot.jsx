// PlaygroundRoot — Chat과 Preview를 연결하는 상태 허브
// html: 단일 prototype | htmls: A/B/C 다중 variants

import { useState, useCallback } from 'react';
import PlaygroundChat from './PlaygroundChat.jsx';
import PlaygroundPreview from './PlaygroundPreview.jsx';

export default function PlaygroundRoot({ hasServerKey }) {
  const [generatedHtml, setGeneratedHtml] = useState(null);   // 단일
  const [generatedHtmls, setGeneratedHtmls] = useState(null); // A/B 배열
  const [generatedVariants, setGeneratedVariants] = useState(null);
  const [currentHtml, setCurrentHtml] = useState(null);
  const [currentVariantId, setCurrentVariantId] = useState('A');
  const [previewStatus, setPreviewStatus] = useState('idle');
  const [previewStatusMessage, setPreviewStatusMessage] = useState('');
  const [previewError, setPreviewError] = useState(null);

  // Chat → Preview 브릿지
  // html: 단일 prototype (partial 포함), htmls: A/B/C 완성 배열
  const handleHtmlGenerated = useCallback((html, htmls, variants) => {
    setPreviewError(null);
    if (variants?.length) {
      setGeneratedVariants(variants);
      setGeneratedHtmls(null);
      setGeneratedHtml(null);
      setCurrentHtml(variants[0]?.html ?? null);
      setCurrentVariantId(variants[0]?.id ?? 'A');
    } else if (htmls) {
      setGeneratedVariants(null);
      setGeneratedHtmls(htmls);
      setGeneratedHtml(null);
      setCurrentHtml(htmls[0] ?? null);
      setCurrentVariantId('A');
    } else if (html) {
      setGeneratedVariants(null);
      setGeneratedHtml(html);
      setGeneratedHtmls(null);
      setCurrentHtml(html);
      setCurrentVariantId('A');
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

  const handleActiveVariantChange = useCallback((variant) => {
    if (!variant) return;
    setCurrentVariantId(variant.id ?? variant.label ?? 'A');
    setCurrentHtml(variant.html ?? null);
  }, []);

  return (
    <div className="pg">
      <PlaygroundChat
        onHtmlGenerated={handleHtmlGenerated}
        onPreviewStatus={handlePreviewStatus}
        onPreviewError={handlePreviewError}
        currentHtml={currentHtml}
        currentVariantId={currentVariantId}
        hasServerKey={hasServerKey}
      />
      <PlaygroundPreview
        html={generatedHtml}
        htmls={generatedHtmls}
        variantItems={generatedVariants}
        status={previewStatus}
        statusMessage={previewStatusMessage}
        error={previewError}
        onActiveVariantChange={handleActiveVariantChange}
      />
    </div>
  );
}
