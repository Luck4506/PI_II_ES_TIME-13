
import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface ComponenteNota {
  id: number; // componente_nota_id
  codigo_disciplina: number;
  nome: string;
  sigla: string | null;
  descricao?: string | null;
}

export async function addComponenteNota(
  codigo_disciplina: number,
  nome: string,
  sigla?: string | null,
  descricao?: string | null
): Promise<number> {
  const conn = await open();
  try {
    const result = await conn.execute<{
      outBinds: { id: number };
    }>(
      `
      INSERT INTO COMPONENTE_NOTA (CODIGO_DISCIPLINA, NOME, SIGLA, DESCRICAO)
      VALUES (:codigo_disciplina, :nome, :sigla, :descricao)
      RETURNING COMPONENTE_NOTA_ID INTO :id
      `,
      {
        codigo_disciplina,
        nome,
        sigla: sigla ?? null,
        descricao: descricao ?? null,
        id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
      },
      { autoCommit: true }
    );

    const outBinds = result.outBinds as { id?: number[] } | undefined;

    if (!outBinds || !outBinds.id || outBinds.id.length === 0) {
      throw new Error(
        "Erro ao obter ID retornado na inserção de Componente de Nota."
      );
    }

    return outBinds.id[0];
  } 
  finally {
    await close(conn);
  }
}

export async function getAllComponentesByDisciplina(
  disciplinaId: number
): Promise<ComponenteNota[]> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 
        COMPONENTE_NOTA_ID as "id",
        CODIGO_DISCIPLINA as "codigo_disciplina",
        NOME as "nome",
        SIGLA as "sigla",
        DESCRICAO as "descricao"
      FROM COMPONENTE_NOTA
      WHERE CODIGO_DISCIPLINA = :disciplinaId
      ORDER BY COMPONENTE_NOTA_ID DESC
      `,
      { disciplinaId }
    );
    return result.rows as ComponenteNota[];
  } 
  finally {
    await close(conn);
  }
}

export async function getComponenteNotaById(
  idValue: number
): Promise<ComponenteNota | null> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 
        COMPONENTE_NOTA_ID as "id",
        CODIGO_DISCIPLINA as "codigo_disciplina",
        NOME as "nome",
        SIGLA as "sigla",
        DESCRICAO as "descricao"
      FROM COMPONENTE_NOTA
      WHERE COMPONENTE_NOTA_ID = :id
      `,
      { id: idValue }
    );
    const rows = result.rows as ComponenteNota[];
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  } 
  finally {
    await close(conn);
  }
}

export async function deleteComponenteNotaById(
  idValue: number
): Promise<boolean> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `DELETE FROM COMPONENTE_NOTA WHERE COMPONENTE_NOTA_ID = :id`,
      { id: idValue },
      { autoCommit: true }
    );
    return result.rowsAffected !== undefined && result.rowsAffected > 0;
  } 
  finally {
    await close(conn);
  }
}
