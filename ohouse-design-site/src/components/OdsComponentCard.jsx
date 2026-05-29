import { Card, DesignSystemProvider, SquareBadge } from '@bucketplace/design-system';

export default function OdsComponentCard({ component, href, imageSrc }) {
  const aliases = component.aliases?.slice(0, 3).join(' · ') || component.id;

  return (
    <DesignSystemProvider>
      <Card asChild gap={10} className="ods-card" data-ods-card="true">
        <a href={href}>
          <Card.Media aspectRatio="16/9" className="ods-card__media">
            <img src={imageSrc} alt="" loading="lazy" />
          </Card.Media>
          <Card.Content padding={16} className="ods-card__content">
            <div className="ods-card__head">
              <span className="ods-card__title">{component.title}</span>
              <SquareBadge
                size="small"
                color={component.status === 'published' ? 'blue' : 'gray'}
                variant="subtle"
                className="ods-card__status"
              >
                <SquareBadge.Slot side="center">
                  <SquareBadge.Label>{component.status}</SquareBadge.Label>
                </SquareBadge.Slot>
              </SquareBadge>
            </div>
            {component.description && (
              <p className="ods-card__desc">{component.description}</p>
            )}
            <div className="ods-card__foot">
              <span>{aliases}</span>
              <span className="ods-card__cta">열기 →</span>
            </div>
          </Card.Content>
        </a>
      </Card>
    </DesignSystemProvider>
  );
}
