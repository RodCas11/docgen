// src/parser.js
const fs = require('fs');
const esprima = require('esprima');

/**
 * Analisa um arquivo JavaScript e extrai funções com seus comentários JSDoc.
 * @param {string} filePath - Caminho para o arquivo JavaScript.
 * @returns {Array} - Lista de funções extraídas.
 */
function parseFile(filePath) {
    console.log(`Parsing file: ${filePath}`);
    const code = fs.readFileSync(filePath, 'utf-8');

    // Parse o código com comentários e localizações
    const ast = esprima.parseModule(code, {
        comment: true,
        loc: true,
        range: true,
        tokens: true
    });

    const comments = ast.comments;

    // Ordenar os comentários por posição
    comments.sort((a, b) => a.loc.start.line - b.loc.start.line);

    const functions = [];

    // Função para encontrar o JSDoc mais próximo antes de uma linha
    const findJsDoc = (line) => {
        // Procurar o último comentário que termina antes da linha
        for (let i = comments.length - 1; i >= 0; i--) {
            const comment = comments[i];
            if (comment.loc.end.line < line) {
                // Verificar se é um JSDoc
                if (comment.type === 'Block' && comment.value.startsWith('*')) {
                    return comment.value;
                }
                break;
            }
        }
        return null;
    };

    // Percorrer a AST para encontrar funções
    const walk = (node, parent) => {
        if (!node) return;

        if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
            const name = node.id ? node.id.name : (parent && parent.type === 'VariableDeclarator' ? parent.id.name : 'anonymous');
            const loc = node.loc;

            // Encontrar o JSDoc mais próximo antes da linha de início da função
            const jsdoc = findJsDoc(loc.start.line);

            functions.push({
                name,
                loc,
                jsdoc
            });
        }

        for (let key in node) {
            if (node.hasOwnProperty(key)) {
                const child = node[key];
                if (Array.isArray(child)) {
                    child.forEach(c => walk(c, node));
                } else if (typeof child === 'object' && child !== null) {
                    walk(child, node);
                }
            }
        }
    };

    walk(ast, null);
    console.log(`Funções extraídas do arquivo ${filePath}: ${functions.length}`);
    return functions;
}

module.exports = { parseFile };
