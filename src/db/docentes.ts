import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Docente {
  id: number,
  nome: string,
  email: string,
  telefone: string,
  senha: string
};

export async function addDocente(nome: string, email: string, telefone: string, senha: string): Promise<number> {
  const conn = await open();
  try {
    const result = await conn.execute<{ outBinds: { id: number } }>(
      `
      INSERT INTO DOCENTE (NOME, EMAIL, TELEFONE, SENHA)
      VALUES (:nome, :email, :telefone, :senha)
      RETURNING DOCENTE_ID INTO :id
      `,
      { nome, email, telefone, senha, id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER } },
      { autoCommit: true }
    );

    const outBinds = result.outBinds as { id?: number[] } | undefined;

    if (!outBinds || !outBinds.id || outBinds.id.length === 0) {
      throw new Error("Erro ao obter um ID retornado na inserção de Docente.");
    }

    return outBinds.id[0];

  } finally {
    await close(conn);
  }
}
export async function listarDocente(instituicao_id: number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 
        d.docente_id,
        d.nome
      FROM DOCENTE d
      JOIN DOCENTE_INSTITUICAO di 
        ON di.docente_id = d.docente_id
      WHERE di.instituicao_id = :id
      `,
      { id: instituicao_id },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    const rows = result.rows as any[] || [];
    return rows.map((row: any) => ({
      docente_id: row.DOCENTE_ID,
      nome: row.NOME
    }));
  } finally {
    await close(conn);
  }
}

export async function listarDocenteCurso(curso_id: number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 
        d.docente_id,
        d.nome
      FROM DOCENTE d
      JOIN DOCENTE_CURSO dc 
        ON dc.docente_id = d.docente_id
      WHERE dc.curso_id = :curso_id
      `,
      { curso_id:curso_id },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    const rows = result.rows as any[] || [];
    return rows.map((row: any) => ({
      docente_id: row.DOCENTE_ID,
      nome: row.NOME
    }));
  } finally {
    await close(conn);
  }
}

export async function possuiInstituicao(docente_id:number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1
      FROM DOCENTE_INSTITUICAO
      WHERE DOCENTE_ID = :docente_id
      `,
      { docente_id },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return result.rows!.length > 0;
  } finally {
    await close(conn);
  }
}