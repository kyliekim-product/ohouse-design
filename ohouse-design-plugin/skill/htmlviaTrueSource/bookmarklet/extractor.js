// htmlviaTrueSource Extractor — Bookmarklet
//
// 이 코드를 javascript: prefix 붙여 북마클릿으로 사용.
// 변경 후에는 install.html을 다시 빌드(README.md 참조).
//
// 동작:
// 1. 페이지 전체를 스크롤하여 lazy-load 이미지 트리거
// 2. tokens / structure / images / embedded data 추출
// 3. JSON으로 자동 다운로드 (extraction-{slug}.json)
// 4. Claude Code 다음 명령 안내 alert

(async () => {
  // ── 1. Auto-scroll for lazy load ───────────
  const step = 400;
  const total = document.body.scrollHeight;
  for (let y = 0; y < total; y += step) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 200));
  }
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 500));

  // ── 2. Slug ────────────────────────────────
  const slug = (location.hostname + location.pathname)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'extracted';

  // ── 3. Tokens ──────────────────────────────
  const colors = new Set(), bgs = new Set(), fs = new Set(), radii = new Set(), fws = new Set();
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el);
    if (s.color && s.color !== 'rgba(0, 0, 0, 0)') colors.add(s.color);
    if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') bgs.add(s.backgroundColor);
    if (s.fontSize) fs.add(s.fontSize);
    if (s.fontWeight && el.textContent.trim()) fws.add(s.fontWeight);
    if (s.borderRadius && s.borderRadius !== '0px') radii.add(s.borderRadius);
  });

  // ── 4. Images ──────────────────────────────
  const images = [...document.querySelectorAll('img')]
    .map(el => ({
      src: el.currentSrc || el.src,
      alt: el.alt || null,
      srcset: el.srcset || null,
      naturalW: el.naturalWidth,
      naturalH: el.naturalHeight,
      displayedW: Math.round(el.getBoundingClientRect().width),
      displayedH: Math.round(el.getBoundingClientRect().height)
    }))
    .filter(i => i.src && !i.src.startsWith('data:'));

  const bgImages = [...document.querySelectorAll('*')]
    .map(el => ({
      tag: el.tagName.toLowerCase(),
      bg: getComputedStyle(el).backgroundImage,
      rect: el.getBoundingClientRect()
    }))
    .filter(x => x.bg && x.bg !== 'none' && x.bg.startsWith('url('))
    .map(x => ({
      tag: x.tag,
      url: (x.bg.match(/url\("?([^"]+)"?\)/) || [])[1],
      w: Math.round(x.rect.width),
      h: Math.round(x.rect.height)
    }))
    .filter(x => x.url);

  // ── 5. Embedded data ───────────────────────
  const embedded = {};
  if (window.__NEXT_DATA__) embedded.nextData = window.__NEXT_DATA__;
  if (window.__INITIAL_STATE__) embedded.initialState = window.__INITIAL_STATE__;
  if (window.__APOLLO_STATE__) embedded.apolloState = window.__APOLLO_STATE__;
  if (window.__REDUX_STATE__) embedded.reduxState = window.__REDUX_STATE__;
  embedded.jsonScripts = [...document.querySelectorAll('script[type="application/json"]')]
    .map(s => ({ id: s.id || null, text: s.textContent }));
  embedded.ldjson = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map(s => s.textContent);

  // ── 6. Structure ───────────────────────────
  const structure = {
    h1: document.querySelector('h1')?.textContent.trim() || null,
    h2s: [...document.querySelectorAll('h2')].map(h => h.textContent.trim()),
    h3s: [...document.querySelectorAll('h3')].map(h => h.textContent.trim()).slice(0, 30),
    sections: [...document.querySelectorAll('section, [class*="section"]')]
      .slice(0, 20)
      .map(s => ({
        text: s.textContent.trim().slice(0, 500),
        h: Math.round(s.getBoundingClientRect().height)
      })),
    buttons: [...document.querySelectorAll('button, [role="button"]')].slice(0, 30).map(b => ({
      text: b.textContent.trim().slice(0, 60),
      ariaLabel: b.getAttribute('aria-label')
    }))
  };

  // ── 7. Payload ─────────────────────────────
  const payload = {
    _meta: {
      url: location.href,
      title: document.title,
      slug,
      captured_at: new Date().toISOString(),
      viewport: window.innerWidth + 'x' + window.innerHeight,
      pageHeight: document.body.scrollHeight,
      userAgent: navigator.userAgent,
      extractor_version: '1.0'
    },
    tokens: {
      fontFamily: getComputedStyle(document.body).fontFamily,
      letterSpacing: getComputedStyle(document.body).letterSpacing,
      colors: [...colors].slice(0, 30),
      backgrounds: [...bgs].slice(0, 20),
      fontSizes: [...fs].sort((a, b) => parseFloat(a) - parseFloat(b)),
      fontWeights: [...fws].sort(),
      radii: [...radii].slice(0, 15)
    },
    structure,
    images,
    backgroundImages: bgImages,
    embedded
  };

  // ── 8. Download ────────────────────────────
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `extraction-${slug}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);

  // ── 9. Next step alert ─────────────────────
  alert(
    '✅ 추출 완료\n\n' +
    `파일: extraction-${slug}.json (Downloads 폴더)\n` +
    `이미지: ${images.length}개\n` +
    `섹션: ${structure.sections.length}개\n` +
    `토큰: ${[...colors].length}컬러 / ${[...fs].length}폰트사이즈\n\n` +
    '다음 단계 (Claude Code):\n' +
    `"북마클릿 추출 데이터로 ${slug} 프로토타입 만들어줘"`
  );
})();
