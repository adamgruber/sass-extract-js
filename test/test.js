const path = require('path');
const sassExtract = require('sass-extract');
const createPlugin = require('../lib/plugin');

const testfiles = {
  basic: path.resolve(__dirname, './sass/test-basic.scss'),
  camel: path.resolve(__dirname, './sass/test-opts-camel.scss'),
  sassOpts: path.resolve(__dirname, './sass/test-opts-sass.scss'),
  import: path.resolve(__dirname, './sass/test-import.scss'),
  empty: path.resolve(__dirname, './sass/test-empty.scss'),
};

const getVars = (file, compileOpts = {}, plugin) =>
  sassExtract.renderSync(
    Object.assign({}, { file }, compileOpts),
    { plugins: [plugin || path.resolve('../sass-extract-js')] },
  ).vars;

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

  it('should handle file with no variables', () => {
    expect(getVars(testfiles.empty)).toMatchSnapshot();
  });

  it('should pass sass options through', () => {
    const opts = {
      includePaths: [path.join(__dirname, 'sass', 'nested')],
    };
    expect(getVars(testfiles.sassOpts, opts)).toMatchSnapshot();
  });

  describe('options', () => {
    const shouldNotConvert = pluginInst => (
      it('should NOT convert keys to camelCase', () => {
        expect(getVars(testfiles.camel, null, pluginInst)).toMatchSnapshot();
      })
    );

    describe('plugin instance with options', () => {
      const inst = createPlugin({ camelCase: false });
      shouldNotConvert(inst);
    });

    describe('plugin instance without options', () => {
      const inst = {
        plugin: createPlugin(),
        options: { camelCase: false },
      };
      shouldNotConvert(inst);
    });

    describe('plugin name', () => {
      const inst = {
        plugin: path.resolve('../sass-extract-js'),
        options: { camelCase: false },
      };
      shouldNotConvert(inst);
    });
  });
});
