import OracleDB from "oracledb";
import { open, close } from "../config/db";
export interface Curso {
  id: number,
  nome: string,
};
export async function verificarCursoInstituica(id:number) {
  const conn=await open();
  try{
    const result= await conn.execute(
      `
      SELECT 1
      FROM INSTITUICAO
      WHERE INSTITUICAO_ID = :INSTITUICAO_ID
      `,
      { INSTITUICAO_ID: id },
      {outFormat: OracleDB.OUT_FORMAT_OBJECT}
    );
    return !!(result.rows && result.rows.length > 0);
  }finally{
    await close(conn);
  }
}
export async function verificarCurso(id:number,nome:string) {
  const conn=await open();
  try{
    const result= await conn.execute(
      `
      SELECT 1
      FROM CURSO
      WHERE INSTITUICAO_ID = :INSTITUICAO_ID
      AND NOME=:NOME
      `,
      { INSTITUICAO_ID: id,NOME: nome },
      {outFormat: OracleDB.OUT_FORMAT_OBJECT}
    );
    return !!(result.rows && result.rows.length > 0);
  }finally{
    await close(conn);
  }
}
export async function cadastrarCurso(instituicao_id: number, nome: string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `INSERT INTO CURSO (instituicao_id, nome)
       VALUES (:instituicao_id, :nome)`,
      { instituicao_id,nome },
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  } finally {
    await close(conn);
  }
}