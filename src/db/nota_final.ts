import { open, close } from "../config/db";
import OracleDB from "oracledb";

export async function inserirAlunoTurma(codigo_turma: number, ra_aluno: number): Promise<void> {
  const conn = await open();

  try {
    await conn.execute(
      `
      INSERT INTO NOTADEZ.NOTA_FINAL_AJUSTADA (CODIGO_TURMA, RA_ALUNO)
      VALUES (:codigo_turma, :ra_aluno)
      `,
      { codigo_turma, ra_aluno },
      { autoCommit: true }
    );
  } finally {
    await close(conn);
  }
}



export interface NotaFinalRegistro {
  codigo_turma: number;
  ra_aluno: number;
  valor_final: number;
}

export async function atualizarNotasFinaisLote(registros: NotaFinalRegistro[]): Promise<void> {
  if (!registros || registros.length === 0) return;

  const conn = await open();
  try {
    for (const reg of registros) {
      await conn.execute(
        `
        UPDATE NOTA_FINAL_AJUSTADA
        SET VALOR_NOTA_FINAL = :valor
        WHERE CODIGO_TURMA = :turma
          AND RA_ALUNO = :ra
        `,
        {
          turma: reg.codigo_turma,
          ra: reg.ra_aluno,
          valor: reg.valor_final
        }
      );
    }
    await conn.commit();
  } finally {
    await close(conn);
  }
}