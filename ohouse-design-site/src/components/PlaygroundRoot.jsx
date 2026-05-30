// PlaygroundRoot — Chat과 Preview를 연결하는 상태 허브
// html 상태를 두 컴포넌트 사이에서 공유

import { useState } from 'react';
import PlaygroundChat from './PlaygroundChat.jsx';
import PlaygroundPreview from './PlaygroundPreview.jsx';

export default function PlaygroundRoot({ hasServerKey }) {
  // 생성된 HTML — Chat에서 생성, Preview에서 렌더링
  const [generatedHtml, setGeneratedHtml] = useState(null);

  return (
    <div className="pg">
      <PlaygroundChat
        onHtmlGenerated={setGeneratedHtml}
        hasServerKey={hasServerKey}
      />
      <PlaygroundPreview html={generatedHtml} />
    </div>
  );
}
