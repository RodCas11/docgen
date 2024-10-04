/**
 * Divide dois números.
 * @param {number} a - Numerador.
 * @param {number} b - Denominador.
 * @returns {number} - Resultado da divisão.
 */
const divide = (a, b) => {
    if (b === 0) throw new Error('Divisão por zero!');
    return a / b;
}
