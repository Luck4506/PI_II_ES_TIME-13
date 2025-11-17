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
export async function verificarDisciplina(codigo_disciplina: number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1 
      FROM DISCIPLINA
      WHERE CODIGO_DISCIPLINA = :codigo_disciplina
      FETCH FIRST 1 ROWS ONLY
      `,
      { codigo_disciplina },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return !!result.rows?.length;
  } finally {
    await close(conn);
  }
}

export async function verificarNome(codigo_disciplina: number,nome:string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1 
      FROM TURMA
      WHERE CODIGO_DISCIPLINA = :codigo_disciplina
      AND NOME = :nome
      FETCH FIRST 1 ROWS ONLY
      `,
      { codigo_disciplina,nome },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return !!result.rows?.length;
  } finally {
    await close(conn);
  }
}

export async function verificarNomeTurma(codigo_disciplina: number,nome:string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1
      FROM TURMA
      WHERE CODIGO_DISCIPLINA = :codigo_disciplina
      AND NOME = :nome
      FETCH FIRST 1 ROWS ONLY
      `,
      { codigo_disciplina,nome },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return !!result.rows?.length;
  } finally {
    await close(conn);
  }
}
export async function apagarRelacaoTurma(codigo_turma:number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `DELETE FROM NOTA_FINAL_AJUSTADA
      WHERE CODIGO_TURMA = :codigo_turma`,
      { codigo_turma },
      { autoCommit: true }
    );
  } finally {
    await close(conn);
  }
}

export async function apagarTurma(codigo_turma:number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `DELETE FROM TURMA
      WHERE CODIGO_TURMA = :codigo_turma`,
      { codigo_turma },
      { autoCommit: true }
    );
  } finally {
    await close(conn);
  }
}
export async function verificarTurma(codigo_turma: number,nome:string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1 
      FROM TURMA
      WHERE CODIGO_TURMA = :codigo_turma
      AND NOME = :nome
      FETCH FIRST 1 ROWS ONLY
      `,
      { codigo_turma,nome },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return !!result.rows?.length;
  } finally {
    await close(conn);
  }
}

export async function pegarIdDisciplina(codigo_turma: number) {
  const conn = await open();
  try {
    const result = await conn.execute<{
      CODIGO_DISCIPLINA: number;
    }>(
      `
      SELECT CODIGO_DISCIPLINA
      FROM TURMA
      WHERE CODIGO_TURMA = :codigo_turma
      FETCH FIRST 1 ROWS ONLY
      `,
      { codigo_turma },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    return result.rows[0].CODIGO_DISCIPLINA;
  } finally {
    await close(conn);
  }
}


export async function cadastrarTurma(codigo_disciplina:number,nome:string,docente_id:number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `INSERT INTO TURMA (CODIGO_DISCIPLINA,DOCENTE_ID,NOME)
       VALUES (:codigo_disciplina, :docente_id, :nome)`,
      { codigo_disciplina,docente_id,nome },
      { autoCommit: true }
    );
  } finally {
    await close(conn);
  }
}

export async function atualizarTurma(codigo_turma:number,nome_antigo:string,nome_novo:string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `UPDATE TURMA
      SET nome = :nome_novo
      WHERE codigo_turma = :codigo_turma
      AND nome = :nome_antigo`,
      { nome_novo, codigo_turma, nome_antigo },
      { autoCommit: true }
    );
  } finally {
    await close(conn);
  }
}

export async function listarTurmasPorDisciplina(idDisciplina: number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT  CODIGO_TURMA AS "id", NOME AS "nome"
      FROM TURMA
      WHERE CODIGO_DISCIPLINA = :idDisciplina
      ORDER BY NOME
      `,
      { idDisciplina },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    return result.rows as any[];
  } finally {
    await close(conn);
  }
}

export async function listarAlunosDaTurma(codigoTurma: number) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT DISTINCT nfa.RA_ALUNO AS "id", a.NOME AS "nome"
      FROM NOTADEZ.NOTA_FINAL_AJUSTADA nfa
      JOIN NOTADEZ.ALUNO a
      ON a.RA_ALUNO = nfa.RA_ALUNO
      WHERE nfa.CODIGO_TURMA = :codigo_turma
      ORDER BY a.NOME
      `,
      { codigo_turma: codigoTurma },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    const rows = (result.rows as any[]) || [];
    return rows;
  } finally {
    await close(conn);
  }
}