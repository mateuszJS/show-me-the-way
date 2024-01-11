const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  devtool: "eval-source-map",
  devServer: {
    static: "./dist",
  },
  resolve: {
    extensions: [".ts", ".js", ".wgsl", ".jpg", ".png", ".svg"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    /* useful with absolute imports, "src" dir now takes precedence over "node_modules",
    otherwise you got an error:
    Requests that start with a name are treated as module requests and resolve within module directories (node_modules).
    */
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(wgsl|svg)$/,
        type: "asset/source",
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        type: "asset/resource",
      },
    ],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  optimization: {
    runtimeChunk: "single",
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Show Me The Way",
      template: path.resolve(__dirname, "src/index.html"),
    }),
  ],
};
