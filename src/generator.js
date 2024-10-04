// src/generator.js
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const ejs = require('ejs');

/**
 * Gera documentação em Markdown a partir das funções extraídas.
 * @param {Array} functions - Lista de funções extraídas.
 * @returns {string} - Documentação em Markdown.
 */
function generateMarkdown(functions) {
    console.log('Iniciando a geração de documentação em Markdown...');
    const md = new MarkdownIt();
    let documentation = `# Documentação Automatizada\n\n`;

    functions.forEach(func => {
        documentation += `## ${func.name}\n\n`;

        if (func.jsdoc) {
            // Processar o JSDoc
            const lines = func.jsdoc.split('\n').map(line => line.replace(/^\*+/, '').trim());
            const cleanedJsdoc = lines.join('\n');

            documentation += `${cleanedJsdoc}\n\n`;
        } else {
            documentation += `*Sem documentação disponível.*\n\n`;
        }
    });

    console.log('Documentação em Markdown gerada.');
    return documentation;
}

/**
 * Gera documentação em HTML a partir das funções extraídas.
 * @param {Array} functions - Lista de funções extraídas.
 * @returns {string} - Documentação em HTML.
 */
function generateHTML(functions) {
    console.log('Iniciando a geração de documentação em HTML...');
    const templatePath = path.join(__dirname, '..', 'templates', 'documentation.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const html = ejs.render(template, { functions });
    console.log('Documentação em HTML gerada.');
    return html;
}

module.exports = { generateMarkdown, generateHTML };
