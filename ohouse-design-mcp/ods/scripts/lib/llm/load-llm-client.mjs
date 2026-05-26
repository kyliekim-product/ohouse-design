import path from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import { createFakeLlmClient } from './fake-llm.mjs';

export async function loadLlmClient(options = {}) {
  if (options.modulePath) {
    return loadCustomLlmClient(options.modulePath);
  }

  const provider = options.provider ?? process.env.ODS_LLM_PROVIDER ?? 'fake';

  if (provider === 'fake') {
    return createFakeLlmClient();
  }

  throw new Error(`Unsupported LLM provider: ${provider}. Use --provider fake or --llm ./provider.mjs.`);
}

async function loadCustomLlmClient(modulePath) {
  const resolvedPath = path.resolve(process.cwd(), modulePath);
  const module = await import(pathToFileURL(resolvedPath).href);

  if (typeof module.createLlmClient !== 'function') {
    throw new Error(`Custom LLM module must export createLlmClient(): ${resolvedPath}`);
  }

  const client = await module.createLlmClient();
  if (!client || typeof client.generate !== 'function') {
    throw new Error(`Custom LLM client must provide generate(): ${resolvedPath}`);
  }

  return client;
}
