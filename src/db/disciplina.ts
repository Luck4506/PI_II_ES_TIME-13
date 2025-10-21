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
      INSERT INTO DOCENTE_TESTE (NOME, EMAIL, TELEFONE_CELULAR, SENHA)
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