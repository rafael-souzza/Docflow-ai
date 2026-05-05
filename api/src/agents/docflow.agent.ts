import dotenv from 'dotenv';
dotenv.config();
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

async function callLLM(prompt: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 500,
  });
  return response.choices[0]?.message?.content || '';
}

export async function classifyDocument(text: string): Promise<string> {
  const prompt = `Classifique o documento abaixo em uma categoria. Retorne APENAS a categoria, sem texto adicional.
Categorias: nota_fiscal, curriculo, contrato, email, relatorio, outros.

Documento: ${text.substring(0, 2000)}`;
  return (await callLLM(prompt)).trim().toLowerCase();
}

export async function decideAction(category: string): Promise<string> {
  const actions: Record<string, string> = {
    nota_fiscal: 'extrair_valores',
    curriculo: 'extrair_dados_pessoais',
    contrato: 'extrair_partes',
    email: 'extrair_contato',
    relatorio: 'resumir',
    outros: 'resumir',
  };
  return actions[category] || 'resumir';
}

export async function executeAction(action: string, text: string): Promise<string> {
  const prompts: Record<string, string> = {
    extrair_valores: 'Extraia os valores monetários deste documento em JSON.',
    extrair_dados_pessoais: 'Extraia nome, email, telefone, habilidades em JSON.',
    extrair_partes: 'Extraia as partes envolvidas e valor do contrato em JSON.',
    extrair_contato: 'Extraia nome, email, telefone, empresa em JSON.',
    resumir: 'Resuma este documento em 3 frases.',
  };

  const prompt = `${prompts[action] || 'Resuma em 3 frases.'}\n\nDocumento: ${text.substring(0, 2000)}`;
  return await callLLM(prompt);
}

export async function runAgentPipeline(text: string) {
  console.log('🤖 Iniciando pipeline de agentes...');

  const category = await classifyDocument(text);
  console.log('📂 Classificado como:', category);

  const action = await decideAction(category);
  console.log('🎯 Ação decidida:', action);

  const result = await executeAction(action, text);
  console.log('✅ Ação executada');

  return { category, action, result };
}