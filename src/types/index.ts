export interface User {
  uid: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface Categoria {
  uid: string;
  nome: string;
  tipo: 'Receita' | 'Despesa';
  ativa: boolean;
}

export interface Tag {
  uid: string;
  nome: string;
  ativa: boolean;
}

export interface Cartao {
  uid: string;
  nome: string;
  diaFechamento: number;
  diaVencimento: number;
  limite: number;
  limiteInfo?: {
    limiteTotal: number;
    valorComprometido: number;
    limiteDisponivel: number;
    percentualUsado: number;
  };
}

export interface Transacao {
  uuid: string;
  valor: number;
  valorFormatado?: string;
  data: string;
  descricao?: string;
  categoria: Categoria;
  tags?: Tag[];
  cartao?: Cartao;
  pendente?: boolean;
  recorrenciaUid?: string;
  tipoPagamento?: string;
  oculta?: boolean; // Indica se a transação está oculta pelo usuário
}

export interface TransacaoRequest {
  valor: number;
  data: string;
  descricao?: string;
  categoriaUid: string;
  tagUids?: string[];
  cartaoUid?: string;
  tipoPagamento?: string;
}

export interface Dashboard {
  totalDespesa: number;
  totalReceita: number;
  saldoDisponivel: number;
  despesaVsReceita: number;
  top5GastosCartoes?: Top5Item[];
  top5GastosTags?: Top5Item[];
  top5GastosCategorias?: Top5Item[];
  metasCategorias?: MetaStatus[];
}

export interface MetaStatus {
  categoria: string;
  valorMeta: number;
  valorGasto: number;
  percentual: number;
  status: 'Dentro da meta' | 'Meta excedida';
}

export interface Top5Item {
  uid: string;
  nome: string;
  valor: number;
  percentual: number;
}

export interface Recorrencia {
  uid: string;
  valor: number;
  categoria: Categoria;
  tipo: 'MENSAL' | 'ANUAL';
  dataInicio: string;
  dataFim?: string;
  ativa: boolean;
}

export interface MetaCategoria {
  uid?: string;
  categoriaUid: string;
  valorMeta: number;
  periodo: 'MENSAL' | 'ANUAL';
}

