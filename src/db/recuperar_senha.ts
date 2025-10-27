import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface RecupercaoSenha {
  id: number,
  nome: string,
  email: string,
  telefone: string,
  senha: string
};

export async function criarTokenRecuperacao(): Promise<string> {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 20; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
    token += caracteres.charAt(indiceAleatorio);
  }
  console.log("Token de recuperação gerado:", token);
  return token;
}

