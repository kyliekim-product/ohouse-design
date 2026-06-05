import type { ReactNode } from 'react';
import { Text } from '@bucketplace/design-system';

interface BottomNavigationItem {
  key: string;
  label: ReactNode;
  icon: ReactNode;
  activeIcon?: ReactNode;
  badge?: ReactNode;
}

interface BottomNavigationProps {
  items: BottomNavigationItem[];
  activeKey: string;
  onChange?: (key: string) => void;
}

export function BottomNavigation({
  items,
  activeKey,
  onChange,
}: BottomNavigationProps): JSX.Element {
  return (
    <nav
      aria-label="Bottom navigation"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))`,
        minHeight: 54,
        background: 'var(--background)',
        borderTop: '0.5px solid var(--border)',
      }}
    >
      {items.map((item) => {
        const active = item.key === activeKey;

        return (
          <button
            key={item.key}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange?.(item.key)}
            style={{
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              color: 'var(--foreground)',
              opacity: active ? 1 : 0.56,
              display: 'grid',
              justifyItems: 'center',
              alignContent: 'center',
              gap: 2,
              minHeight: 54,
              padding: 0,
              cursor: onChange ? 'pointer' : 'default',
            }}
          >
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {active && item.activeIcon ? item.activeIcon : item.icon}
              {item.badge ? (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    display: 'inline-flex',
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </span>
            {typeof item.label === 'string' || typeof item.label === 'number' ? (
              <Text
                variant="detail10L14"
                weight={active ? 600 : 400}
                color="foreground"
                align="center"
                wrap="nowrap"
              >
                {item.label}
              </Text>
            ) : (
              item.label
            )}
          </button>
        );
      })}
    </nav>
  );
}
