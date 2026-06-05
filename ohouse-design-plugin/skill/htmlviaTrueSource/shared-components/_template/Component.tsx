// {ComponentName} — 공통 컴포넌트 후보 (ODS 미보유 신규 패턴)
// 규칙: 색은 LIGHT_THEME.colors.*, 타이포는 ODS textStyle, 아이콘/에셋은 @bucketplace/icons·assets.
// raw hex/px 는 ODS 미매칭분만 허용하고 반드시 사유 주석.
import React from 'react';
import { LIGHT_THEME } from '@bucketplace/design-system';
// import { Text, BoxButton } from '@bucketplace/design-system';
// import { IconStarFilled } from '@bucketplace/icons';

export interface ComponentProps {
  /** TODO: props 정의 (variant/size/state 등 ODS 컨벤션 따름) */
  variant?: 'default';
}

export function Component({ variant = 'default' }: ComponentProps) {
  const c = LIGHT_THEME.colors;
  return (
    <div
      style={{
        // 예시: ODS 토큰 사용
        color: c.foreground,
        background: c.backgroundElevated,
        // radius/spacing 은 ODS 미보유 → raw 허용 + 사유
        borderRadius: 12, // ODS radius semantic 없음
      }}
      data-variant={variant}
    >
      {/* TODO: 구현 */}
    </div>
  );
}

export default Component;
