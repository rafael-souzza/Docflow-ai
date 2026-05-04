import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

export async function extractDocumentData(ocrText: string): Promise<Record<string, any>> {
  const prompt = `Você é um extrator de dados de documentos. 
Abaixo está o texto extraído via OCR de um documento (pode ser nota fiscal, contrato, currículo, etc).
Extraia TODAS as informações relevantes em formato JSON estruturado.

Regras:
1. Identifique automaticamente o tipo de documento
2. Extraia: números, datas, valores monetários, nomes, CPF/CNPJ, endereços
3. Retorne APENAS JSON válido, sem comentários
4. Use nomes de campo em português (ex: "nome", "cpf", "valorTotal")
5. Se não conseguir extrair algo, omita o campo (não coloque null)

Texto do OCR:
${ocrText.substring(0, 8000)}

Retorne SOMENTE o JSON:`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'Você é um extrator de dados JSON. Retorne apenas JSON válido, sem texto adicional. Use campos em português.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1,
    max_tokens: 2000
  });

  const content = response.choices[0]?.message?.content || '{}';
  
  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Erro ao parsear JSON do Groq:', content);
    return { rawText: ocrText.substring(0, 500), error: 'Falha ao extrair dados estruturados' };
  }
}