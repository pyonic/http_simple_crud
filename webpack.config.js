const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: "node",
  entry: {
    app: ["./dist/index.js"]
  },
  output: {
    path: path.resolve(__dirname, "./bundle"),
    filename: "index.js"
  },
  externals: [nodeExternals()],
  mode: 'production'
};