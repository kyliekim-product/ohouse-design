import { loadPublicIndex } from './load-public-index.mjs';
import { retrieveOdsEvidence } from './hermes-retrieve.mjs';
import { createFakeLlmClient } from './llm/fake-llm.mjs';

const DEFAULT_TOP_K = 8;

export async function answerQuestion(question, options = {}) {
  const { index, indexPath } = options.index
    ? { index: options.index, indexPath: options.indexPath ?? '(provided)' }
    : loadPublicIndex({ indexPath: options.indexPath });

  const evidenceResult = retrieveEvidence(question, {
    index,
    indexPath,
    topK: options.topK ?? DEFAULT_TOP_K,
  });

  if (evidenceResult.answerability.status !== 'answerable') {
    return {
      question,
      indexPath,
      provider: null,
      answer: evidenceResult.answerability.summary,
      answerability: evidenceResult.answerability,
      citations: [],
      evidence: [],
      retrieval: evidenceResult.retrieval,
    };
  }

  const llm = options.llm ?? createFakeLlmClient();
  const answerResult = await generateAnswer(question, evidenceResult.evidence, { llm });

  return {
    question,
    indexPath,
    provider: answerResult.provider,
    answer: answerResult.text,
    answerability: evidenceResult.answerability,
    citations: evidenceResult.evidence.map((entry) => entry.citation),
    evidence: evidenceResult.evidence,
    retrieval: evidenceResult.retrieval,
  };
}

export function retrieveEvidence(question, options = {}) {
  if (!options.index) {
    throw new Error('retrieveEvidence requires options.index');
  }

  return retrieveOdsEvidence(question, {
    index: options.index,
    indexPath: options.indexPath,
    topK: options.topK ?? DEFAULT_TOP_K,
  });
}

export async function generateAnswer(question, evidence, options = {}) {
  const llm = options.llm ?? createFakeLlmClient();

  if (!llm || typeof llm.generate !== 'function') {
    throw new Error('generateAnswer requires an llm object with generate()');
  }

  const prompt = buildAnswerPrompt(question, evidence);
  const response = await llm.generate({
    system: prompt.system,
    messages: prompt.messages,
    metadata: {
      question,
      evidence,
    },
  });

  if (!response || typeof response.text !== 'string') {
    throw new Error('llm.generate() must return an object with a text string');
  }

  return {
    provider: response.provider ?? llm.provider ?? 'custom',
    text: response.text.trim(),
  };
}

export function buildAnswerPrompt(question, evidence) {
  const evidenceText = evidence.map(formatEvidenceForPrompt).join('\n\n');

  return {
    system: [
      'You answer ODS design system questions using only the provided evidence.',
      'If the evidence is insufficient, say what is missing instead of guessing.',
      'Answer in Korean unless the user asks for another language.',
      'Keep the answer concise and include citation ids like [C1] where useful.',
    ].join('\n'),
    messages: [
      {
        role: 'user',
        content: [
          `Question: ${question}`,
          '',
          'Evidence:',
          evidenceText || '(no evidence)',
        ].join('\n'),
      },
    ],
  };
}

function formatEvidenceForPrompt(entry) {
  return [
    `[${entry.citation.id}] ${entry.citation.title} / ${entry.citation.heading_path.join(' > ')}`,
    `source_path: ${entry.citation.source_path}`,
    `content_hash: ${entry.citation.content_hash}`,
    '',
    entry.content,
  ].join('\n');
}
