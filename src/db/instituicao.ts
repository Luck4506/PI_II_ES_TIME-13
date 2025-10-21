import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface In {
  id: number,
  nome: string,
  sigla: string,
};

export async function addInstituicao(nome: string, sigla: string): Promise<number> {
  const conn = await open();
  try {
    const result = await conn.execute<{ outBinds: { id: number } }>(
      `
      INSERT INTO INSTITUICAO (NOME, SIGLA)
      VALUES (:nome, :sigla)
      RETURNING INSTITUICAO_ID INTO :id
      `,
      { nome, sigla, id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER } },
      { autoCommit: true }
    );

    const outBinds = result.outBinds as { id?: number[] } | undefined;

    if (!outBinds || !outBinds.id || outBinds.id.length === 0) {
      throw new Error("Erro ao obter um ID retornado na inserção de Instituicao.");
    }

    return outBinds.id[0];

  } finally {
    await close(conn);
  }
}