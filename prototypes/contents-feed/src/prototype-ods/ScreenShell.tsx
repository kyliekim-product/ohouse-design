import { useState } from 'react';
import type { ReactNode } from 'react';
import { PrototypeOverlayContext } from './usePrototypeOverlayContainer';

type OsChrome = 'ios' | 'android' | 'mobile-web' | 'none';

interface ScreenShellProps {
  topNavigation: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  osChrome?: OsChrome;
}

function renderStatusBar(osChrome: OsChrome): JSX.Element | null {
  if (osChrome === 'none' || osChrome === 'mobile-web') return null;

  if (osChrome === 'android') {
    return (
      <div
        aria-hidden
        style={{
          height: 24,
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--background)',
          color: 'var(--foreground)',
          fontSize: 12,
          lineHeight: '16px',
          fontWeight: 500,
        }}
      >
        <span>9:41</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: 'currentColor',
              opacity: 0.4,
            }}
          />
          <span
            style={{
              width: 12,
              height: 8,
              borderRadius: 999,
              background: 'currentColor',
              opacity: 0.64,
            }}
          />
          <span
            style={{
              width: 16,
              height: 8,
              borderRadius: 999,
              background: 'currentColor',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={{
        padding: '12px 24px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 600,
      }}
    >
      <span>9:41</span>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span
          style={{
            width: 18,
            height: 10,
            borderRadius: 999,
            background: 'currentColor',
            opacity: 0.4,
          }}
        />
        <span
          style={{
            width: 14,
            height: 10,
            borderRadius: 999,
            background: 'currentColor',
            opacity: 0.64,
          }}
        />
        <span
          style={{
            width: 24,
            height: 10,
            borderRadius: 999,
            background: 'currentColor',
          }}
        />
      </div>
    </div>
  );
}

function renderBottomChrome(osChrome: OsChrome): JSX.Element | null {
  if (osChrome === 'none' || osChrome === 'mobile-web') return null;

  if (osChrome === 'android') {
    return (
      <div
        aria-hidden
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          background: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            border: '1.5px solid currentColor',
            opacity: 0.48,
          }}
        />
        <span
          style={{
            width: 16,
            height: 16,
            border: '1.5px solid currentColor',
            opacity: 0.64,
          }}
        />
        <span
          style={{
            width: 16,
            height: 12,
            borderRadius: 2,
            background: 'currentColor',
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={{
        height: 34,
        display: 'grid',
        alignItems: 'end',
        justifyItems: 'center',
        paddingBottom: 8,
        background: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <span
        style={{
          width: 134,
          height: 5,
          borderRadius: 999,
          background: 'currentColor',
          opacity: 0.24,
        }}
      />
    </div>
  );
}

export function ScreenShell({
  topNavigation,
  footer,
  children,
  osChrome = 'ios',
}: ScreenShellProps): JSX.Element {
  const [overlayContainer, setOverlayContainer] = useState<HTMLElement | null>(
    null,
  );

  return (
    <PrototypeOverlayContext.Provider value={overlayContainer}>
      <div
        style={{
          height: '100dvh',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          overflow: 'hidden',
          background:
            'color-mix(in srgb, var(--foreground, CanvasText) 8%, var(--background, Canvas))',
        }}
      >
        <div
          style={{
            width: 'min(375px, 100vw)',
            minWidth: 'min(320px, 100vw)',
            maxWidth: 'min(639px, 100vw)',
            height: '100dvh',
            position: 'relative',
            display: 'grid',
            gridTemplateRows: 'auto auto minmax(0, 1fr) auto auto',
            resize: 'horizontal',
            overflow: 'hidden',
            background: 'var(--background, Canvas)',
            color: 'var(--foreground, CanvasText)',
            transform: 'translateZ(0)',
          }}
        >
          {renderStatusBar(osChrome)}
          <header>{topNavigation}</header>
          <main
            style={{
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehaviorY: 'contain',
            }}
          >
            {children}
          </main>
          {footer ? (
            <footer style={{ display: 'flex', flexDirection: 'column' }}>
              {footer}
            </footer>
          ) : null}
          {renderBottomChrome(osChrome)}
          <div
            id="prototype-overlay-root"
            ref={setOverlayContainer}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          />
        </div>
      </div>
    </PrototypeOverlayContext.Provider>
  );
}
