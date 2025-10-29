import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Instituicao {
  id: number,
  nome: string,
  sigla: string,
};
export interface Instituicao_verifyByName{
  id: number,
  nome: string,
};
//Saber se o nome ou sigla existem.
export async function verifyByNameESigla(nome:string,sigla:string) {
  const conn=await open();
  try{
    const result= await conn.execute<Instituicao>(
      `
      SELECT INSTITUICAO_ID as "id", NOME as "nome", SIGLA as "sigla"
      FROM INSTITUICAO
      WHERE NOME = :nome
      OR SIGLA = :sigla`,
      {nome,sigla},
      {outFormat: OracleDB.OUT_FORMAT_OBJECT}
    );
    return (result.rows && result.rows[0]) as Instituicao |null;
  }finally{
    await close(conn);
  }
}
export async function verifyByName(nome:string) {
  const conn=await open();
  try{
    const result= await conn.execute<Instituicao_verifyByName>(
      `
      SELECT INSTITUICAO_ID as "id", NOME as "nome"
      FROM INSTITUICAO
      WHERE NOME = :nome`,
      {nome},
      {outFormat: OracleDB.OUT_FORMAT_OBJECT}
    );
    return (result.rows && result.rows[0]) as Instituicao_verifyByName |null;
  }finally{
    await close(conn);
  }
}
export async function registrarInstituicao(nome: string, sigla: string, docente_id: number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `INSERT INTO INSTITUICAO (NOME, SIGLA, DOCENTE_ID)
       VALUES (:nome, :sigla, :docente_id)`,
      { nome, sigla, docente_id },
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  } finally {
    await close(conn);
  }
}
export async function listarInstituicao() {
  const conn = await open();
  try {
    const result = await conn.execute(
      `SELECT INSTITUICAO_ID, NOME, SIGLA FROM INSTITUICAO`,
      [], // sem binds
      { outFormat: OracleDB.OUT_FORMAT_OBJECT } // <- garante objetos
    );

    const rows = result.rows as any[] || [];

    return rows.map((row: any) => ({
      INSTITUICAO_ID: row.INSTITUICAO_ID,
      NOME: row.NOME,
      SIGLA: row.SIGLA
    }));
  } finally {
    await conn.close();
  }
}
export async function atualizarInstituicao(nome: string, sigla: string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `UPDATE INSTITUICAO SET SIGLA = :sigla WHERE NOME = :nome`,
      { nome, sigla },
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  } finally {
    await close(conn);
  }
}