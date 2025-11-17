import OracleDB from "oracledb";
import { open, close } from "../config/db";
export interface Curso {
  id: number,
  nome: string,
};
// Função para verificar se o ID de uma instituição é válido
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
// Função para verificar se um curso com o ID fornecido existe
export async function existeCursoId(curso_id:number) {
  const conn=await open();
  try{
    const result= await conn.execute(
      `
      SELECT 1
      FROM CURSO
      WHERE CURSO_ID = :CURSO_ID
      `,
      { CURSO_ID: curso_id },
      {outFormat: OracleDB.OUT_FORMAT_OBJECT}
    );
    return !!(result.rows && result.rows.length > 0);
  }finally{
    await close(conn);
  }
}
// Função para verificar se um docente está vinculado a uma instituição
export async function estaInstituicao(instituicao_id:number,docente_id:number) {
  const conn=await open();
  try{
    const result= await conn.execute(
      `
      SELECT 1
      FROM DOCENTE_INSTITUICAO
      WHERE DOCENTE_ID = :docente_id
      AND INSTITUICAO_ID = :instituicao_id
      `,
      {  instituicao_id,docente_id },
      {outFormat: OracleDB.OUT_FORMAT_OBJECT}
    );
    return !!(result.rows && result.rows.length > 0);
  }finally{
    await close(conn);
  }
}
// Função para verificar se a relação entre um docente e um curso existe
export async function estaRelacaoCurso(docente_id:number,curso_id:number) {
  const conn=await open();
  try{
    const result= await conn.execute(
      `
      SELECT 1
      FROM DOCENTE_CURSO
      WHERE DOCENTE_ID = :docente_id
      AND CURSO_ID = :curso_id
      `,
      {  docente_id,curso_id },
      {outFormat: OracleDB.OUT_FORMAT_OBJECT}
    );
    return !!(result.rows && result.rows.length > 0);
  }finally{
    await close(conn);
  }
}
// Função para verificar se um curso com um nome específico já existe em uma instituição
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
// Função para cadastrar um novo curso para uma instituição
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
// Função para listar todos os cursos de uma instituição específica
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
// Função para atualizar o nome de um curso com base no nome antigo e ID da instituição
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
// Função para apagar um curso pelo nome e ID da instituição
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
// Função para apagar todas as relações de docentes com um curso específico
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
// Função para obter o ID de um curso pelo nome e ID da instituição
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
// Função para verificar se existem disciplinas vinculadas a um curso
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
// Função para verificar se um curso existe pelo ID (similar a existeCursoId)
export async function verificarCursoExiste(curso_id:number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1
      FROM CURSO
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
// Função para cadastrar a relação entre um docente e um curso
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


