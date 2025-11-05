import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Turma{
  id: number,
  id_disciplina: number,
  id_docente: number,
  nome: string,
};

export async function addTurma(id_disciplina:number, id_docente:number, nome:string): Promise<number> {
  const conn = await open();
  try{
    const result = await conn.execute<{ outBinds : { id: number }}>(
      `
      INSERT INTO TURMA (CODIGO_DISCIPLINA, DOCENTE_ID, NOME)
      VALUES (:id_disciplina, :id_docente, :nome)
      RETURNING CODIGO_TURMA INTO :id`,
      {id_disciplina, id_docente, nome, id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }},
      { autoCommit: true }
    );

    const outBinds = result.outBinds as {id?: number[]} | undefined;

    if(!outBinds || !outBinds.id || outBinds.id.length === 0) {
      throw new Error("Erro ao obter ID retornado na inserção de Turma.");
    }

    return outBinds.id[0];

  } finally {
    await close(conn);
  }
}

export async function getAllTurmasPerDocente(docenteId: number): Promise<Turma[]> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `SELECT 
        CODIGO_TURMA as "Codigo_Turma",
        CODIGO_DISCIPLINA as "Disciplina_ID",
        NOME as "nome_da_turma",
       FROM TURMA
       WHERE DOCENTE_ID = :docente_id
       ORDER BY CODIGO_TURMA DESC`,
      { docente_id: docenteId }
    );
    return result.rows as Turma[];
  }
    finally {
    await close(conn);
  }
}

export async function getTurmaById(idValue: number): Promise<Turma | null> {
  const conn = await open();
  try{
    const result = await conn.execute(
      `SELECT CODIGO_TURMA as "id", CODIGO_DISCIPLINA as "id_disciplina", NOME as "nome", DOCENTE_ID as "id_docente"
      FROM TURMA
      WHERE CODIGO_TURMA = :id`,
      { id: idValue }
    );
    const rows = result.rows as Turma[];
    if(rows.length === 0){
      return null;
    }
    return rows[0];
  }
  finally{
    await close(conn);
  }
}

export async function deleteTurmaById(idValue: number): Promise<boolean> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `DELETE FROM TURMA WHERE CODIGO_TURMA = :id`,
      { id: idValue },
      { autoCommit: true }
    );
    return (result.rowsAffected !== undefined && result.rowsAffected > 0);
  } 
  finally {
    await close(conn);
  }
}
