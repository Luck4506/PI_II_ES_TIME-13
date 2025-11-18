//Codigo de autoria de Lucas Gonçalves

import OracleDB from "oracledb";
import dotenv from "dotenv";
dotenv.config();

// Caminho do wallet do Oracle
const walletPath = process.env.ORACLE_WALLET_PATH;
// Caminho do Oracle Instant Client
const instantClient = process.env.ORACLE_INSTANT_CLIENT_PATH;

// Inicialização do cliente Oracle
OracleDB.initOracleClient({configDir: walletPath, libDir: instantClient});

// Define saída como JSON
OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

// Configurações do banco de dados
const dbConfig = {
  user: "NOTADEZ",
  password: "EngSoftDBUser#2025",
  connectString: "notadezdb_high"
}

// Função para abrir conexão
export async function open(){
  try{
    const connection = await OracleDB.getConnection(dbConfig);
    console.log("Conexao OCI - aberta");
    return connection;
  }catch(err){
    console.error("Erro ao abrir conexao com o Oracle: ", err);
    throw err;
  }
}

// Função para fechar conexão
export async function close(connection: OracleDB.Connection){
  try{
    await connection.close();
    console.log("Conexão OCI - fechada");
  }catch(err){
    console.error("Erro ao fechar conexao com o Oracle: ", err);
  }
}