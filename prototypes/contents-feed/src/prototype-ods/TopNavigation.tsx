import { Text } from '@bucketplace/design-system';
import type { ComponentType, ReactNode } from 'react';

type TopNavigationIconComponent = ComponentType<any>;

interface TopNavigationProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  centerWidth?: 'rigid' | 'fluid';
}

interface TopNavigationIconButtonProps {
  icon: TopNavigationIconComponent;
  'aria-label': string;
  onClick?: () => void;
  disabled?: boolean;
  adornment?: ReactNode;
  iconProps?: Record<string, unknown>;
}

function renderCenterContent(center: ReactNode): ReactNode {
  if (typeof center === 'string' || typeof center === 'number') {
    return (
      <span style={{ display: 'block', minWidth: 0 }}>
        <Text
          variant="body16L20"
          weight={700}
          color="foreground"
          align="center"
          wrap="nowrap"
          truncate
        >
          {center}
        </Text>
      </span>
    );
  }

  return center;
}

function TopNavigationRoot({
  left,
  center,
  right,
  centerWidth = 'rigid',
}: TopNavigationProps): JSX.Element {
  const leftStyle =
    centerWidth === 'fluid'
      ? { flex: '0 0 auto' }
      : { flex: '1 1 0', minWidth: 0 };
  const centerStyle =
    centerWidth === 'fluid'
      ? { flex: '1 1 0', minWidth: 0 }
      : { flex: '0 0 auto', minWidth: 0 };
  const rightStyle =
    centerWidth === 'fluid'
      ? { flex: '0 0 auto' }
      : {
          flex: '1 1 0',
          minWidth: 0,
          display: 'flex',
          justifyContent: 'flex-end',
        };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        minHeight: 44,
        padding: '0 16px',
        background: 'var(--background)',
      }}
    >
      <div style={{ ...leftStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
        {left ?? null}
      </div>
      <div
        style={{
          ...centerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {center != null ? renderCenterContent(center) : null}
      </div>
      <div
        style={{
          ...rightStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
        }}
      >
        {right ?? null}
      </div>
    </div>
  );
}

function TopNavigationIconButton({
  icon: Icon,
  adornment,
  disabled,
  iconProps,
  onClick,
  'aria-label': ariaLabel,
}: TopNavigationIconButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'relative',
        width: 24,
        height: 24,
        padding: 0,
        border: 'none',
        background: 'transparent',
        color: 'var(--foreground)',
        opacity: disabled ? 0.32 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
      }}
    >
      <Icon size={24} weight="regular" renderMode="monochrome" {...iconProps} />
      {adornment ? (
        <span
          style={{ position: 'absolute', top: -2, right: -2, display: 'inline-flex' }}
        >
          {adornment}
        </span>
      ) : null}
    </button>
  );
}

type TopNavigationCompound = typeof TopNavigationRoot & {
  IconButton: typeof TopNavigationIconButton;
};

export const TopNavigation = TopNavigationRoot as TopNavigationCompound;

TopNavigation.IconButton = TopNavigationIconButton;
