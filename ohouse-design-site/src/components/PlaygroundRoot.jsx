// PlaygroundRoot — Chat과 Preview를 연결하는 상태 허브
// html: 단일 prototype | htmls: A/B/C 다중 variants

import { useState, useCallback } from 'react';
import PlaygroundChat from './PlaygroundChat.jsx';
import PlaygroundPreview from './PlaygroundPreview.jsx';

export default function PlaygroundRoot({ hasServerKey }) {
  const [generatedHtml, setGeneratedHtml] = useState(null);   // 단일
  const [generatedHtmls, setGeneratedHtmls] = useState(null); // A/B 배열

  // Chat → Preview 브릿지
  // html: 단일 prototype (partial 포함), htmls: A/B/C 완성 배열
  const handleHtmlGenerated = useCallback((html, htmls) => {
    if (htmls) {
      setGeneratedHtmls(htmls);
      setGeneratedHtml(null);
    } else if (html) {
      setGeneratedHtml(html);
      setGeneratedHtmls(null);
    }
  }, []);

  return (
    <div className="pg">
      <PlaygroundChat
        onHtmlGenerated={handleHtmlGenerated}
        hasServerKey={hasServerKey}
      />
      <PlaygroundPreview
        html={generatedHtml}
        htmls={generatedHtmls}
      />
    </div>
  );
}
