import { open, close } from "../config/db";
import OracleDB from "oracledb";

export async function inserirAlunoTurma(codigo_turma: number, ra_aluno: number): Promise<void> {
  const conn = await open();

  try {
    await conn.execute(
      `
      INSERT INTO NOTA_FINAL (CODIGO_TURMA, RA_ALUNO)
      VALUES (:codigo_turma, :ra_aluno)
      `,
      {
        codigo_turma,
        ra_aluno
      },
      { autoCommit: true }
    );

  } finally {
    await close(conn);
  }
}

