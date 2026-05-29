import { DesignSystemProvider } from '@bucketplace/design-system';
import { previewRenderers } from './ods-preview/registry.js';

function PreviewContent({ preview }) {
  if (!preview) {
    return <div className="ods-web-preview__empty">Preview pending</div>;
  }

  const renderer = previewRenderers[preview.renderer];
  if (!renderer) {
    return <div className="ods-web-preview__empty">Preview unavailable</div>;
  }

  return renderer.render(preview);
}

export default function OdsWebPreview({ slug, preview }) {
  return (
    <DesignSystemProvider>
      <div className="ods-web-preview" data-ods-preview={slug}>
        <PreviewContent preview={preview} />
      </div>
    </DesignSystemProvider>
  );
}
