import OracleDB from "oracledb";
import dotenv from "dotenv";
dotenv.config();

// caminho da wallet de conexao com o oracle.
const walletPath = process.env.ORACLE_WALLET_PATH;
const instantClient = process.env.ORACLE_INSTANT_CLIENT_PATH;

// inicializar o cliente oracle, usando a wallet.
OracleDB.initOracleClient({configDir: walletPath, libDir: instantClient});

// formato de saída dos dados, vai ser objetos JSON.
OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

const dbConfig = {
  user: "NOTADEZ",
  password: "EngSoftDBUser#2025",
  connectString: "notadezdb_high"
}

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

export async function close(connection: OracleDB.Connection){
  try{
    await connection.close();
    console.log("Conexão OCI - fechada");
  }catch(err){
    console.error("Erro ao fechar conexao com o Oracle: ", err);
  }
}