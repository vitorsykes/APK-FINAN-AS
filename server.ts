import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("⚠️ GEMINI_API_KEY environment variable is missing. Rules-based engine will be used as fallback.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Fallback rule-based parsing engine for robust offline operation or missing API key
function parseNotificationUsingRules(text: string): any {
  const normalized = text.toLowerCase();
  let tipo: 'receita' | 'despesa' | 'transferencia' = 'despesa';
  let valor = 0;
  let pessoa = 'Desconhecido';
  let categoriaSugerida = 'Outros';
  let descricao = 'Movimentação Capturada';
  let banco = 'Desconhecido';
  let isWorkIncome = false;
  let isEmployeePayment = false;
  let isSelfTransfer = false;

  // Detect bank
  if (normalized.includes('nubank') || normalized.includes('roxinho')) banco = 'Nubank';
  else if (normalized.includes('itau') || normalized.includes('itaú') || normalized.includes('personalite')) banco = 'Itaú';
  else if (normalized.includes('inter')) banco = 'Inter';
  else if (normalized.includes('caixa')) banco = 'Caixa';
  else if (normalized.includes('xp')) banco = 'XP Investimentos';
  else if (normalized.includes('bradesco')) banco = 'Bradesco';
  else if (normalized.includes('santander')) banco = 'Santander';

  // Extract amount
  const valueMatch = text.match(/(?:R\$|r\$)\s*([0-9]+(?:[\.,][0-9]{2})?)/) || text.match(/valor\s*de\s*(?:R\$)?\s*([0-9]+(?:[\.,][0-9]{2})?)/i);
  if (valueMatch) {
    const rawVal = valueMatch[1].replace(/\./g, '').replace(',', '.');
    valor = parseFloat(rawVal) || 0;
  }

  // Detect type & properties
  if (normalized.includes('recebeu um pix') || normalized.includes('pix recebido') || normalized.includes('recebido de')) {
    tipo = 'receita';
    categoriaSugerida = 'Recebimento';
    descricao = 'PIX recebido';
    const nameMatch = text.match(/(?:recebeu um PIX de|de)\s*([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s+no\s+valor|de\s+R\$|\s+valor|\s*,$|$)/i);
    if (nameMatch) {
      pessoa = nameMatch[1].trim();
    }
  } else if (normalized.includes('pix enviado') || normalized.includes('enviou um pix') || normalized.includes('enviado para')) {
    tipo = 'despesa';
    categoriaSugerida = 'Outros';
    descricao = 'PIX enviado';
    const nameMatch = text.match(/(?:enviado para|para)\s*([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s+no\s+valor|de\s+R\$|\s+valor|$)/i);
    if (nameMatch) {
      pessoa = nameMatch[1].trim();
    }
  } else if (normalized.includes('transferência entre') || normalized.includes('transferencia entre') || normalized.includes('conta corrente e poupança') || normalized.includes('para poupança')) {
    tipo = 'transferencia';
    categoriaSugerida = 'Transferência interna';
    descricao = 'Transferência entre contas';
    pessoa = 'Minhas Contas';
    isSelfTransfer = true;
  } else if (normalized.includes('compra aprovada') || normalized.includes('compra no cartão') || normalized.includes('no estabelecimento')) {
    tipo = 'despesa';
    categoriaSugerida = 'Compras';
    descricao = 'Compra no cartão';
    const shopMatch = text.match(/(?:em|no establishment|no|para)\s*([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s+no\s+valor|de\s+R\$|\s+valor|$)/i);
    if (shopMatch) {
      pessoa = shopMatch[1].trim();
    }
  } else if (normalized.includes('boleto') || normalized.includes('enel') || normalized.includes('luz') || normalized.includes('água') || normalized.includes('energia')) {
    tipo = 'despesa';
    categoriaSugerida = 'Moradia';
    descricao = 'Boleto pago';
    pessoa = 'Concessionária';
  } else if (normalized.includes('cashback') || normalized.includes('rendimentos')) {
    tipo = 'receita';
    categoriaSugerida = 'Rendimentos';
    descricao = 'Cashback / Rendimentos';
    pessoa = banco !== 'Desconhecido' ? banco : 'Rendimento';
  } else if (normalized.includes('assinatura') || normalized.includes('netflix') || normalized.includes('spotify') || normalized.includes('disney')) {
    tipo = 'despesa';
    categoriaSugerida = 'Assinaturas';
    descricao = 'Debito de assinatura';
    if (normalized.includes('netflix')) pessoa = 'Netflix';
    else if (normalized.includes('spotify')) pessoa = 'Spotify';
  }

  // Work income classification
  if (normalized.includes('serviços') || normalized.includes('techcorp') || normalized.includes('cliente') || normalized.includes('comercial') || normalized.includes('trabalho')) {
    if (tipo === 'receita') {
      isWorkIncome = true;
      categoriaSugerida = 'Recebimento Trabalho';
      descricao = 'Faturamento / Receita de Trabalho';
    }
  }

  // Employee payments
  if (normalized.includes('funcionário') || normalized.includes('funcionario') || normalized.includes('colaborador') || normalized.includes('mateus')) {
    if (tipo === 'despesa') {
      isEmployeePayment = true;
      categoriaSugerida = 'Funcionários';
      descricao = 'Pagamento de Funcionário';
    }
  }

  // Self transfer
  if (normalized.includes('minha parte') || normalized.includes('enviado de uma conta') || normalized.includes('transferência própria') || normalized.includes('transferencia própria')) {
    tipo = 'transferencia';
    isSelfTransfer = true;
    categoriaSugerida = 'Transferência interna';
    descricao = 'Distribuição: Minha Parte';
  }

  // Clean name up
  pessoa = pessoa.replace(/\s+/g, ' ').trim();
  if (pessoa.length > 30) {
    pessoa = pessoa.substring(0, 27) + '...';
  }

  // Assign sensible categories based on name
  const nameLower = pessoa.toLowerCase();
  if (!isWorkIncome && !isEmployeePayment && !isSelfTransfer) {
    if (nameLower.includes('joão') || nameLower.includes('joao')) {
      categoriaSugerida = 'Salário';
    } else if (nameLower.includes('maria')) {
      categoriaSugerida = 'Moradia'; // Aluguel
    } else if (nameLower.includes('mercado livre') || nameLower.includes('amazon')) {
      categoriaSugerida = 'Compras';
    } else if (nameLower.includes('uber')) {
      categoriaSugerida = 'Transporte';
    } else if (nameLower.includes('ifood')) {
      categoriaSugerida = 'Alimentação';
    } else if (nameLower.includes('netflix') || nameLower.includes('spotify')) {
      categoriaSugerida = 'Lazer';
    } else if (nameLower.includes('google play')) {
      categoriaSugerida = 'Aplicativos';
    }
  }

  return { tipo, valor, pessoa, categoriaSugerida, descricao, banco, isWorkIncome, isEmployeePayment, isSelfTransfer };
}

// REST Endpoint to parse notification text with Gemini or rule engine
app.post("/api/parse-notification", async (req, res) => {
  const { text, userRules } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Notification text is required" });
  }

  try {
    const ai = getAI();
    let result: any = null;

    if (ai) {
      console.log(`🤖 Processing with Gemini: "${text.substring(0, 60)}..."`);
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analise o texto desta notificação de celular de movimentação financeira e extraia as informações estruturadas em JSON.
        
Notificação: "${text}"

Regras do usuário já conhecidas:
${userRules ? JSON.stringify(userRules, null, 2) : "Nenhuma regra específica informada."}

Extraia o tipo de transação (tipo: 'receita', 'despesa', ou 'transferencia' se for interna entre contas), o valor em reais, o nome da pessoa/estabelecimento envolvido, uma sugestão adequada de categoria e uma descrição. Identifique também o banco se mencionado.
Detecte especificamente se a movimentação é de faturamento/receita do trabalho (isWorkIncome), se é pagamento de funcionários do trabalho (isEmployeePayment) ou se é uma transferência própria da parte do usuário para outra conta dele (isSelfTransfer).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tipo: {
                type: Type.STRING,
                description: "Tipo da transação: 'receita' (pix recebido, salário, faturamento do trabalho, cashback), 'despesa' (compras, boletos, pix enviado, salário de funcionário, taxas) ou 'transferencia' (movimentação entre próprias contas)."
              },
              valor: {
                type: Type.NUMBER,
                description: "O valor monetário exato encontrado na notificação."
              },
              pessoa: {
                type: Type.STRING,
                description: "O nome limpo do favorecido, pagador ou estabelecimento."
              },
              categoriaSugerida: {
                type: Type.STRING,
                description: "A melhor categoria (ex: 'Recebimento Trabalho', 'Funcionários', 'Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Compras', 'Salário', 'Transferência interna')."
              },
              descricao: {
                type: Type.STRING,
                description: "Descrição limpa da transação."
              },
              banco: {
                type: Type.STRING,
                description: "Nome do Banco que emitiu a notificação ou 'Desconhecido'."
              },
              isWorkIncome: {
                type: Type.BOOLEAN,
                description: "True se for recebimento de faturamento, receita do trabalho, PJ, serviços ou cliente comercial."
              },
              isEmployeePayment: {
                type: Type.BOOLEAN,
                description: "True se for um pagamento enviado a funcionário, ajudante, colaborador ou prestador de serviços do trabalho."
              },
              isSelfTransfer: {
                type: Type.BOOLEAN,
                description: "True se for uma transferência de 'minha parte' / recursos próprios entre contas próprias do usuário."
              }
            },
            required: ["tipo", "valor", "pessoa", "categoriaSugerida", "descricao", "banco", "isWorkIncome", "isEmployeePayment", "isSelfTransfer"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        result = JSON.parse(responseText.trim());
      }
    }

    if (!result) {
      console.log(`🛡️ Falling back to Rule-based engine for notification: "${text}"`);
      result = parseNotificationUsingRules(text);
    }

    // Apply custom user override rules if matched on the backend too
    if (userRules && Array.isArray(userRules)) {
      const parsedPessoaLower = (result.pessoa || "").toLowerCase();
      for (const rule of userRules) {
        if (parsedPessoaLower.includes(rule.pattern.toLowerCase()) || text.toLowerCase().includes(rule.pattern.toLowerCase())) {
          result.categoriaSugerida = rule.category;
          result.tipo = rule.type;
          console.log(`Matched user override rule: ${rule.pattern} -> ${rule.category}`);
        }
      }
    }

    res.json({ success: true, data: result, aiPowered: !!ai });

  } catch (error: any) {
    console.error("❌ Error parsing notification:", error);
    // On failure, fallback to rules to provide premium bulletproof experience
    try {
      const fallbackResult = parseNotificationUsingRules(text);
      res.json({ success: true, data: fallbackResult, aiPowered: false, error: error.message });
    } catch (fallbackErr) {
      res.status(500).json({ error: "Internal server error during notification analysis" });
    }
  }
});

// App initialization and static asset hosting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("🚀 Running in DEVELOPMENT mode. Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Running in PRODUCTION mode. Serving static assets from dist/...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
