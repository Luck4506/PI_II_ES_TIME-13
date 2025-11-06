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
export async function verificarCurso(INSTITUICAO_ID:number,NOME:string) {
  const conn=await open();
  try{
    const result= await conn.execute(
      `
      SELECT 1
      FROM CURSO
      WHERE INSTITUICAO_ID = :INSTITUICAO_ID
      AND NOME=:NOME
      `,
      { INSTITUICAO_ID,NOME},
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
export async function listarCurso(instituicao_id: number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT CURSO_ID, NOME
      FROM CURSO
      WHERE INSTITUICAO_ID = :id
      `,
      { id: instituicao_id },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows as any[] || [];

    return rows.map((row: any) => ({
      CURSO_ID: row.CURSO_ID,
      NOME: row.NOME
    }));
  } finally {
    await close(conn);
  }
}
export async function atualizarCurso(NOME_ANTIGO:string, NOME_NOVO:string, INSTITUICAO_ID:number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `UPDATE CURSO SET NOME = :NOME_NOVO WHERE NOME = :NOME_ANTIGO AND INSTITUICAO_ID=:INSTITUICAO_ID `,
      { NOME_ANTIGO, NOME_NOVO,INSTITUICAO_ID},
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  } finally {
    await close(conn);
  }
}
export async function apagarCursoComando(instituicao_id:number,nome:string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `DELETE FROM CURSO WHERE NOME = :nome AND INSTITUICAO_ID = :instituicao_id`,
      { nome, instituicao_id },
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  } finally {
    await close(conn);
  }
}
export async function apagarRelacaoCurso(curso_id:number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `DELETE FROM DOCENTE_CURSO WHERE CURSO_ID = :curso_id`,
      { curso_id },
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  } finally {
    await close(conn);
  }
}

export async function pegarIdCurso(instituicao_id:number,nome: string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT CURSO_ID
      FROM CURSO
      WHERE INSTITUICAO_ID = :instituicao_id
      AND NOME = :nome
      `,
      { instituicao_id,nome },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    if (result.rows && result.rows.length > 0) {
      return (result.rows[0] as any).CURSO_ID;
    } else {
      return null;
    }
  } finally {
    await close(conn);
  }
}
export async function pegarDisciplinaPorId(curso_id:number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1
      FROM DISCIPLINA
      WHERE CURSO_ID = :curso_id
      `,
      { curso_id },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    if (result.rows && result.rows.length > 0) {
      return true;
    } else {
      return false;
    }
  } finally {
    await close(conn);
  }
}

export async function cadastrarRelacaoCurso(docente_id:number, curso_id:number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `INSERT INTO DOCENTE_CURSO (docente_id, curso_id)
       VALUES (:docente_id, :curso_id)`,
      { docente_id,curso_id },
      { autoCommit: true },
    );
    return result.rowsAffected && result.rowsAffected > 0;
  } finally {
    await close(conn);
  }
}


