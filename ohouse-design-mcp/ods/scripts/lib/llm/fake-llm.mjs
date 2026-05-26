export function createFakeLlmClient() {
  return {
    provider: 'fake',
    async generate({ metadata }) {
      const evidence = metadata?.evidence ?? [];

      if (evidence.length === 0) {
        return {
          provider: 'fake',
          text: '검색된 근거가 없어 답변할 수 없습니다. 질문 표현을 바꾸거나 관련 문서가 public index에 포함되어 있는지 확인해야 합니다.',
        };
      }

      const topEvidence = evidence.slice(0, 3);
      const summary = topEvidence
        .map((entry) => `- ${summarizeEvidence(entry)} [${entry.citation.id}]`)
        .join('\n');

      return {
        provider: 'fake',
        text: [
          '검색된 근거 기준으로는 이렇게 볼 수 있습니다.',
          '',
          summary,
          '',
          '이 응답은 fake LLM provider가 만든 추출형 답변입니다. 실제 모델을 연결하면 같은 evidence payload로 자연어 답변을 생성합니다.',
        ].join('\n'),
      };
    },
  };
}

function summarizeEvidence(entry) {
  const text = stripMarkdown(entry.content);
  const firstSentence = splitSentences(text).find((sentence) => sentence.length >= 12);

  if (firstSentence) {
    return firstSentence.slice(0, 180);
  }

  return `${entry.citation.title} / ${entry.citation.heading_path.join(' > ')}`;
}

function stripMarkdown(value) {
  return String(value ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(value) {
  return value
    .split(/(?<=[.!?。！？])\s+|(?<=다\.)\s+|(?<=요\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}
