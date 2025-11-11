import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Aluno {
  ra: number;
  nome: string;
  criado_em: Date;
}


export async function addAluno(ra: number, nome: string): Promise<number> {
  const conn = await open();
  try {
    await conn.execute(
      `
      INSERT INTO ALUNO (RA_aluno, nome)
      VALUES (:ra, :nome)`,
      { ra, nome },
      { autoCommit: true }
    );
    return ra;
  } finally {
    await close(conn);
  }
}


export async function buscarAlunoPorRA(ra: number): Promise<Aluno | null> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT RA_aluno, nome, criado_em
      FROM ALUNO
      WHERE RA_aluno = :ra`,
      { ra },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    const row = (result.rows as any[] | undefined)?.[0];
    if (!row) return null;

    return {
      ra: row.RA_ALUNO,
      nome: row.NOME,
      criado_em: row.CRIADO_EM,
    } as Aluno;
  } finally {
    await close(conn);
  }
}


export async function excluirAlunoPorRA(ra: number): Promise<boolean> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      DELETE FROM ALUNO
      WHERE RA_aluno = :ra`,
      { ra },
      { autoCommit: true }
    );
   return (result.rowsAffected ?? 0) > 0;
  } finally {
    await close(conn);
  }
}


export async function listarTodosAlunos(): Promise<Aluno[]> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT RA_aluno, nome, criado_em
      FROM ALUNO
      ORDER BY nome`,
      {},
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    const rows = (result.rows as any[]) || [];
    return rows.map((row: any) => ({
      ra: row.RA_ALUNO,
      nome: row.NOME,
      criado_em: row.CRIADO_EM,
    } as Aluno));
  }
   finally {
    await close(conn);
  }

}

//Importa alunos por CSV em lote.
//Retorna um resumo com quantos inseriu, quantos falharam e os erros (se houver).

export async function importarAlunos( alunos: Array<{ ra: number; nome: string; }>
): Promise<{ total: number; inseridos: number; falhas: number; erros?: Array<{ index: number; errorNum: number; message: string }>;}> {

  if (!alunos || alunos.length === 0) {
    return { total: 0, inseridos: 0, falhas: 0 };
  }

  const binds = alunos.map((a) => ({
    ra: a.ra,
    nome: a.nome,
  }));

  const conn = await open();
  try {
    const result = await (conn as any).executeMany(
      `
      INSERT INTO ALUNO (RA_aluno, nome)
      VALUES (:ra, :nome)
      `,
      binds,
      {
        autoCommit: true,
        batchErrors: true, // continua mesmo se alguma linha falhar 
        bindDefs: {
          ra: { type: OracleDB.NUMBER },
          nome: { type: OracleDB.STRING, maxSize: 150 },
        },
      }
    );

    const erros = (result.batchErrors as any[] | undefined)?.map((e: any) => ({
      index: e.offset,
      errorNum: e.errorNum,
      message: e.message,
    }));

    const total = alunos.length;
    const falhas = erros?.length ?? 0;
    const inseridos = total - falhas;

    return { total, inseridos, falhas, erros };
  }
   finally {
    await close(conn);
  }
}