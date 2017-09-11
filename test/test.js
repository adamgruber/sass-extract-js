const path = require('path');
const sassExtract = require('sass-extract');
const js = require('../index');

const testfiles = {
  basic: path.resolve(__dirname, './sass/test-basic.scss'),
  camel: path.resolve(__dirname, './sass/test-opts-camel.scss'),
  sassOpts: path.resolve(__dirname, './sass/test-opts-sass.scss'),
  import: path.resolve(__dirname, './sass/test-import.scss'),
};

const getVars = (file, compileOpts = {}) =>
  sassExtract.renderSync(Object.assign({}, { file }, compileOpts), { plugins: [js] }).vars;

describe('sass-extract-js', () => {
  it('should convert basic SASS vars', () => {
    expect(getVars(testfiles.basic)).toMatchSnapshot();
  });

  it('should convert keys to camelCase', () => {
    expect(getVars(testfiles.camel)).toMatchSnapshot();
  });

  it('should handle imports', () => {
    expect(getVars(testfiles.import)).toMatchSnapshot();
  });

  it('should pass sass options through', () => {
    const opts = {
      includePaths: [path.join(__dirname, 'sass', 'nested')],
    };
    expect(getVars(testfiles.sassOpts, opts)).toMatchSnapshot();
  });
});
