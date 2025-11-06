import { open, close } from "../config/db";
import OracleDB from "oracledb";


export async function verifyByName(nome: string): Promise<boolean> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1 
      FROM INSTITUICAO
      WHERE NOME = :nome
      FETCH FIRST 1 ROWS ONLY
      `,
      { nome },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    // se encontrou pelo menos uma linha, retorna true
    return !!result.rows?.length;
  } finally {
    await close(conn);
  }
}
export async function verifyByNameESigla(nome: string,sigla:string): Promise<boolean> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1 
      FROM INSTITUICAO
      WHERE NOME = :nome
      AND SIGLA = :sigla
      FETCH FIRST 1 ROWS ONLY
      `,
      { nome,sigla },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    // se encontrou pelo menos uma linha, retorna true
    return !!result.rows?.length;
  } finally {
    await close(conn);
  }
}


export async function registrarInstituicao(nome: string, sigla: string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `INSERT INTO INSTITUICAO (NOME, SIGLA)
       VALUES (:nome, :sigla)`,
      { nome, sigla },
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  } finally {
    await close(conn);
  }
}
export async function cadastrarRelacao(instituicao_id: number, docente_id: number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `INSERT INTO DOCENTE_INSTITUICAO (docente_id, instituicao_id)
      VALUES (:docente_id, :instituicao_id)`,
      { instituicao_id,docente_id },
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


export async function apagarInstituicao(nome: string, sigla: string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `DELETE FROM INSTITUICAO WHERE NOME = :nome AND SIGLA = :sigla`,
      { nome, sigla },
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  } finally {
    await close(conn);
  }
}

export async function pegarIdPorNome(nome: string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT INSTITUICAO_ID
      FROM INSTITUICAO
      WHERE NOME = :nome
      `,
      { nome },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    if (result.rows && result.rows.length > 0) {
      return (result.rows[0] as any).INSTITUICAO_ID;
    } else {
      return null;
    }
  } finally {
    await close(conn);
  }
}


export async function existeDocente(instituicao_id: number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT docente_id
      FROM DOCENTE
      WHERE instituicao_id = :instituicao_id
      AND ROWNUM = 1
      `,
      { instituicao_id },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return result.rows!.length > 0;
  } finally {
    await close(conn);
  }
}
export async function existeCurso(instituicao_id:number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1
      FROM CURSO
      WHERE INSTITUICAO_ID = :instituicao_id
      AND ROWNUM = 1
      `,
      { instituicao_id },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return result.rows!.length > 0;
  } finally {
    await close(conn);
  }
}
