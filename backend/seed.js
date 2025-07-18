// backend/seed.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Variáveis de ambiente
const MONGODB_URI = process.env.MONGODB_URI;

// Verificação da URI do MongoDB
if (!MONGODB_URI) {
    console.error('Erro: A variável MONGODB_URI não está definida no arquivo .env');
    process.exit(1);
}

// Definição dos Schemas e Modelos Mongoose (copiado do seu server.js)
const alunoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    Nome: { type: String, required: true },
    Apelido: { type: String, required: true },
    Curso: { type: String, required: true },
    Ano_Curricular: { type: String, required: true }
}, { collection: 'alunos' });

const Aluno = mongoose.model('Aluno', alunoSchema);

const cursoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    Nome: { type: String, required: true },
    Sigla: { type: String, required: true }
}, { collection: 'cursos' });

const Curso = mongoose.model('Curso', cursoSchema);

// Caminho para o seu db.json
const dbJsonPath = path.join(__dirname, '../mock-data', 'db.json');

async function seedDatabase() {
    try {
        // Conectar ao MongoDB
        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Conectado ao MongoDB com sucesso para seeding!');

        // Ler os dados do db.json
        const rawData = fs.readFileSync(dbJsonPath, 'utf8');
        const data = JSON.parse(rawData);

        // Limpar coleções existentes (opcional, mas bom para re-seeding)
        console.log('Limpando coleções existentes...');
        await Aluno.deleteMany({});
        await Curso.deleteMany({});
        console.log('Coleções limpas.');

        // Inserir alunos
        if (data.alunos && data.alunos.length > 0) {
            await Aluno.insertMany(data.alunos);
            console.log(`${data.alunos.length} alunos inseridos com sucesso.`);
        } else {
            console.log('Nenhum aluno para inserir do db.json.');
        }

        // Inserir cursos
        if (data.cursos && data.cursos.length > 0) {
            await Curso.insertMany(data.cursos);
            console.log(`${data.cursos.length} cursos inseridos com sucesso.`);
        } else {
            console.log('Nenhum curso para inserir do db.json.');
        }

    } catch (err) {
        console.error('Erro durante o processo de seeding:', err.message);
        process.exit(1);
    } finally {
        // Desconectar do MongoDB
        await mongoose.disconnect();
        console.log('Desconectado do MongoDB.');
    }
}

// Executar o script de seeding
seedDatabase();
