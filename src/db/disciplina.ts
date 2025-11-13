import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Disciplina{
  id: number,
  curso_ID: number,
  nome: string,
  sigla: string,
  codigo: string,
  periodo_curso: number
};

export async function addDisciplina(curso_ID: number, nome: string, sigla: string, codigo: string, periodo_curso: number): Promise<number> {
  const conn = await open();
  try{
    const result = await conn.execute<{ outBinds : { id: number }}>(
      `
      INSERT INTO DISCIPLINA (CURSO_ID, NOME, SIGLA, CODIGO, PERIODO_CURSO)
      VALUES (:curso_ID, :nome, :sigla, :codigo, :periodo_curso)
      RETURNING CODIGO_DISCIPLINA INTO :id
      `,
      {curso_ID, nome, sigla, codigo, periodo_curso, id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }},
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

export async function deleteDisciplinaById(idValue: number): Promise<number> {
  
  if (!Number.isInteger(idValue) || idValue <= 0){
    throw new Error('ID inválido');
  }
  
  const conn = await open();
  try{
    const sql = `DELETE FROM DISCIPLINA WHERE CODIGO_DISCIPLINA = :id`;
    const result = await conn.execute(sql, { id: idValue }, { autoCommit: true });
    return result.rowsAffected ?? 0;
  } finally{
    await close(conn);
  }
}