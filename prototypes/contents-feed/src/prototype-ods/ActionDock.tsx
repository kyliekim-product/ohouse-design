import type { ReactNode } from 'react';

interface ActionDockProps {
  pattern: 'single' | 'primary-secondary' | 'dual-primary' | 'custom';
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  children?: ReactNode;
}

export function ActionDock({
  pattern,
  primaryAction,
  secondaryAction,
  children,
}: ActionDockProps): JSX.Element {
  const content =
    pattern === 'custom' ? (
      <div style={{ width: '100%' }}>{children}</div>
    ) : pattern === 'primary-secondary' ? (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
          gap: 8,
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        <div style={{ gridColumn: 'span 3' }}>{secondaryAction ?? null}</div>
        <div style={{ gridColumn: 'span 7' }}>{primaryAction ?? null}</div>
      </div>
    ) : (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            pattern === 'single'
              ? 'minmax(0, 1fr)'
              : 'repeat(2, minmax(0, 1fr))',
          gap: 8,
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        {pattern === 'single' ? (
          primaryAction ?? null
        ) : (
          <>
            {secondaryAction ?? null}
            {primaryAction ?? null}
          </>
        )}
      </div>
    );

  return (
    <div
      style={{
        padding: '6px 16px calc(6px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(to top, transparent, var(--background))',
      }}
    >
      <div style={{ width: '100%' }}>{content}</div>
    </div>
  );
}
