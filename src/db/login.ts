import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Docente {
  id: number,
  nome: string,
  email: string,
  senha: string
};

// Obter o docente pelo email.
export async function getDocenteByEmail(email: string): Promise<Docente | null> {
  const conn = await open();
  try {
    const result = await conn.execute<Docente>(
      `SELECT DOCENTE_ID as "id", NOME as "nome", EMAIL as "email", SENHA as "senha"
       FROM DOCENTE
       WHERE EMAIL = :email`,
      { email },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    return (result.rows && result.rows[0]) as Docente | null;
  } finally {
    await close(conn);
  }
}
//verifica se ja tem alguum docente registrado com esse email
export async function verificarExisteEmail(email: string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      SELECT 1 
      FROM DOCENTE
      WHERE EMAIL = :email
      FETCH FIRST 1 ROWS ONLY
      `,
      { email },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    return result.rows && result.rows.length > 0;
  } finally {
    await close(conn);
  }
}
//fuuncao que atualiza a senha do docente sando o email como identificador
export async function fazerUpdateSenha(email: string, senha: string) {
  const conn = await open();
  try {
    const result = await conn.execute(
      `
      UPDATE DOCENTE
      SET SENHA = :senha
      WHERE EMAIL = :email
      `,
      { senha, email },
      { autoCommit: true }
    );

    return result.rowsAffected && result.rowsAffected > 0;
  } finally {
    await close(conn);
  }
}