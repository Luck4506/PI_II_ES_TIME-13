import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Disciplina{
  id: number,
  nome: string,
  sigla: string,
  codigo: string,
  periodo_curso: number
};

export async function addDisciplina(nome: string, sigla: string, codigo: string, periodo_curso: number): Promise<number> {
  const conn = await open();
  try{
    const result = await conn.execute<{ outBinds : { id: number }}>(
      `
      INSERT INTO DISCIPLINA (NOME, SIGLA, CODIGO, PERIODO_CURSO)
      VALUES (:nome, :sigla, :codigo, :periodo_curso)
      RETURNING CODIGO_DISCIPLINA INTO :id
      `,
      {nome, sigla, codigo, periodo_curso, id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }},
      { autoCommit: true }
    );

    const outBinds = result.outBinds as {id?: number[]} | undefined;

    if(!outBinds || !outBinds.id || outBinds.id.length === 0) {
      throw new Error("Erro ao obter ID retornado na inserção de Disciplina.");
    }

    return outBinds.id[0];

  } finally {
    await close(conn);
  }
}

export async function getAllDisciplinas(): Promise<Disciplina[]> {
  const conn = await open();
  try{
    const result = await conn.execute(
      `SELECT CODIGO_DISCIPLINA as "id", NOME as "nome", SIGLA as "sigla", CODIGO as "codigo", PERIODO_CURSO as "periodo_curso"
      FROM DISCIPLINA`
    );
    return result.rows as Disciplina[];
  }finally{
    await close(conn);
  }
}

// CUIDADO!!!
/*
export async function deleteDisciplinaById(id: number): Promise<number> {
  const conn = await open();
  try{
    const result = await conn.execute(
      `DELETE FROM DISCIPLINA
      WHERE CODIGO_DISCIPLINA = :id
      RETURNING CODIGO_DISCIPLINA INTO :retornoId`,

      {
        id,
        retornoId: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }
      },
      { autoCommit: true }
    );

    const retornoIdArray = (result.outBinds as { retornoId?: number[] })?.retornoId;

    if(!retornoIdArray || retornoIdArray.length === 0) {
      throw new Error("Erro ao obter ID retornado na exclusão de Disciplina.");
    }

    return retornoIdArray[0];

  }finally{
    await close(conn);
  }
}
*/