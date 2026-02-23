export const faqItems = [
  {
    question: "Como funciona o sistema de creditos?",
    answer:
      "Cada geracao de projeto consome exatamente 1 credito, independente da complexidade. Todo consumo e ajuste de credito e registrado em ledger com rastreabilidade completa. Sem creditos disponiveis, a geracao e bloqueada automaticamente."
  },
  {
    question: "Qual a diferenca entre os planos Free e Pro?",
    answer:
      "O plano Free oferece creditos iniciais para voce testar a plataforma. O Pro garante creditos mensais recorrentes, exportacao em lote e suporte prioritario."
  },
  {
    question: "Os documentos gerados sao realmente unicos?",
    answer:
      "Sim. A IA gera os documentos com base nas informacoes preenchidas: descricao, tags, area de atuacao, restricoes e preferencias tecnicas."
  },
  {
    question: "Posso exportar os documentos para apresentar ao orientador?",
    answer:
      "Sim. Voce pode exportar cada documento individualmente em PDF, exportar o projeto completo ou fazer exportacao em lote de multiplos projetos."
  },
  {
    question: "O que acontece se a geracao falhar?",
    answer:
      "Em caso de falha na geracao, o credito consumido e automaticamente reembolsado. O sistema aplica REFUND e o projeto e marcado como FAILED."
  }
];

export const plans = [
  {
    name: "Free",
    price: "0",
    suffix: "/mes",
    description: "Tudo que voce precisa para comecar a estruturar sua ideia.",
    cta: "Comecar gratis",
    featured: false,
    features: [
      "Creditos iniciais gratuitos",
      "Geracao de 3 documentos",
      "Exportacao PDF por documento",
      "Exportacao em lote",
      "Creditos adicionais"
    ],
    disabledFrom: 3
  },
  {
    name: "Pro",
    price: "19",
    suffix: "/mes",
    description: "Para o estudante que quer velocidade e consistencia, sem se preocupar com limites curtos.",
    cta: "Assinar Pro",
    featured: true,
    tag: "Mais popular",
    features: [
      "Tudo do plano Free",
      "20 creditos mensais",
      "Exportacao em lote (PDF)",
      "Projetos ilimitados",
      "Suporte prioritario"
    ]
  },
  {
    name: "Turma",
    price: "9",
    suffix: "/aluno·mes",
    description: "Para professores e instituicoes que orientam multiplos TCCs.",
    cta: "Falar com equipe",
    featured: false,
    features: [
      "Tudo do plano Pro",
      "Gestao de creditos por aluno",
      "Painel administrativo",
      "Ledger de auditoria completo",
      "Minimo de 10 alunos"
    ]
  }
];
