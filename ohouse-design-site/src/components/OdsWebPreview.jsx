import { BoxButton, DesignSystemProvider } from '@bucketplace/design-system';

const BOX_BUTTON_PROP_KEYS = new Set(['size', 'variant', 'disabled', 'loading']);

function pickProps(props, allowedKeys) {
  if (!props || typeof props !== 'object') return {};
  return Object.fromEntries(
    Object.entries(props).filter(([key, value]) => allowedKeys.has(key) && value !== undefined && value !== null),
  );
}

function BoxButtonPreview({ preview }) {
  const props = pickProps(preview.props, BOX_BUTTON_PROP_KEYS);
  const label = preview.slots?.center?.label || 'Button';

  return (
    <div className="ods-web-preview__buttons">
      <BoxButton {...props}>
        <BoxButton.Slot side="center">
          <BoxButton.Label>{label}</BoxButton.Label>
        </BoxButton.Slot>
      </BoxButton>
    </div>
  );
}

const previewRenderers = {
  BoxButton: BoxButtonPreview,
};

function PreviewContent({ preview }) {
  if (!preview) {
    return <div className="ods-web-preview__empty">Preview pending</div>;
  }

  const Renderer = previewRenderers[preview.renderer];
  if (!Renderer) {
    return <div className="ods-web-preview__empty">Preview unavailable</div>;
  }

  return <Renderer preview={preview} />;
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
