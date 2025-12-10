import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { ExtractedData } from "../types";

// Initialize AI Client
// Note: In a real production app, ensure API key security.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DATA_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    local: { type: Type.STRING, description: "Local da licitação (Cidade/Estado)" },
    orgaoResponsavel: { type: Type.STRING, description: "Nome do órgão responsável" },
    modalidade: { type: Type.STRING, description: "Modalidade da contratação (ex: Pregão Eletrônico)" },
    dataInicioRecebimento: { type: Type.STRING, description: "Data de início de recebimento de propostas" },
    dataFimRecebimento: { type: Type.STRING, description: "Data fim de recebimento de propostas" },
    dataAbertura: { type: Type.STRING, description: "Data e hora da abertura das propostas (ex: 17/12/2025 às 10:01)" },
    inicioSessaoDisputa: { type: Type.STRING, description: "Data e hora do início da sessão de disputa" },
    habilitacaoJuridica: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de documentos para Habilitação Jurídica"
    },
    habilitacaoFiscalSocialTrabalhista: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de documentos para Habilitação Fiscal, Social e Trabalhista"
    },
    habilitacaoEconomicoFinanceira: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de documentos para Habilitação Econômico-Financeira"
    },
    itens: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.INTEGER },
          descricao: { type: Type.STRING },
          especificacao: { type: Type.STRING },
          quantidade: { type: Type.NUMBER },
          valorUnitario: { type: Type.NUMBER },
          valorTotal: { type: Type.NUMBER }
        }
      },
      description: "Tabela de itens licitados"
    }
  },
  required: [
    "local", "orgaoResponsavel", "modalidade", "dataInicioRecebimento", 
    "dataFimRecebimento", "dataAbertura", "inicioSessaoDisputa", 
    "habilitacaoJuridica", "habilitacaoFiscalSocialTrabalhista", 
    "habilitacaoEconomicoFinanceira", "itens"
  ]
};

export const analyzeDocument = async (base64Data: string, mimeType: string): Promise<ExtractedData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analise este edital de licitação e extraia os dados exatamente conforme o esquema JSON solicitado. 
            Não altere nada, apenas extraia. 
            Se algum campo não for encontrado, preencha com 'Não informado no documento'.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: DATA_SCHEMA
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ExtractedData;
    }
    throw new Error("Não foi possível extrair dados do documento.");
  } catch (error) {
    console.error("Erro na análise:", error);
    throw error;
  }
};

export const createChatSession = (base64Data: string, mimeType: string): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    history: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Este é o arquivo do edital. A partir de agora, responda perguntas APENAS relacionadas a este arquivo. Se a pergunta não for sobre o arquivo, diga que só pode responder sobre o edital."
          }
        ]
      },
      {
        role: 'model',
        parts: [{ text: "Entendido. Estou pronto para responder perguntas exclusivamente sobre este arquivo de edital." }]
      }
    ],
    config: {
      systemInstruction: "Você é um assistente especialista em licitações chamado LICITAPRO Chat. Você deve responder perguntas estritamente baseadas no contexto do arquivo fornecido. Seja claro, direto e profissional."
    }
  });
};