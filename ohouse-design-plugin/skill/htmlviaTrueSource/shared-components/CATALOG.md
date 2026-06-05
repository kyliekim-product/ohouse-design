# 공통 컴포넌트 후보 카탈로그

> 신규 패턴(ODS 미보유) 레지스트리. badge·card·list·divider 등 ODS 보유 컴포넌트는 등록하지 않고 ODS로 치환한다.
> 상태: `candidate`(초안) → `reviewing`(검토중) → `promoted`(ODS 신청완료, 치환 대기) → `deprecated`(ODS 반영됨).

| Component | 설명 | ODS 매칭 실패 근거 | 상태 | 산출물 | 최초 사용처 |
|---|---|---|---|---|---|
| RankPodiumChart | top-3 견적 막대(1위 brand-blue+크라운, 2·3위 gray, %라벨) | `list_components`에 chart/bar/podium 없음, `list_recipes`에 데이터시각화 recipe 없음 | candidate | _미작성_ (HTML 인라인만 존재) | preview/ohou-experts §견적순위 |

<!-- 신규 후보 추가 시 위 표에 1행 등록. 산출물 = .tsx + .usage.md + .spec.ts -->
