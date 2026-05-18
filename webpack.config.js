const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
  const target = env.target || 'chrome';
  const isProduction = env.production || false;

  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'inline-source-map',

    entry: {
      'background/service-worker': './src/background/service-worker.ts',
      'content/linkedin-content': './src/content/linkedin-content.ts',
      'popup/popup': './src/popup/popup.ts',
      'options/options': './src/options/options.ts'
    },

    output: {
      path: path.resolve(__dirname, `dist/${target}`),
      filename: '[name].js',
      clean: true
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },

    resolve: {
      extensions: ['.ts', '.js']
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: 'src/manifest.json',
            to: 'manifest.json',
            transform(content) {
              const manifest = JSON.parse(content.toString());

              // Firefox-specific adjustments
              if (target === 'firefox') {
                manifest.browser_specific_settings = {
                  gecko: {
                    id: 'linkedin-assistant@example.com'
                  }
                };
              }

              return JSON.stringify(manifest, null, 2);
            }
          },
          {
            from: 'src/assets',
            to: 'assets',
            noErrorOnMissing: true
          }
        ]
      }),
      new HtmlWebpackPlugin({
        template: 'src/popup/popup.html',
        filename: 'popup/popup.html',
        chunks: ['popup/popup']
      }),
      new HtmlWebpackPlugin({
        template: 'src/options/options.html',
        filename: 'options/options.html',
        chunks: ['options/options']
      })
    ]
  };
};
