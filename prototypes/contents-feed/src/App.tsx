/**
 * Pilot Test — 피드 한 판 (Phase 1)
 *
 * Figma 실측 (Workflow_Test, file Rhq24yUSskcByKWlASloRe):
 *   - 1:12604 (전체 화면) — Top + 6 Section + Interest Feed Module
 *   - 1:12606 (Top) — SearchField + Plain Tab + Filter Chip
 *   - 1:12608 (Section 1) — Portrait Card HScroll
 *   - 1:12609 (Section 2) — Landscape Card HScroll (Section/Interest Project/.HScroll)
 *
 * Phase 1 범위: Top + Section 1 + Section 2
 * Phase 2 (다음): Section 3~6 + Interest Feed Module
 *
 * 트랙 Context MD 참조:
 *   - sections/recommended-project-section.md
 *   - modules/hscroll.md
 *   - components/author-info.md §3.1
 *
 * ⚠️ Figma 실측 vs author-info.md §3.1 미스매치 5건 발견 → §7 신규 미확정 후보 추가:
 *   1. Avatar size: doc 24 vs Figma Portrait 18
 *   2. Overlay padding: doc 8 vs Figma 10
 *   3. Scrim opacity: doc 60% vs Figma 26%
 *   4. Scrap drop-shadow: doc 미명세 vs Figma 적용
 *   5. Portrait Card 도 Overlay 사용 (doc 은 Landscape 한정)
 *   → 디자이너 합의 전까지 Section 별로 Figma 실측값 사용. author-info.md 는 §7 후보로만.
 */

import {
  Avatar,
  Thumbnail,
  Text,
  ScrapButton,
  SearchField,
} from '@bucketplace/design-system';
import {
  IconPersonFilled,
  IconLine3Horizontal,
  IconBell,
  IconBookmark,
  IconCart,
  IconMagnifyingGlass,
  IconChevronDown,
  IconChevronRight,
  IconSliderHorizontal,
  IconHeartFilled,
  IconBookmarkFilled,
} from '@bucketplace/icons';
import { ScreenShell, TopNavigation } from './prototype-ods/index';
import { useState } from 'react';

// =====================================================
// 데이터 타입
// =====================================================

type Author = {
  nickname: string;
  avatarUrl?: string;
  isBlocked?: boolean;
};

type CardData = {
  id: string;
  thumbnailUrl: string;
  title: string;
  /** description (Portrait Card 의 Content 영역에 2줄까지 노출, Figma 1:12610 실측) */
  description?: string;
  /** Video duration label "00:24" 형태. 있으면 우측 상단 Square Badge 노출 */
  videoDuration?: string;
  author: Author;
  viewCount?: number;
  scrapCount?: number;
  reactionCount?: number; // ♥ count (Portrait Card 메타용 — Figma 실측)
  scrapped?: boolean;
};

// =====================================================
// 유틸
// =====================================================

function formatMan(n: number): string {
  if (n >= 10000) {
    const man = Math.floor(n / 1000) / 10;
    return man % 1 === 0 ? `${man}만` : `${man.toFixed(1)}만`;
  }
  return n.toLocaleString('ko-KR');
}

// =====================================================
// User Information Overlay
// → variant: 'landscape' (Avatar 24, padding 8, scrim 60%) 또는 'portrait' (Avatar 18, padding 10, scrim 26%)
// → Figma 실측 기반. author-info.md §7 미확정 후보로 등록됨
// =====================================================

function UserInformationOverlay({
  author,
  variant,
}: {
  author: Author;
  variant: 'landscape' | 'portrait';
}) {
  const isBlocked = !!author.isBlocked;
  const displayName = isBlocked ? '볼 수 없는 사용자' : author.nickname;

  const padding = variant === 'portrait' ? 10 : 8;
  const avatarSize = variant === 'portrait' ? 18 : 24;

  return (
    <div
      style={{
        position: 'absolute',
        left: padding,
        bottom: padding,
        display: 'flex',
        alignItems: 'center',
        gap: variant === 'portrait' ? 4 : 6,
        zIndex: 2,
      }}
    >
      <Avatar
        size={avatarSize}
        src={isBlocked ? undefined : author.avatarUrl}
        placeholderIcon={IconPersonFilled as any}
        alt={displayName}
      />
      <Text
        variant="detail12L16"
        weight={500}
        color="foregroundInverse"
        truncate
        asProps={{ style: { maxWidth: 64, flexShrink: 0 } }}
      >
        {displayName}
      </Text>
    </div>
  );
}

// =====================================================
// Scrim 레이어 — variant 별 다른 opacity
// =====================================================

function CardScrim({ variant }: { variant: 'landscape' | 'portrait' }) {
  // Landscape: 60% → 0% bottom-up (author-info.md §3.1)
  // Portrait : 26% → 0% from 71% (Figma 1:12608 실측)
  const gradient =
    variant === 'portrait'
      ? 'linear-gradient(to top, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0) 71%)'
      : 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))';

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: variant === 'portrait' ? '100%' : '50%',
        background: gradient,
        pointerEvents: 'none',
        zIndex: 1,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
      }}
    />
  );
}

// =====================================================
// Card.Media overlay 우측 하단 ScrapButton (drop-shadow 포함)
// → Figma 1:12608 실측 (drop-shadow 0px 4px 5px rgba(0,0,0,0.12))
// =====================================================

function MediaScrapButton({
  selected,
  onClick,
  padding,
}: {
  selected?: boolean;
  onClick?: () => void;
  padding: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        right: padding,
        bottom: padding,
        zIndex: 2,
        filter: 'drop-shadow(0px 4px 5px rgba(0,0,0,0.12))',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <ScrapButton selected={!!selected} variant="media" aria-label="스크랩" />
    </div>
  );
}

// =====================================================
// Layer 3-A: Contents Landscape Card (3:2)
// Section 2 (Figma 1:12609) 에서 사용
// =====================================================

function ContentsLandscapeCard({
  card,
  onClickCard,
  onToggleScrap,
}: {
  card: CardData;
  onClickCard?: (id: string) => void;
  onToggleScrap?: (id: string) => void;
}) {
  return (
    <article
      onClick={() => onClickCard?.(card.id)}
      style={{ width: 284, flexShrink: 0, cursor: 'pointer' }}
    >
      <div style={{ position: 'relative' }}>
        <Thumbnail
          src={card.thumbnailUrl}
          ratio={3 / 2}
          radius="small"
          alt=""
          objectFit="cover"
        />
        <CardScrim variant="landscape" />
        <UserInformationOverlay author={card.author} variant="landscape" />
        <MediaScrapButton
          selected={card.scrapped}
          onClick={() => onToggleScrap?.(card.id)}
          padding={8}
        />
      </div>

      <div style={{ paddingTop: 10, paddingRight: 10 }}>
        <p
          style={{
            margin: 0,
            fontFamily:
              'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 14,
            lineHeight: '18px',
            letterSpacing: '-0.3px',
            color: 'var(--foreground, #141414)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'keep-all',
          }}
        >
          {card.title}
        </p>

        {(!!card.viewCount || !!card.scrapCount) && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
            {!!card.viewCount && (
              <Text variant="detail12L16" color="foregroundWeak">
                조회 {formatMan(card.viewCount)}
              </Text>
            )}
            {!!card.viewCount && !!card.scrapCount && (
              <Text variant="detail12L16" color="foregroundWeak" asProps={{ 'aria-hidden': true }}>
                ·
              </Text>
            )}
            {!!card.scrapCount && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  color: '#8C8C8C',
                }}
              >
                <IconBookmarkFilled
                  size={12}
                  color="#8C8C8C"
                  fill="#8C8C8C"
                  renderMode="monochrome"
                  weight="regular"
                  style={{ color: '#8C8C8C', flexShrink: 0 }}
                  {...({} as any)}
                />
                <Text variant="detail12L16" color="foregroundWeak">
                  {formatMan(card.scrapCount)}
                </Text>
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// =====================================================
// Layer 3-B: Contents Portrait Overlay Card (3:4)
// Section 1 (Figma 1:12608) 에서 사용
// → Figma 실측 컴포넌트 이름 = "Contents Portrait Card/Common/Media/.Thumbnail Accessory"
// → User Information 좌측 하단 + ScrapButton 우측 하단 (둘 다 padding 10)
// → Avatar 18, scrim 26%, drop-shadow on Scrap
// =====================================================

function ContentsPortraitOverlayCard({
  card,
  // 375 - 좌패딩 16 - gap 6×2 = 347 → 2.5장 노출 → 카드 폭 ≈ 138.8px (Figma 1:12608 기준)
  width = 138,
  onClickCard,
  onToggleScrap,
}: {
  card: CardData;
  width?: number;
  onClickCard?: (id: string) => void;
  onToggleScrap?: (id: string) => void;
}) {
  return (
    <article
      onClick={() => onClickCard?.(card.id)}
      style={{ width, flexShrink: 0, cursor: 'pointer' }}
    >
      <div style={{ position: 'relative' }}>
        <Thumbnail
          src={card.thumbnailUrl}
          ratio={3 / 4}
          radius="small"
          alt=""
          objectFit="cover"
        />
        <CardScrim variant="portrait" />
        <UserInformationOverlay author={card.author} variant="portrait" />
        <MediaScrapButton
          selected={card.scrapped}
          onClick={() => onToggleScrap?.(card.id)}
          padding={10}
        />

        {/*
          Square Badge — Video duration label (Figma 1:12610 실측)
          ODS SquareBadge variant 매핑이 system/dim-darken 과 직접 안 맞아 트랙 스타일로 직접
          (bg rgba(33,38,41,0.8), height 16, top 8 right 8, text 10 SemiBold white)
        */}
        {!!card.videoDuration && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 16,
              padding: '3px 4px',
              background: 'rgba(33,38,41,0.8)',
              borderRadius: 4,
            }}
          >
            <Text
              variant="detail10L14"
              weight={600}
              color="foregroundInverse"
              asProps={{ style: { whiteSpace: 'nowrap' } }}
            >
              {card.videoDuration}
            </Text>
          </div>
        )}
      </div>

      {/*
        Content 슬롯 — Figma 1:12608/1:12610 실측 결과 Portrait Card 도 Content 영역 보유
        - description 있을 때 2줄 truncate (Figma 1:12610 본문 lorem 패턴)
        - 없으면 title 표시 (Section 1 패턴)
        author-info.md §3.1 미스매치 — §7 미확정 후보 등록됨

        ⚠️ ODS Text 의 truncate={{ lines: 2 }} 가 webkit-line-clamp 적용 안 되는 듯
        → asProps style 로 직접 라인 클램프 강제
      */}
      <div style={{ paddingTop: 10 }}>
        {/*
          ODS Text 의 truncate prop 이 webkit-line-clamp 적용을 override 하는 듯
          → 직접 p 태그 + ODS 토큰 값 inline 적용으로 우회
          (Pretendard 14/18, foreground = #141414 light mode)
        */}
        <p
          style={{
            margin: 0,
            fontFamily:
              'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 14,
            lineHeight: '18px',
            letterSpacing: '-0.3px',
            color: 'var(--foreground, #141414)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'keep-all',
          }}
        >
          {card.description ?? card.title}
        </p>
        {!!card.reactionCount && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginTop: 4,
              color: '#8C8C8C',
            }}
          >
            {/*
              IconHeartFilled — ODS Icon prop 패턴 시도 모음
              (renderMode + weight + color + fill 모두 명시 — 어느 하나라도 적용되도록)
            */}
            <IconHeartFilled
              size={14}
              color="#8C8C8C"
              fill="#8C8C8C"
              renderMode="monochrome"
              weight="regular"
              style={{ color: '#8C8C8C', flexShrink: 0 }}
              {...({} as any)}
            />
            <Text variant="detail12L16" color="foregroundWeak">
              {formatMan(card.reactionCount)}
            </Text>
          </div>
        )}
      </div>
    </article>
  );
}

// =====================================================
// Layer 2: HScroll Module
// → modules/hscroll.md
// =====================================================

function HScrollModule({ children, gap = 6 }: { children: React.ReactNode; gap?: number }) {
  return (
    <div
      role="list"
      style={{
        display: 'flex',
        gap,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        paddingRight: 16, // 마지막 카드 우측 여백
      }}
    >
      {children}
    </div>
  );
}

// =====================================================
// Layer 1-A: Section · 추천 집들이 (Landscape HScroll)
// → sections/recommended-project-section.md
// → Figma 1:12609
// =====================================================

function SectionHeader({
  title,
  onClickMore,
}: {
  title: string;
  onClickMore?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text variant="heading18" weight={600} color="foreground">
        {title}
      </Text>
      {onClickMore && (
        <button
          type="button"
          aria-label={`${title} 더보기`}
          onClick={onClickMore}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--foreground, #141414)',
          }}
        >
          <IconChevronRight size={24} weight="regular" />
        </button>
      )}
    </div>
  );
}

function LandscapeProjectSection({
  title,
  cards,
  onClickCard,
  onToggleScrap,
  onClickMore,
}: {
  title: string;
  cards: CardData[];
  onClickCard?: (id: string) => void;
  onToggleScrap?: (id: string) => void;
  onClickMore?: () => void;
}) {
  return (
    <section data-section-id="landscape-project-section">
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <SectionHeader title={title} onClickMore={onClickMore} />
      </div>
      <div style={{ paddingLeft: 16 }}>
        <HScrollModule>
          {cards.map((card) => (
            <div role="listitem" key={card.id}>
              <ContentsLandscapeCard
                card={card}
                onClickCard={onClickCard}
                onToggleScrap={onToggleScrap}
              />
            </div>
          ))}
        </HScrollModule>
      </div>
    </section>
  );
}

// =====================================================
// Layer 1-B: Section · Portrait HScroll
// → Figma 1:12608
// =====================================================

function PortraitProjectSection({
  title,
  cards,
  onClickCard,
  onToggleScrap,
  onClickMore,
}: {
  title: string;
  cards: CardData[];
  onClickCard?: (id: string) => void;
  onToggleScrap?: (id: string) => void;
  onClickMore?: () => void;
}) {
  return (
    <section data-section-id="portrait-project-section">
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <SectionHeader title={title} onClickMore={onClickMore} />
      </div>
      <div style={{ paddingLeft: 16 }}>
        <HScrollModule>
          {cards.map((card) => (
            <div role="listitem" key={card.id}>
              <ContentsPortraitOverlayCard
                card={card}
                onClickCard={onClickCard}
                onToggleScrap={onToggleScrap}
              />
            </div>
          ))}
        </HScrollModule>
      </div>
    </section>
  );
}

// =====================================================
// Top Area Sub-components — Tab + Filter
// → Figma 1:12606 내부 (Contents Plain Tab + Contents Filter)
// =====================================================

// =====================================================
// Contents Plain Tab — 트랙 컴포넌트 (NOT ODS Tab)
// → components/contents-plain-tab.md
// → ODS Tab 은 active item 아래 underline 자동 추가. Plain Tab 은 underline 없음.
// =====================================================

function ContentsPlainTab({
  active,
  onChange,
}: {
  active: string;
  onChange: (v: string) => void;
}) {
  const items: Array<{ value: string; label: string }> = [
    { value: 'recommend', label: '추천' },
    { value: 'community', label: '커뮤니티' },
    { value: 'shorts', label: '쇼츠' },
  ];
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 6,
        padding: '10px 16px 0',
        background: 'var(--background)',
      }}
    >
      {items.map((it) => {
        const isActive = it.value === active;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(it.value)}
            style={{
              height: 44,
              padding: '0 4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            <Text
              variant="heading20"
              weight={isActive ? 600 : 500}
              color={isActive ? 'foreground' : 'foregroundWeak'}
            >
              {it.label}
            </Text>
          </button>
        );
      })}
    </div>
  );
}

// =====================================================
// Topic Chip — 트랙 컴포넌트 (NOT ODS Chip)
// → components/topic-chip.md
// → 보라 외곽선·텍스트·dot. 일반 ODS Chip 과 시각적으로 구분.
// =====================================================

const ACCENT_PURPLE = '#6F3DDE'; // purple.550 = accent-purple

function TopicChip({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 32,
        padding: '0 12px',
        background: 'white',
        border: `1px solid ${ACCENT_PURPLE}`,
        borderRadius: 50,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {/* 좌측 컬러 아이콘 — IconSliderHorizontal (조건 슬라이더 의미, Figma 1:12700 확정) */}
      <span
        aria-hidden
        style={{
          color: ACCENT_PURPLE,
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <IconSliderHorizontal size={16} weight="regular" />
      </span>
      <Text
        variant="body14L18"
        weight={400}
        asProps={{ style: { color: ACCENT_PURPLE, whiteSpace: 'nowrap' } }}
      >
        {label}
      </Text>
    </button>
  );
}

// =====================================================
// Filter Chip — 트랙 컴포넌트 (ODS Chip 의 size enum 이 디자인 사이즈와 매핑 안 됨)
// → Figma 실측: height 36, padding 12, 텍스트 14, 옵션 우측 chevron
// =====================================================

function FilterChip({
  label,
  hasDropdown,
  onClick,
}: {
  label: string;
  hasDropdown?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        height: 36,
        padding: '0 12px',
        background: 'white',
        border: '1px solid var(--border, #E0E0E0)',
        borderRadius: 50,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Text
        variant="body14L20"
        weight={400}
        color="foreground"
        asProps={{ style: { whiteSpace: 'nowrap' } }}
      >
        {label}
      </Text>
      {hasDropdown && (
        <span
          aria-hidden
          style={{ display: 'inline-flex', color: 'var(--foreground, #141414)' }}
        >
          <IconChevronDown size={16} weight="regular" />
        </span>
      )}
    </button>
  );
}

// =====================================================
// Contents Filter — 트랙 컴포넌트
// dim 레이어 + Topic Chip + divider + Filter Chip × N
// =====================================================

type FilterChipDef = { label: string; hasDropdown?: boolean };

function ContentsFilter() {
  const filters: FilterChipDef[] = [
    { label: '집들이' },
    { label: '공간', hasDropdown: true },
    { label: '평수', hasDropdown: true },
    { label: '주거형태', hasDropdown: true },
    { label: '컬러' },
  ];
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--background)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          padding: '8px 16px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {/* Topic Chip — 좌측 고정 */}
        <TopicChip label="내 조건 맞추기" />

        {/* Divider — 18×8 SVG 형태 (Figma 실측). 단순 div 로 더 두껍게 */}
        <span
          aria-hidden
          style={{
            width: 1,
            height: 18,
            background: 'var(--border, #E0E0E0)',
            flexShrink: 0,
            marginLeft: 4,
            marginRight: 4,
          }}
        />

        {filters.map((f) => (
          <FilterChip key={f.label} label={f.label} hasDropdown={f.hasDropdown} />
        ))}
      </div>
      {/* dim 레이어 — 좌측 56px (Topic Chip 가로 스크롤 시 가려지지 않게)
          단, Topic Chip 이 이미 dim 위에 그려지므로 시각 효과는 우측 fade out 정도로만 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 16,
          background:
            'linear-gradient(to left, var(--background, white), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// =====================================================
// Layer 1-C: Section · Legacy Interest Post (Figma 1:12610 실측 재구현)
// → sections/legacy-interest-post.md (draft)
//
// Section 1 (Portrait HScroll) 과 동일한 카드 형식 + 추가 요소:
//   - 헤더 아래 Topic Chip Row (러그/오븐/아르텍 등 — 카테고리 탐색)
//   - 카드 우측 상단 Square Badge (video duration "00:24")
//   - 카드 Content 영역에 description 2줄 (title 대신)
// =====================================================

function LegacyInterestPostSection({
  title,
  topics,
  cards,
  onClickCard,
  onToggleScrap,
  onClickMore,
}: {
  title: string;
  topics: string[];
  cards: CardData[];
  onClickCard?: (id: string) => void;
  onToggleScrap?: (id: string) => void;
  onClickMore?: () => void;
}) {
  return (
    <section data-section-id="legacy-interest-post">
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <SectionHeader title={title} onClickMore={onClickMore} />
      </div>

      {/* Topic Chip Row — 헤더 아래, 가로 스크롤. 첫 chip 은 active(검정) 변형 */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          padding: '0 16px',
          marginBottom: 10,
        }}
      >
        {topics.map((t, i) => (
          <button
            key={t}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 32,
              padding: '0 12px',
              background: i === 0 ? 'var(--foreground, #141414)' : 'white',
              border: `1px solid ${i === 0 ? 'var(--foreground, #141414)' : 'var(--border, #E0E0E0)'}`,
              borderRadius: 50,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Text
              variant="body14L18"
              weight={i === 0 ? 500 : 400}
              color={i === 0 ? 'foregroundInverse' : 'foreground'}
              asProps={{ style: { whiteSpace: 'nowrap' } }}
            >
              {t}
            </Text>
          </button>
        ))}
      </div>

      {/* Portrait HScroll — Section 1과 동일한 카드 컴포넌트 재사용 */}
      <div style={{ paddingLeft: 16 }}>
        <HScrollModule>
          {cards.map((card) => (
            <div role="listitem" key={card.id}>
              <ContentsPortraitOverlayCard
                card={card}
                onClickCard={onClickCard}
                onToggleScrap={onToggleScrap}
              />
            </div>
          ))}
        </HScrollModule>
      </div>
    </section>
  );
}

// =====================================================
// Module · Interest Feed (2열 무한 그리드)
// → modules/interest-feed.md (draft)
// → Figma 1:12614 design context 미수집 — grid gap 추정
// =====================================================

function InterestFeedModule({
  cards,
  onClickCard,
  onToggleScrap,
}: {
  cards: CardData[];
  onClickCard?: (id: string) => void;
  onToggleScrap?: (id: string) => void;
}) {
  return (
    <section
      data-module-id="interest-feed"
      style={{ padding: '0 16px' }}
    >
      <div style={{ marginBottom: 12 }}>
        <Text variant="heading18" weight={600} color="foreground">
          집구경 피드
        </Text>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8, // 카드 간 가로 gap (추정)
          rowGap: 24, // 카드 간 세로 gap (추정)
        }}
      >
        {cards.map((card) => (
          <article
            key={card.id}
            onClick={() => onClickCard?.(card.id)}
            style={{ cursor: 'pointer', minWidth: 0 }}
          >
            <div style={{ position: 'relative' }}>
              <Thumbnail
                src={card.thumbnailUrl}
                ratio={3 / 4}
                radius="small"
                alt=""
                objectFit="cover"
              />
              <CardScrim variant="portrait" />
              <UserInformationOverlay author={card.author} variant="portrait" />
              <MediaScrapButton
                selected={card.scrapped}
                onClick={() => onToggleScrap?.(card.id)}
                padding={10}
              />
            </div>
            <div style={{ paddingTop: 10 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily:
                    'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 14,
                  lineHeight: '18px',
                  letterSpacing: '-0.3px',
                  color: 'var(--foreground, #141414)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'keep-all',
                }}
              >
                {card.description ?? card.title}
              </p>
              {!!card.reactionCount && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    marginTop: 4,
                    color: '#8C8C8C',
                  }}
                >
                  <IconHeartFilled
                    size={14}
                    color="#8C8C8C"
                    fill="#8C8C8C"
                    renderMode="monochrome"
                    weight="regular"
                    style={{ color: '#8C8C8C', flexShrink: 0 }}
                    {...({} as any)}
                  />
                  <Text variant="detail12L16" color="foregroundWeak">
                    {formatMan(card.reactionCount)}
                  </Text>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// Demo Data
// =====================================================

const LANDSCAPE_CARDS: CardData[] = [
  {
    id: 'L1',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-L1/568/380',
    title: '80년대생 2bay 구축, 리모델링으로 우아하게 변신 성공',
    author: { nickname: 'jinsol_house', avatarUrl: 'https://i.pravatar.cc/48?u=jinsol' },
    viewCount: 46000,
    scrapCount: 1245,
  },
  {
    id: 'L2',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-L2/568/380',
    title: '디테일에는 이유가 있다! 32평 2bay 구축 리모델링',
    author: {
      nickname: 'very_long_nickname_should_truncate_to_64px',
      avatarUrl: 'https://i.pravatar.cc/48?u=minji',
    },
    viewCount: 32000,
    scrapped: true,
  },
  {
    id: 'L3',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-L3/568/380',
    title: '차단·탈퇴 작성자 케이스 — placeholder + "볼 수 없는 사용자"',
    author: { nickname: '__unused__', isBlocked: true },
    viewCount: 120,
  },
  {
    id: 'L4',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-L4/568/380',
    title: '미니멀 라이프 시작하기 — 가구 비우기 한달 챌린지',
    author: { nickname: 'minimal_kr', avatarUrl: 'https://i.pravatar.cc/48?u=minimal' },
    viewCount: 12400,
    scrapCount: 320,
  },
  {
    id: 'L5',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-L5/568/380',
    title: '1.5룸 신혼집, 수납으로만 꾸민 거실',
    author: { nickname: 'cozy_pair', avatarUrl: 'https://i.pravatar.cc/48?u=cozy' },
    viewCount: 8800,
    scrapCount: 451,
  },
];

const PORTRAIT_CARDS: CardData[] = [
  {
    id: 'P1',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-P1/372/496',
    title: '애정하는 것들로 쌓아가는, 20평 빈티지 하우스',
    author: { nickname: 'jinsol_house', avatarUrl: 'https://i.pravatar.cc/48?u=jinsol' },
    reactionCount: 23,
  },
  {
    id: 'P2',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-P2/372/496',
    title: '무인양품&우주 덕후 디자이너의 최애템 8 | 왓츠 인 마이...',
    author: { nickname: 'midcentury_kr', avatarUrl: 'https://i.pravatar.cc/48?u=midcentury' },
    reactionCount: 42,
    scrapped: true,
  },
  {
    id: 'P3',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-P3/372/496',
    title: '15평 빌라, 주방을 거실처럼 쓴 한 사람의 노하우',
    author: { nickname: 'kitchen_lover', avatarUrl: 'https://i.pravatar.cc/48?u=kitchen' },
    reactionCount: 156,
  },
  {
    id: 'P4',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-P4/372/496',
    title: '욕실 리뉴얼 후기 — 수전 교체부터 타일까지',
    author: { nickname: 'long_long_long_nickname_test', avatarUrl: 'https://i.pravatar.cc/48?u=bath' },
    reactionCount: 8,
  },
  {
    id: 'P5',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-P5/372/496',
    title: '차단·탈퇴 작성자 케이스',
    author: { nickname: '__blocked__', isBlocked: true },
    reactionCount: 3,
  },
];

// Section 3 (Legacy Interest Post) — Figma 1:12610 실측 패턴
// description 2줄 + video duration badge + heart count
const LEGACY_TOPICS = ['러그', '오븐', '아르텍', '이케아 선반', '전신거울'];

const LEGACY_CARDS: CardData[] = [
  {
    id: 'LG1',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-LG1/372/496',
    title: '',
    description: '좁은 싱크대 사이에서 공간을 더 넓게 쓰는 방법, 의외로 간단해요',
    videoDuration: '00:24',
    author: { nickname: 'jinsol_house', avatarUrl: 'https://i.pravatar.cc/48?u=lg1' },
    reactionCount: 23,
  },
  {
    id: 'LG2',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-LG2/372/496',
    title: '',
    description: '북유럽 스타일 침실, 조명 하나로 분위기를 완전히 바꾼 후기 공개',
    videoDuration: '00:24',
    author: { nickname: 'nordic_seoul', avatarUrl: 'https://i.pravatar.cc/48?u=lg2' },
    reactionCount: 23,
  },
  {
    id: 'LG3',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-LG3/372/496',
    title: '',
    description: '원룸 자취생을 위한 수납 가구 추천 — 좁은 공간에서도 깔끔하게',
    videoDuration: '01:12',
    author: { nickname: 'minimal_one_room', avatarUrl: 'https://i.pravatar.cc/48?u=lg3' },
    reactionCount: 156,
  },
  {
    id: 'LG4',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-LG4/372/496',
    title: '',
    description: '이케아 셔블링 선반 활용법, 거실에 두면 분위기가 확 살아요',
    author: { nickname: 'ikea_lover', avatarUrl: 'https://i.pravatar.cc/48?u=lg4' },
    reactionCount: 8,
  },
  {
    id: 'LG5',
    thumbnailUrl: 'https://picsum.photos/seed/ohouse-LG5/372/496',
    title: '',
    description: '전신거울 위치 잡기 — 스튜디오처럼 보이는 셀카 공간 만들기',
    videoDuration: '00:48',
    author: { nickname: 'mirror_kr', avatarUrl: 'https://i.pravatar.cc/48?u=lg5' },
    reactionCount: 42,
  },
];

// Section 5 (텍스트 큰 카드 형태 추정) — 일단 Portrait 재사용
const SECTION5_CARDS = PORTRAIT_CARDS.slice(0, 3);

// Interest Feed Module — 2열 무한 피드 (placeholder N장)
const INTEREST_FEED_CARDS: CardData[] = Array.from({ length: 12 }, (_, i) => ({
  id: `IF${i + 1}`,
  thumbnailUrl: `https://picsum.photos/seed/ohouse-IF${i + 1}/344/460`,
  title: [
    '거실 전체 리뉴얼 — 5년 만에 새 집',
    '주방 인테리어 비포애프터',
    '5평 베란다 정원 만들기',
    '아이 방 꾸미기 한달 일기',
    '신혼집 가구 쇼핑 리스트',
    '미니멀 라이프 한달 후기',
    '강아지 친화 인테리어',
    '북유럽 vs 미드센추리 비교',
    '서재 책상 셋업 공유',
    '욕실 수전 교체 DIY',
    '3평 드레스룸 만들기',
    '식물 키우기 좋은 집 인테리어',
  ][i],
  author: {
    nickname: ['jinsol_house', 'cozy_pair', 'minimal_kr', 'nordic_seoul'][i % 4],
    avatarUrl: `https://i.pravatar.cc/48?u=if${i + 1}`,
  },
  viewCount: Math.floor(Math.random() * 50000) + 1000,
  scrapCount: Math.floor(Math.random() * 2000) + 50,
  reactionCount: Math.floor(Math.random() * 200) + 5,
  scrapped: i % 5 === 0,
}));

// =====================================================
// App — Screen 한 판 (Phase 1)
// =====================================================

// =====================================================
// 단계별 비교 데모 — 한 페이지에서 1차/2차/3차 결과 비교
// 사용자 피드백 (4/27): "테스트 안이 탭으로 나누어져 한 페이지에서 비교"
// =====================================================

type Stage = '1' | '2' | '3a' | '3b';

const STAGE_META: Record<
  Stage,
  {
    date: string;
    scope: string;
    input: string;
    layers: string;
    output: string;
    finding: string;
  }
> = {
  '1': {
    date: '2026-04-23',
    scope: '단일 모듈 (Landscape Card 1개)',
    input: 'Figma (raw, 정리 전) · 노드 ID 기반 직접 조회',
    layers: '✅ Figma MCP   ✅ 트랙 Context MD   ❌ ODS MCP   ❌ O!Slice 플러그인',
    output: 'HTML (가짜 ODS — styled div)',
    finding: '동작·정책 규칙 OK · 그러나 ODS API 정합성 검증 불가, 트랙 Context MD 거짓 발견 불가',
  },
  '2': {
    date: '2026-04-24',
    scope: '단일 컴포넌트 (Landscape Card 1개)',
    input: 'Figma (raw) · ODS 컴포넌트 카탈로그 조회',
    layers: '✅ Figma MCP   ✅ 트랙 Context MD   ✅ ODS MCP   ❌ O!Slice 플러그인',
    output: 'React + 진짜 ODS 컴포넌트',
    finding:
      'author-info.md "Badge expert variant" 가 ODS 에 부재함 자동 발견 → 트랙 Context MD 자기검증 첫 사례',
  },
  '3a': {
    date: '2026-04-27 AM',
    scope: '피드 한 판 (Top + 6 Section + Interest Feed)',
    input: '🆕 O!Slice 정리본 Figma (Workflow_Test, 레이어 이름·구조 표준화)',
    layers: '✅ Figma MCP   ✅ 트랙 Context MD   ✅ ODS MCP   ✅ O!Slice 플러그인',
    output: 'React + ODS 피드 한 판 (자동 1차 출력)',
    finding:
      '레이어 마커 🌀/🟣/🪩 자동 인식으로 비ODS 컴포넌트 분리 가능. 그러나 8건 디테일 미스매치 발생 → 사용자 지적 필요',
  },
  '3b': {
    date: '2026-04-27 PM',
    scope: '동 위, 디테일 디벨롭',
    input: '3a 결과물 + 사용자 피드백 8건',
    layers:
      '✅ Figma MCP   ✅ 트랙 Context MD   ✅ ODS MCP   ✅ O!Slice 플러그인   ➕ 사용자 피드백 루프',
    output: 'React + ODS 피드 한 판 (디테일 정합)',
    finding:
      '사용자가 일일이 지적한 디테일을 워크플로우 약점 5종 으로 일반화 → 다음에 자동화로 대체 가능한 체크리스트 도출',
  },
};

function StageSelector({
  active,
  onChange,
}: {
  active: Stage;
  onChange: (s: Stage) => void;
}) {
  const labels: Array<{ id: Stage; label: string }> = [
    { id: '1', label: '1차' },
    { id: '2', label: '2차' },
    { id: '3a', label: '3a 초안' },
    { id: '3b', label: '3b 디벨롭' },
  ];
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        gap: 4,
        padding: '12px 16px',
        background: 'var(--background, white)',
        borderBottom: '1px solid var(--border, #E0E0E0)',
      }}
    >
      {labels.map((l) => {
        const isActive = active === l.id;
        const isDevelop = l.id === '3b';
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange(l.id)}
            style={{
              flex: 1,
              height: 32,
              padding: '0 8px',
              border: `1px solid ${isActive ? (isDevelop ? '#6F3DDE' : '#141414') : 'var(--border, #E0E0E0)'}`,
              background: isActive ? (isDevelop ? '#6F3DDE' : '#141414') : 'white',
              color: isActive ? 'white' : '#141414',
              borderRadius: 50,
              fontSize: 12,
              fontFamily:
                'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

// 결합 계층 4종 + 사용자 피드백 — Stage 별 사용 여부 매트릭스 (메타 카드용)
const LAYER_MATRIX: Record<
  Stage,
  Array<{ name: string; on: boolean; note?: string }>
> = {
  '1': [
    { name: 'Figma MCP', on: true, note: 'raw 노드 직접 조회' },
    {
      name: '트랙 Context MD',
      on: true,
      note: 'author-info.md 만 (콘텐츠 트랙 명세)',
    },
    { name: 'ODS MCP', on: false },
    { name: 'O!Slice 플러그인', on: false },
    { name: '사용자 피드백 루프', on: false },
  ],
  '2': [
    { name: 'Figma MCP', on: true, note: 'raw' },
    { name: '트랙 Context MD', on: true, note: 'author-info.md' },
    {
      name: 'ODS MCP',
      on: true,
      note: '신규 — get_component / get_tokens',
    },
    { name: 'O!Slice 플러그인', on: false },
    { name: '사용자 피드백 루프', on: false },
  ],
  '3a': [
    { name: 'Figma MCP', on: true },
    {
      name: '트랙 Context MD',
      on: true,
      note: '신설 sections/ · modules/ 추가 (4계층 명세)',
    },
    { name: 'ODS MCP', on: true },
    {
      name: 'O!Slice 플러그인',
      on: true,
      note: '신규 — 레이어 이름·구조 정리본을 입력으로',
    },
    { name: '사용자 피드백 루프', on: false },
  ],
  '3b': [
    { name: 'Figma MCP', on: true },
    {
      name: '트랙 Context MD',
      on: true,
      note: '+ contents-plain-tab.md / topic-chip.md (트랙 컴포넌트 MD)',
    },
    { name: 'ODS MCP', on: true },
    { name: 'O!Slice 플러그인', on: true },
    {
      name: '사용자 피드백 루프',
      on: true,
      note: '추가 — 8건 디테일 지적 → 워크플로우 약점 5종 도출',
    },
  ],
};

function LayerMatrix({ stage }: { stage: Stage }) {
  const rows = LAYER_MATRIX[stage];
  return (
    <div
      style={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            lineHeight: '16px',
            color: r.on ? '#141414' : '#ACACAC',
          }}
        >
          <span style={{ width: 16, textAlign: 'center' }}>
            {r.on ? '✅' : '⬜'}
          </span>
          <span style={{ fontWeight: r.on ? 500 : 400, flexShrink: 0 }}>
            {r.name}
          </span>
          {r.note && (
            <span style={{ color: '#8C8C8C' }}>— {r.note}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function StageMeta({ stage }: { stage: Stage }) {
  const m = STAGE_META[stage];
  return (
    <div
      style={{
        margin: '12px 16px 16px',
        padding: 12,
        background: '#F5F5F5',
        borderRadius: 8,
        fontFamily:
          'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 12,
        lineHeight: '16px',
        color: '#444',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          rowGap: 4,
          columnGap: 8,
        }}
      >
        <span style={{ fontWeight: 600 }}>일자</span>
        <span>{m.date}</span>
        <span style={{ fontWeight: 600 }}>범위</span>
        <span>{m.scope}</span>
        <span style={{ fontWeight: 600 }}>입력</span>
        <span>{m.input}</span>
        <span style={{ fontWeight: 600 }}>결과물</span>
        <span>{m.output}</span>
      </div>

      {/* 결합 계층 — 매트릭스 형태로 시각화 */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px dashed #D0D0D0',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>결합 계층</div>
        <LayerMatrix stage={stage} />
      </div>

      {/* 핵심 발견 — 보라색 강조 */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px dashed #D0D0D0',
          color: '#6F3DDE',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>핵심 발견</div>
        <div>{m.finding}</div>
      </div>
    </div>
  );
}

// =====================================================
// 사용자 피드백 → 자동화 해결방안 매핑 (Stage 3b 의 핵심 가치)
// 사용자가 일일이 지적해야 했던 8건의 디테일을 워크플로우 약점 5종으로 일반화
// → 다음 작업에 같은 사용자 피드백 루프를 안 거쳐도 자동 검증되도록 체크리스트 도출
// =====================================================

const FEEDBACK_TO_AUTOMATION: Array<{
  feedback: string;
  rootCause: string;
  pitfall: string;
  automation: string;
}> = [
  {
    feedback: 'Topic Chip 아이콘이 디자인과 다름',
    rootCause: 'design context 의 마스크 좌표만 보고 단순 dot 으로 추정',
    pitfall: 'a. SVG 추출 미수행',
    automation:
      'Figma Code Connect 매핑 자동 조회 → 매핑된 ODS 아이콘 이름 우선 사용',
  },
  {
    feedback: 'Filter Chip 크기가 디자인과 다름',
    rootCause: 'ODS ChipSize enum 의 실제 값 모름 → "lg" 추정',
    pitfall: 'b. ODS API enum 값 모호',
    automation: 'ODS MCP get_component() 응답에 union 타입 enum 값 노출',
  },
  {
    feedback: 'Portrait Card 폭이 248 이라 카드 1.5장만 노출',
    rootCause: '카드 노드별 metadata 안 받고 스크린샷 추정',
    pitfall: 'c. Figma 하위 노드 metadata 미조회',
    automation:
      '카드 단위 node metadata 추가 호출 + Figma MCP 의 get_card_dimensions() 헬퍼',
  },
  {
    feedback: 'Section header chevron 이 텍스트(›) 라 디자인과 다름',
    rootCause: '1차 빠른 구현 시 텍스트 fallback → 후속에 그대로 유지',
    pitfall: 'd. 단순화 결정 미스 (텍스트 fallback)',
    automation:
      '결과 코드에 ›/▾/· 같은 유니코드 글자 잔존 자동 검출 → ODS 아이콘 교체 권고',
  },
  {
    feedback: '섹션 간격이 24px (디자인은 32px)',
    rootCause: 'metadata y/height 좌표 안 보고 임의 추정',
    pitfall: 'e-1. metadata 좌표 미활용',
    automation: 'Figma MCP 의 get_layout_spacing() 헬퍼 (Tyler·지나 후보)',
  },
  {
    feedback: 'Heart 아이콘 누락 + reaction count 만 노출',
    rootCause: 'Section 1 의 Content 슬롯을 Media Accessory 와 분리해서 인지 못 함',
    pitfall: 'e-2. 카드 내부 슬롯 구조 미검증',
    automation: '부모 카드 전체 design context 추가 호출 + 슬롯 트리 자동 검증',
  },
  {
    feedback: 'Description 1줄만 노출 (디자인은 2줄)',
    rootCause: 'ODS Text 의 truncate prop 형식이 webkit-line-clamp 와 충돌',
    pitfall: 'b. ODS API 정보 부족 + d. 텍스트 fallback',
    automation: 'ODS Text truncate prop 의 실제 CSS 효과를 ODS MCP 응답에 명시',
  },
  {
    feedback:
      'Section 3 "최근 찾아본 주제" 가 잘못된 240px 박스 형태로 추정됨',
    rootCause: 'Section 3 design context 안 받고 metadata 만으로 추정',
    pitfall: 'c. 단일 노드만 보고 추정',
    automation:
      '모든 Section 의 design context 일괄 호출 (placeholder 추정 금지)',
  },
];

function FeedbackAutomationTable() {
  return (
    <div style={{ padding: '0 16px', marginBottom: 24 }}>
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: 14,
          fontWeight: 600,
          color: '#141414',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        🔁 사용자 피드백 → 자동화 해결방안
      </h3>
      <p
        style={{
          margin: '0 0 12px',
          fontSize: 12,
          color: '#8c8c8c',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        Stage 3a (자동화 초안) 결과에 사용자가 일일이 지적해야 했던 디테일들.
        이 매핑이 다음 작업에 같은 루프를 안 거치게 하는 체크리스트.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {FEEDBACK_TO_AUTOMATION.map((row, i) => (
          <div
            key={i}
            style={{
              padding: 10,
              background: 'white',
              border: '1px solid #E0E0E0',
              borderRadius: 8,
              fontSize: 12,
              lineHeight: '18px',
              fontFamily: 'Pretendard, sans-serif',
              color: '#444',
            }}
          >
            <div style={{ fontWeight: 600, color: '#141414', marginBottom: 4 }}>
              {i + 1}. {row.feedback}
            </div>
            <div>
              <span style={{ color: '#8c8c8c' }}>원인 — </span>
              {row.rootCause}
            </div>
            <div>
              <span style={{ color: '#8c8c8c' }}>약점 — </span>
              <span style={{ color: '#C30B2A', fontWeight: 500 }}>
                {row.pitfall}
              </span>
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: '#8c8c8c' }}>해결 — </span>
              <span style={{ color: '#6F3DDE', fontWeight: 500 }}>
                {row.automation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// Stage 1 — 트랙 Context MD only (1차, 4/23): 가짜 ODS · HTML 스타일
// → 의도적으로 ODS 컴포넌트 안 쓰고 styled div 로만 작성
//   ODS 토큰 안 쓰고 hardcoded color/font (당시 한계 재현)
// =====================================================

function FakeLandscapeCardStage1({ card }: { card: CardData }) {
  return (
    <article style={{ width: 284, flexShrink: 0, cursor: 'pointer' }}>
      <div
        style={{
          position: 'relative',
          aspectRatio: '3 / 2',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#eee',
        }}
      >
        <img
          src={card.thumbnailUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            border: 'none',
            background: 'rgba(0,0,0,0.24)',
            borderRadius: '50%',
            color: 'white',
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          🔖
        </button>
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'white',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: `url(${card.author.avatarUrl}) center/cover`,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              maxWidth: 64,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {card.author.nickname}
          </span>
        </div>
      </div>
      <div style={{ paddingTop: 10 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: '18px',
            color: '#141414',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {card.title}
        </p>
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginTop: 4,
            fontSize: 12,
            color: '#8c8c8c',
          }}
        >
          <span>조회 {formatMan(card.viewCount ?? 0)}</span>
          <span>·</span>
          <span>🔖 {formatMan(card.scrapCount ?? 0)}</span>
        </div>
      </div>
    </article>
  );
}

function Stage1Content() {
  return (
    <div style={{ paddingTop: 8, paddingBottom: 32 }}>
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: '#141414',
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          취향만 쏙쏙 골라 담은 추천 집들이
        </h2>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          padding: '0 16px',
          scrollbarWidth: 'none',
        }}
      >
        {LANDSCAPE_CARDS.slice(0, 4).map((c) => (
          <FakeLandscapeCardStage1 key={c.id} card={c} />
        ))}
      </div>
      {/* 한계 노트 */}
      <div
        style={{
          margin: '24px 16px 0',
          padding: 12,
          background: '#FFF7E6',
          border: '1px solid #FFE3A3',
          borderRadius: 8,
          fontSize: 12,
          lineHeight: '18px',
          color: '#7A4F00',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        ⚠️ 1차 단계 한계 — 시각·동작·정책 룰은 OK 이지만:
        <br />• 카드는 styled div (가짜 ODS)
        <br />• ODS API·토큰 검증 불가
        <br />• 트랙 Context MD 의 거짓을 발견할 수단 없음
      </div>
    </div>
  );
}

// =====================================================
// Stage 2 — + ODS MCP (2차, 4/24): 실제 ODS · 단일 컴포넌트
// → ContentsLandscapeCard 재사용 (이미 ODS 사용 중)
// → 단 1 Section 만 노출 (당시 단계: 단일 모듈 검증)
// =====================================================

function Stage2Content() {
  return (
    <div style={{ paddingTop: 8, paddingBottom: 32 }}>
      <LandscapeProjectSection
        title="취향만 쏙쏙 골라 담은 추천 집들이"
        cards={LANDSCAPE_CARDS.slice(0, 4)}
        onClickCard={(id) => console.log('navigate to', id)}
        onToggleScrap={(id) => console.log('toggle scrap', id)}
      />
      <div
        style={{
          margin: '24px 16px 0',
          padding: 12,
          background: '#E3F2FD',
          border: '1px solid #BBDEFB',
          borderRadius: 8,
          fontSize: 12,
          lineHeight: '18px',
          color: '#01579B',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        ✨ 2차 단계 발견 — ODS MCP 결합으로 진짜 ODS 컴포넌트 사용:
        <br />• Avatar / Thumbnail / ScrapButton / Text 모두 실제 import
        <br />• 토큰 이름 검증 (foregroundInverse, detail12L16 등)
        <br />• <strong>트랙 Context MD "Badge expert variant" 가 ODS 에 없음 자동 발견</strong>
        <br />• 그러나 Figma 실측 미스매치(Avatar 24 vs 18 등)는 못 잡음
      </div>
    </div>
  );
}

// =====================================================
// Stage 3a — 자동화 초안 (4/27 AM): O!Slice 정리본 → React 첫 출력
// 의도적으로 "사용자 피드백 받기 전" 잘못된 추정 일부 시각화 + 매핑 표
// =====================================================

// Stage 3a 초안 시점의 잘못된 Topic Chip — 단순 보라 dot, 텍스트 사이즈 작음
function DraftTopicChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 32,
        padding: '0 12px',
        background: 'white',
        border: `1px solid ${ACCENT_PURPLE}`,
        borderRadius: 50,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          background: ACCENT_PURPLE,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <Text
        variant="body14L18"
        weight={400}
        asProps={{ style: { color: ACCENT_PURPLE, whiteSpace: 'nowrap' } }}
      >
        {label}
      </Text>
    </button>
  );
}

// Stage 3a 초안 시점의 잘못 추정한 Portrait Card — 폭 248 + Heart 누락 + Description 1줄
function DraftPortraitCard({ card }: { card: CardData }) {
  return (
    <article
      style={{ width: 248, flexShrink: 0, cursor: 'pointer' }}
    >
      <div style={{ position: 'relative' }}>
        <Thumbnail
          src={card.thumbnailUrl}
          ratio={3 / 4}
          radius="small"
          alt=""
          objectFit="cover"
        />
        <CardScrim variant="portrait" />
        <UserInformationOverlay author={card.author} variant="portrait" />
      </div>
      <div style={{ paddingTop: 10 }}>
        <p
          style={{
            margin: 0,
            fontFamily:
              'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 14,
            lineHeight: '18px',
            letterSpacing: '-0.3px',
            color: 'var(--foreground, #141414)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {card.title}
        </p>
        {!!card.reactionCount && (
          <Text variant="detail12L16" color="foregroundWeak">
            {card.reactionCount}
          </Text>
        )}
      </div>
    </article>
  );
}

function Stage3aContent() {
  return (
    <div style={{ paddingBottom: 32 }}>
      {/* 잘못된 추정 시각화 — 카드 1~2장 */}
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: '#141414',
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          이번 주 인기 인테리어 사례
        </h2>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 6,
          paddingLeft: 16,
          paddingRight: 16,
          marginBottom: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {PORTRAIT_CARDS.slice(0, 3).map((c) => (
          <DraftPortraitCard key={c.id} card={c} />
        ))}
      </div>

      {/* Filter row — chip size md (작음) + Topic Chip dot */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          padding: '8px 16px',
          marginBottom: 24,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          background: 'white',
        }}
      >
        <DraftTopicChip label="내 조건 맞추기" />
      </div>

      {/* 발견 한계 안내 */}
      <div
        style={{
          margin: '0 16px 24px',
          padding: 12,
          background: '#FFF3F3',
          border: '1px solid #FCD5D2',
          borderRadius: 8,
          fontSize: 12,
          lineHeight: '18px',
          color: '#820518',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        ⚠️ 3a 단계 (자동화 초안) — O!Slice 정리본 + 3계층 자동 결합으로 첫
        출력했더니 다음 8건이 사용자 지적 필요했음:
        <br />• 카드 폭 잘못 추정 (248 → 138)
        <br />• Topic Chip 아이콘 단순 dot 으로 추정 (실제 SliderHorizontal)
        <br />• Heart 아이콘 누락
        <br />• Description 1줄만 노출 (디자인은 2줄)
        <br />• Section 간격 24 (실제 32, metadata 에 정보 있었음)
        <br />• Filter Chip 크기 미스 (ODS ChipSize 모름)
        <br />• Section header chevron 텍스트 글자 (›)
        <br />• Section 3 (Legacy Interest Post) 형태 잘못 추정
        <br /><br />→ <strong>이 8건을 일반화하면 워크플로우 약점 5종 (a~e)</strong>
        <br />다음 작업에 같은 루프를 안 거치도록 자동화 해결방안 매핑 ↓
      </div>

      <FeedbackAutomationTable />
    </div>
  );
}

// =====================================================
// Stage 3b — 사용자 피드백 후 디벨롭 (4/27 PM): 디테일 정합 완성
// =====================================================

function Stage3bContent() {
  const [activeTab, setActiveTab] = useState('recommend');
  return (
    <>
      <ContentsPlainTab active={activeTab} onChange={setActiveTab} />
      <ContentsFilter />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          // 섹션 간격 = 32px (Figma metadata 실측)
          gap: 32,
          paddingTop: 16,
          paddingBottom: 32,
        }}
      >
        <PortraitProjectSection
          title="이번 주 인기 인테리어 사례"
          cards={PORTRAIT_CARDS}
          onClickCard={(id) => console.log('navigate to', id)}
          onToggleScrap={(id) => console.log('toggle scrap', id)}
          onClickMore={() => console.log('section 1 more')}
        />
        <LandscapeProjectSection
          title="취향만 쏙쏙 골라 담은 추천 집들이"
          cards={LANDSCAPE_CARDS}
          onClickCard={(id) => console.log('navigate to', id)}
          onToggleScrap={(id) => console.log('toggle scrap', id)}
          onClickMore={() => console.log('section 2 more')}
        />
        <LegacyInterestPostSection
          title="최근 찾아본 주제의 인기글"
          topics={LEGACY_TOPICS}
          cards={LEGACY_CARDS}
          onClickCard={(id) => console.log('navigate to', id)}
          onToggleScrap={(id) => console.log('toggle scrap', id)}
          onClickMore={() => console.log('section 3 more')}
        />
        <PortraitProjectSection
          title="이번 달 인기 집들이"
          cards={PORTRAIT_CARDS}
          onClickCard={(id) => console.log('navigate to', id)}
          onToggleScrap={(id) => console.log('toggle scrap', id)}
          onClickMore={() => console.log('section 4 more')}
        />
        <PortraitProjectSection
          title="놓치면 후회할 시공사례"
          cards={SECTION5_CARDS}
          onClickCard={(id) => console.log('navigate to', id)}
          onToggleScrap={(id) => console.log('toggle scrap', id)}
          onClickMore={() => console.log('section 5 more')}
        />
        <PortraitProjectSection
          title="에디터가 추천하는 새 콘텐츠"
          cards={PORTRAIT_CARDS}
          onClickCard={(id) => console.log('navigate to', id)}
          onToggleScrap={(id) => console.log('toggle scrap', id)}
          onClickMore={() => console.log('section 6 more')}
        />
        <InterestFeedModule
          cards={INTEREST_FEED_CARDS}
          onClickCard={(id) => console.log('navigate to', id)}
          onToggleScrap={(id) => console.log('toggle scrap', id)}
        />
      </div>
    </>
  );
}

// =====================================================
// App — 단계별 비교 데모 wrapper
// =====================================================

function renderTopNav(stage: Stage): JSX.Element {
  if (stage === '3a' || stage === '3b') {
    return (
      <TopNavigation
        left={
          <TopNavigation.IconButton
            icon={IconLine3Horizontal}
            aria-label="메뉴"
          />
        }
        centerWidth="fluid"
        center={
          <SearchField>
            <SearchField.IconSlot>
              <IconMagnifyingGlass size={20} weight="regular" />
            </SearchField.IconSlot>
            <SearchField.Input placeholder="오늘의집 통합검색" />
          </SearchField>
        }
        right={
          <>
            <TopNavigation.IconButton icon={IconBell} aria-label="알림" />
            <TopNavigation.IconButton icon={IconBookmark} aria-label="스크랩" />
            <TopNavigation.IconButton icon={IconCart} aria-label="장바구니" />
          </>
        }
      />
    );
  }
  // Stage 1, 2: 단순 헤더
  return (
    <TopNavigation
      left={
        <TopNavigation.IconButton
          icon={IconChevronRight}
          aria-label="뒤로"
          iconProps={{ style: { transform: 'rotate(180deg)' } }}
        />
      }
      center={`${stage}차 단계 시연`}
    />
  );
}

export function App(): JSX.Element {
  // 사이트 self-host 프리뷰: 시안 전환 탭(StageSelector)·제작 메타(StageMeta)는
  // 화면에서 제거하고 최종 3b 피드만 렌더한다. 제작 이력 메타는 사이트 상세페이지
  // 우측 컬럼(prototype-meta.md)에서 문서로 보여준다.
  return (
    <ScreenShell topNavigation={renderTopNav('3b')}>
      <Stage3bContent />
    </ScreenShell>
  );
}
