#!/usr/bin/env node

// src/cli.js
const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { parseFile } = require('./parser');
const { generateMarkdown, generateHTML } = require('./generator');
const glob = require('glob'); // Importação correta para glob v7.x

program
    .version('1.1.0') // Atualize a versão conforme necessário
    .description('Ferramenta de Documentação Automatizada');

program
    .command('generate <input>')
    .description('Gera documentação a partir de arquivos ou diretórios JavaScript')
    .option('-o, --output <output>', 'Diretório de saída', './docs')
    .option('-f, --format <format>', 'Formato da documentação (markdown, html)', 'markdown')
    .action((input, options) => {
        console.log('Iniciando o processo de geração de documentação...');
        const inputPath = path.resolve(process.cwd(), input);
        const outputDir = path.resolve(process.cwd(), options.output);
        const format = options.format.toLowerCase();

        console.log(`Caminho de entrada: ${inputPath}`);
        console.log(`Diretório de saída: ${outputDir}`);
        console.log(`Formato escolhido: ${format}`);

        if (!fs.existsSync(inputPath)) {
            console.error(`Erro: Entrada ${inputPath} não encontrada.`);
            process.exit(1);
        }

        // Criar diretório de saída se não existir
        if (!fs.existsSync(outputDir)) {
            console.log(`Criando diretório de saída: ${outputDir}`);
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Determinar se é um arquivo ou diretório
        let pattern = '';
        if (fs.lstatSync(inputPath).isFile()) {
            // Se for um arquivo, verificar se é .js
            if (path.extname(inputPath) !== '.js') {
                console.error('Erro: A ferramenta suporta apenas arquivos JavaScript (.js).');
                process.exit(1);
            }
            pattern = inputPath;
            console.log(`Processando arquivo único: ${pattern}`);
        } else if (fs.lstatSync(inputPath).isDirectory()) {
            // Se for um diretório, buscar recursivamente todos os arquivos .js
            pattern = path.join(inputPath, '**/*.js');
            console.log(`Processando diretório. Padrão de busca: ${pattern}`);
        } else {
            console.error('Erro: Entrada inválida. Forneça um arquivo ou diretório JavaScript.');
            process.exit(1);
        }

        // Usar glob para encontrar arquivos
        console.log('Buscando arquivos JavaScript...');
        glob(pattern, (err, files) => {
            if (err) {
                console.error('Erro ao buscar arquivos:', err);
                process.exit(1);
            }

            console.log(`Arquivos encontrados: ${files.length}`);
            if (files.length === 0) {
                console.error('Erro: Nenhum arquivo JavaScript encontrado.');
                process.exit(1);
            }

            let allFunctions = [];

            files.forEach(file => {
                console.log(`Analisando arquivo: ${file}`);
                try {
                    const funcs = parseFile(file);
                    console.log(`Funções encontradas: ${funcs.length}`);
                    allFunctions = allFunctions.concat(funcs);
                } catch (parseError) {
                    console.error(`Erro ao analisar o arquivo ${file}:`, parseError.message);
                }
            });

            console.log(`Total de funções extraídas: ${allFunctions.length}`);

            if (allFunctions.length === 0) {
                console.warn('Aviso: Nenhuma função encontrada para documentar.');
                process.exit(0);
            }

            let documentation = '';
            let outputFile = '';

            if (format === 'markdown') {
                console.log('Gerando documentação em Markdown...');
                documentation = generateMarkdown(allFunctions);
                outputFile = path.join(outputDir, 'documentation.md');
            } else if (format === 'html') {
                console.log('Gerando documentação em HTML...');
                documentation = generateHTML(allFunctions);
                outputFile = path.join(outputDir, 'documentation.html');
            } else {
                console.error('Erro: Formato não suportado. Use "markdown" ou "html".');
                process.exit(1);
            }

            fs.writeFileSync(outputFile, documentation, 'utf-8');
            console.log(`Documentação gerada com sucesso em ${outputFile}`);
        });
    });

program.parse(process.argv);
