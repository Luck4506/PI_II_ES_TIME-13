import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Docente {
  id: number,
  email: string,
  senha: string
};

// Obter o docente pelo email.
export async function getDocenteByEmail(email: string): Promise<Docente | null> {
  const conn = await open();
  try {
    const result = await conn.execute<Docente>(
      `SELECT DOCENTE_ID as "id", EMAIL as "email", SENHA as "senha"
       FROM DOCENTE_TESTE
       WHERE EMAIL = :email`,
      { email },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    return (result.rows && result.rows[0]) as Docente | null;
  } finally {
    await close(conn);
  }
}
