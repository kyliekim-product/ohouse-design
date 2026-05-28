import { DesignSystemProvider, SquareBadge } from '@bucketplace/design-system';

export default function OdsComponentMetaBadges({ status, id }) {
  return (
    <DesignSystemProvider>
      <div className="ods-component-meta">
        <SquareBadge
          size="medium"
          color={status === 'published' ? 'blue' : 'gray'}
          variant="subtle"
          className="ods-component-meta__badge"
        >
          <SquareBadge.Slot side="center">
            <SquareBadge.Label>{status}</SquareBadge.Label>
          </SquareBadge.Slot>
        </SquareBadge>
        <SquareBadge size="medium" color="gray" variant="subtle" className="ods-component-meta__badge">
          <SquareBadge.Slot side="center">
            <SquareBadge.Label>{id}</SquareBadge.Label>
          </SquareBadge.Slot>
        </SquareBadge>
      </div>
    </DesignSystemProvider>
  );
}
