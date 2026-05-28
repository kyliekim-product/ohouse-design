import { BoxButton, DesignSystemProvider } from '@bucketplace/design-system';

function BoxButtonPreview() {
  return (
    <div className="ods-web-preview__buttons">
      <BoxButton size="medium" variant="brand-solid">
        <BoxButton.Slot side="center">
          <BoxButton.Label>확인</BoxButton.Label>
        </BoxButton.Slot>
      </BoxButton>
    </div>
  );
}

export default function OdsWebPreview({ slug }) {
  return (
    <DesignSystemProvider>
      <div className="ods-web-preview" data-ods-preview={slug}>
        {slug === 'box-button' ? (
          <BoxButtonPreview />
        ) : (
          <div className="ods-web-preview__empty">Preview pending</div>
        )}
      </div>
    </DesignSystemProvider>
  );
}
