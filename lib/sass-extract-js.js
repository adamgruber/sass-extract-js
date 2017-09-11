const camelCase = require('camel-case');

/*
 * Add escaped quotes around font names other than the generic CSS font families
 * While quotes are not required, they are recommended by the spec
 * https://www.w3.org/TR/css-fonts-3/#generic-font-families
 *
 * @param {string} str Font family name
 *
 * @return {string}
 */
function quoteFontName(str) {
  const genericFonts = [
    'serif',
    'sans-serif',
    'cursive',
    'fantasy',
    'monospace',
  ];
  return genericFonts.includes(str.toLowerCase()) ? str : `'${str}'`;
}

/*
 * Get the CSS value from a sass-extract data structure
 * https://github.com/jgranstrom/sass-extract#general-variable-value-structure
 *
 * @param {object}  sassVar    Abstract data structure for SASS variable
 *
 * @return {string|int} CSS value
 */
function getSassValue(sassVar) {
  const { type, value } = sassVar;
  switch (type) {
    case 'SassNumber':
      return sassVar.unit ? `${value}${sassVar.unit}` : value;

    case 'SassColor': {
      const { r, g, b, a } = value;
      const hasAlpha = a !== 1;
      return hasAlpha
        ? `rgba(${r.toFixed()}, ${g.toFixed()}, ${b.toFixed()}, ${a})`
        : `rgb(${r.toFixed()}, ${g.toFixed()}, ${b.toFixed()})`;
    }

    case 'SassList': {
      const isStringList = value.every(item => item.type === 'SassString');
      const newList = value.map(getSassValue);
      return isStringList
        ? newList.map(quoteFontName).join(', ')
        : newList.join(' ');
    }

    case 'SassMap':
      return transformStyles(value);

    default:
      return value;
  }
}

/*
 * Transform style object key
 * - Strip leading '$'
 * - Convert to camelCase
 *
 * @param {string} key Style object key
 *
 * @return {string} Converted key
 */
function transformKey(key) {
  const newKey = key.replace('$', '');
  return camelCase(newKey, null, true);
}

/*
 * Reduce SASS-compiled styles object into theme object
 *
 * @param {object} stylesObj Output from `sass-extract` render
 *
 * @return {object} Transformed styles object
 */
function transformStyles(stylesObj) {
  return Object.keys(stylesObj).reduce((acc, key) => {
    const newKey = transformKey(key);
    const newVal = getSassValue(stylesObj[key]);
    acc[newKey] = newVal;
    return acc;
  }, {});
}

/*
 * Define plugin to convert SASS variables to JS object
 *
 * @return {object} Transformed styles object
 */
const sassExtractJs = {
  run: () => ({
    postExtract: extractedVariables => transformStyles(extractedVariables.global),
  }),
};

module.exports = sassExtractJs;
