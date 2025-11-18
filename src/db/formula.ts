//codigo de auutoria Lucas Soares e Isabela Aparecida
import { open, close } from "../config/db";
import OracleDB from "oracledb";
// Definição da interface TypeScript para a estrutura de dados de uma Fórmula de Nota Final
export interface Formula {
  ID: number;
  ID_Disciplina: number;
  Expressao: string;
  Data_Criacao: Date;
  Atualizado_Em: Date | null;
}
// Rota para salvar ou atualizar a fórmula de nota final de uma disciplina (INSERT ou UPDATE condicional)
export async function salvarFormula(idDisciplina: number,expressao: string
): Promise<Formula> {
  const conn = await open();

  try {
    //Verifica se já existe fórmula para essa disciplina
    const resultSelect = await conn.execute(
      `
      SELECT
        FORMULA_ID AS "ID",
        CODIGO_DISCIPLINA AS "ID_Disciplina",
        EXPRESSAO AS "Expressao",
        CRIADO_EM AS "Data_Criacao",
        ATUALIZADO_EM AS "Atualizado_Em"
      FROM FORMULA_NOTA_FINAL
      WHERE CODIGO_DISCIPLINA = :idDisciplina`,
      { idDisciplina },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    const rows = (resultSelect.rows as any[]) || [];
    let idFormula: number;

    if (rows.length === 0) {
       // se nãao exisitir faz INSERT
      const resultInsert = await conn.execute(
        `
        INSERT INTO FORMULA_NOTA_FINAL (CODIGO_DISCIPLINA, EXPRESSAO)
        VALUES (:idDisciplina, :expressao)
        RETURNING FORMULA_ID INTO :id
        `,
        { idDisciplina, expressao, id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },},
        { autoCommit: true }
      );

      const outBinds = resultInsert.outBinds as { id?: number[] } | undefined;

      if (!outBinds || !outBinds.id || outBinds.id.length === 0) {
        throw new Error("Erro ao obter ID da fórmula inserida.");
      }

      idFormula = outBinds.id[0];
    } 
    else {
      //se já existir faz UPDATE mantendo o mesmo FORMULA_ID
      const existente = rows[0] as any;
      idFormula = existente.ID;

      await conn.execute(
        `
        UPDATE FORMULA_NOTA_FINAL
        SET EXPRESSAO = :expressao,
            ATUALIZADO_EM = SYSDATE
        WHERE FORMULA_ID = :id
        `,
        { expressao, id: idFormula },
        { autoCommit: true }
      );
    }

    // Busca a versão final da fórmula salva
    const resultFinal = await conn.execute(
      `
      SELECT
        FORMULA_ID        AS "ID",
        CODIGO_DISCIPLINA AS "ID_Disciplina",
        EXPRESSAO         AS "Expressao",
        CRIADO_EM         AS "Data_Criacao",
        ATUALIZADO_EM     AS "Atualizado_Em"
      FROM FORMULA_NOTA_FINAL
      WHERE FORMULA_ID = :id
      `,
      { id: idFormula },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    const finalRows = (resultFinal.rows as any[]) || [];
    if (finalRows.length === 0) {
      throw new Error("Falha ao recuperar a fórmula após salvar.");
    }

    const r = finalRows[0];

    return {
      ID: r.ID,
      ID_Disciplina: r.ID_Disciplina,
      Expressao: r.Expressao,
      Data_Criacao: r.Data_Criacao,
      Atualizado_Em: r.Atualizado_Em ?? null,
    };
  } finally {
    await close(conn);
  }
}
   // Busca a versão final da fórmula salva para retornar os dados completos (incluindo Data_Criacao e Atualizado_Em)
export async function obterFormulaPorDisciplina(idDisciplina: number): Promise<Formula | null> {
  const conn = await open();

  try {
    // Rota para obter a fórmula de nota final de uma disciplina pelo seu ID
    const result = await conn.execute(
      `
      SELECT
        FORMULA_ID AS "ID",
        CODIGO_DISCIPLINA AS "ID_Disciplina",
        EXPRESSAO AS "Expressao",
        CRIADO_EM AS "Data_Criacao",
        ATUALIZADO_EM AS "Atualizado_Em"
      FROM FORMULA_NOTA_FINAL
      WHERE CODIGO_DISCIPLINA = :idDisciplina
      `,
      { idDisciplina },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    const rows = (result.rows as any[]) || [];
    if (rows.length === 0) {
      return null;
    }

    const r = rows[0];

    return {
      ID: r.ID,
      ID_Disciplina: r.ID_Disciplina,
      Expressao: r.Expressao,
      Data_Criacao: r.Data_Criacao,
      Atualizado_Em: r.Atualizado_Em ?? null,
    };
  } finally {
    await close(conn);
  }
}