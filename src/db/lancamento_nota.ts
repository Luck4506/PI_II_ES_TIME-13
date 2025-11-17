import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface LancamentoNota {
  codigo_turma: number;
  ra_aluno: number; // RA do aluno
  componente_nota_id: number;
  docente_id: number;
  valor: number; // regra: normalizar para 2 casas; intervalo 0..10
}

function normalizarValorNota(valorNota: number): number {
  if (!Number.isFinite(valorNota)) {
    throw new Error("Valor de nota inválido.");
  }
  const arredondado = Math.round(valorNota * 100) / 100;
  if (arredondado < 0 || arredondado > 10) {
    throw new Error("A nota deve estar no intervalo de 0 a 10.");
  }
  return arredondado;
}

export async function LancarNota(
  codigoTurma: number,
  alunoRa: number,
  componenteNotaId: number,
  docenteId: number,
  valorNota: number
): Promise<LancamentoNota> {
  const conn = await open();
  try {
    const valorNormalizado = normalizarValorNota(valorNota);

    const result = await conn.execute(
      `
      INSERT INTO NOTADEZ.LANCAMENTO_NOTA
        (CODIGO_TURMA, RA_ALUNO, COMPONENTE_NOTA_ID, DOCENTE_ID, VALOR)
      VALUES
        (:codigo_turma, :ra_aluno, :componente_nota_id, :docente_id, :valor)`,
      {
        codigo_turma: codigoTurma,
        ra_aluno: alunoRa,
        componente_nota_id: componenteNotaId,
        docente_id: docenteId,
        valor: valorNormalizado,
      },
      { autoCommit: true }
    );

    if (!result.rowsAffected) {
      throw new Error("Falha ao inserir o lançamento de nota.");
    }

    return {
      codigo_turma: codigoTurma,
      ra_aluno: alunoRa,
      componente_nota_id: componenteNotaId,
      docente_id: docenteId,
      valor: valorNormalizado,
    };
  } 
  catch (e: any) {
    if (e && (e.errorNum === 1)) {
      throw new Error(
        "Já existe um lançamento para (turma, aluno, componente). Utilize atualização."
      );
    }
    throw e;
  } finally {
    await close(conn);
  }
}


export async function getLancamentoNotaByPK(
  codigoTurma: number,
  alunoRa: number,
  componenteNotaId: number
): Promise<LancamentoNota | null> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT
        CODIGO_TURMA AS "codigo_turma",
        RA_ALUNO AS "ra_aluno",
        COMPONENTE_NOTA_ID  AS "componente_nota_id",
        DOCENTE_ID AS "docente_id",
        VALOR AS "valor"
      FROM NOTADEZ.LANCAMENTO_NOTA
      WHERE CODIGO_TURMA = :codigo_turma AND RA_ALUNO = :ra_aluno AND COMPONENTE_NOTA_ID = :componente_nota_id
      `,
      {
        codigo_turma: codigoTurma,
        ra_aluno: alunoRa,
        componente_nota_id: componenteNotaId,
      },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows as LancamentoNota[] | undefined;
    return rows && rows.length > 0 ? rows[0] : null;
  } finally {
    await close(conn);
  }
}

export async function getAllLancamentosByTurmaEComponente(
  codigoTurma: number,
  componenteNotaId: number
): Promise<LancamentoNota[]> {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT
        CODIGO_TURMA AS "codigo_turma",
        RA_ALUNO AS "ra_aluno",
        COMPONENTE_NOTA_ID AS "componente_nota_id",
        DOCENTE_ID AS "docente_id",
        VALOR AS "valor"
      FROM NOTADEZ.LANCAMENTO_NOTA
      WHERE CODIGO_TURMA = :codigo_turma AND COMPONENTE_NOTA_ID = :componente_nota_id
      ORDER BY RA_ALUNO
      `,
      { codigo_turma: codigoTurma, componente_nota_id: componenteNotaId },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return (result.rows as LancamentoNota[]) ?? [];
  }
   finally {
    await close(conn);
  }
}

export async function updateLancamentoNotaValor(
  codigoTurma: number,
  alunoRa: number,
  componenteNotaId: number,
  docenteId: number,
  novoValorNota: number
): Promise<{ atualizado: true; depois: number }> {
  const conn = await open();
  try {
    const valorNormalizado = normalizarValorNota(novoValorNota);

    const upd = await conn.execute(
      `UPDATE NOTADEZ.LANCAMENTO_NOTA
         SET VALOR = :valor, DOCENTE_ID = :docente_id
       WHERE CODIGO_TURMA = :codigo_turma AND RA_ALUNO = :ra_aluno AND COMPONENTE_NOTA_ID = :componente_nota_id`,
      {
        valor: valorNormalizado,
        docente_id: docenteId,
        codigo_turma: codigoTurma,
        ra_aluno: alunoRa,
        componente_nota_id: componenteNotaId,
      },
      { autoCommit: true }
    );

    if (!upd.rowsAffected) {
      throw new Error("Lançamento não encontrado para atualização.");
    }

    return { atualizado: true, depois: valorNormalizado };
  } 
  finally {
    await close(conn);
  }
}

export type NotaComponenteSalvar = Pick<LancamentoNota, "ra_aluno" | "valor">;

export async function salvarNotasComponente(codigoTurma: number, componenteNotaId: number, docenteId: number, notas: NotaComponenteSalvar[]
): Promise<void> {
  if (!notas.length) {
    return;
  }

  const conn = await open();
  try {
    const binds = notas.map((nota) => ({
      codigo_turma: codigoTurma,
      ra_aluno: nota.ra_aluno,
      componente_nota_id: componenteNotaId,
      docente_id: docenteId,
      valor: normalizarValorNota(nota.valor),
    }));

    await conn.executeMany(
      `
      MERGE INTO NOTADEZ.LANCAMENTO_NOTA ln
      USING (
        SELECT :codigo_turma AS CODIGO_TURMA,
               :ra_aluno AS RA_ALUNO,
               :componente_nota_id AS COMPONENTE_NOTA_ID
        FROM DUAL
      ) src
      ON (
        ln.CODIGO_TURMA = src.CODIGO_TURMA
        AND ln.RA_ALUNO = src.RA_ALUNO
        AND ln.COMPONENTE_NOTA_ID = src.COMPONENTE_NOTA_ID
      )
      WHEN MATCHED THEN
        UPDATE SET
          ln.VALOR = :valor,
          ln.DOCENTE_ID = :docente_id
      WHEN NOT MATCHED THEN
        INSERT (CODIGO_TURMA, RA_ALUNO, COMPONENTE_NOTA_ID, DOCENTE_ID, VALOR)
        VALUES (:codigo_turma, :ra_aluno, :componente_nota_id, :docente_id, :valor)`,
      binds,
      { autoCommit: true }
    );
  } finally {
    await close(conn);
  }
}
