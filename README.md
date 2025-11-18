# PI_II_ES_TIME-13

# Projeto NotaDez — PI_II_ES_TIME-13

Sistema Web para gerenciamento de notas acadêmicas desenvolvido como parte do Projeto Integrador II do curso de Engenharia de Software da PUC-Campinas.

# 1. Sobre o Projeto

O NotaDez é uma aplicação web cujo objetivo é permitir que docentes gerenciem suas notas de maneira organizada, segura e centralizada. Ele substitui planilhas manuais e oferece uma experiência personalizada para o professor, possibilitando:

- Gerenciamento de instituições, disciplinas e turmas.  
- Lançamento de componentes de nota (provas, listas, atividades etc.).  
- Registro e auditoria automática de alterações (via trigger no banco).  
- Cálculo automático de nota final (média simples ou ponderada).  
- Exportação das notas completas em CSV.  

# 2. Equipe

- **TIME 13 — Projeto Integrador II**  
- Integrantes: *(adicionar nomes aqui)*  
- Orientadores: *Renata Arantes*

# 3. Tecnologias Utilizadas

### **Backend**
- Node.js (versão LTS)  
- TypeScript  
- Express.js  

### **Frontend**
- HTML5  
- CSS3  
- Bootstrap (opcional, porém recomendado)

### **Banco de Dados**
- Oracle Autonomous Database
- Conexão via **Oracle Instant Client** + **Wallet**

### **Ferramentas**
- VS Code  
- Git e GitHub (obrigatório)  
- GitHub Projects para apontamento de esforço  


# 4. Como executar o projeto a partir do Release

A equipe disponibiliza uma Release no GitHub.
Siga as orientações abaixo para baixar, configurar e executar o NotaDez localmente.

# 4.1. Baixar o Release

1. Acesse a página do repositório no GitHub.  
2. Clique em **Releases**.  
3. Baixe o arquivo `.zip` ou `.tar.gz` referente à versão **1.0.0-final**.  
4. Extraia o conteúdo em uma pasta de sua preferência.

# 4.2. Pré-requisitos obrigatórios antes da execução

O ambiente deve estar configurado corretamente para que o sistema funcione:

# Necessário instalar
- **Node.js LTS (última versão)**  
- **Oracle Instant Client**  
- **SQL+ (SQLPlus)**  
- **Git**

# Variáveis de ambiente obrigatórias
- O **Oracle Instant Client** precisa estar no `PATH`.  
- O **Wallet** do seu banco Oracle deve estar no `PATH` ou com o caminho configurado no `tnsnames.ora`.  
- As bibliotecas do Oracle devem estar acessíveis via:
  - `PATH` (Windows)
  - `DYLD_LIBRARY_PATH` (macOS)
  - `LD_LIBRARY_PATH` (Linux)

# Criar e configurar o arquivo `.env`

Dentro da pasta do projeto, crie o arquivo:

No arquivo .env, escreva o caminho para o wallet e o instant client:
```env
# Caminho para a pasta onde o Wallet foi extraído
ORACLE_WALLET_PATH=/caminho/para/seu/wallet

# Caminho para a pasta do Oracle Instant Client
ORACLE_INSTANT_CLIENT_PATH=/caminho/para/seu/instantclient
```

# Rede / Firewall
- A **porta 1522** deve estar liberada para comunicação com o banco Oracle.

# 4.3. Instalar dependências do projeto

Dentro da pasta extraída do Release, execute:

```bash
npm install

# Instalação das Dependências

```bash
npm install
npm run dev
npm run build
npm run start

```
abra o localhost:3000/ na sua máquina
