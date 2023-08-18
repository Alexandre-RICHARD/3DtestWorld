const webpack = require('webpack');
const path = require("path");
// Pour vider le dossier de build lors d'un nouveau build ou d'un npm start
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// Utiliser pour copier des fichier stockés dans public dans le dossier de build
const CopyWebpackPlugin = require("copy-webpack-plugin");
// Afin que le css soit dans un fichier indépendant des fichiers js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// Plugin censé réduire la taille des fichiers CSS compilés
const TerserPlugin = require("terser-webpack-plugin");
// Plugin censé réduire la taille des fichiers CSS compilés
const OptimizeCSSAssetsPlugin = require("css-minimizer-webpack-plugin");
// Afin d'indiquer les fichiers de départ qui seront utilisé dans la compilation, ici index.html et son favicon
const HtmlWebpackPlugin = require("html-webpack-plugin");
// Plugin qui ouvrira un onglet à chaque run/build pour montrer la taille des différents package dans les fichiers compilé et aider à mieux les gérer
const BundleAnalyzerPlugin =
    require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const port = 8001;

// Ici on créé les variables défini pour le développement mais qui seront changés si on est en production
let mode = "development";
let filename = "index.html";
let publicPath = "/";
let devtool = "inline-source-map";
let performance = {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
};

// Si on est en production, les variables ci-desosus sont modifiées
if (process.env.NODE_ENV === "production") {
    mode = "production";
    filename = "/html/index.html";
    publicPath = "../";
    devtool = false;
    performance.hints = "warning";
}

module.exports = {
    mode: mode,
    // Les deux points d'entrées de l'application (SCSS et JS)
    entry: ["./src/styles/index.scss", "./src/index.js"],
    performance: performance,
    devtool: devtool,
    devServer: {
        // Pour que l'onglet localhost:8000 s'ouvre automatiquement à chaque npm run start
        open: true,
        historyApiFallback: true,
        port,
        static: "./.build",
        hot: true,
    },
    // On indique le point de sortie/de création des fichiers. Ici ./.build
    output: {
        path: path.resolve(__dirname, ".build"),
        publicPath: publicPath,
        filename: "js/[name].[contenthash].js",
        assetModuleFilename: "images/[hash][ext][query]",
    },
    resolve: {
        alias: {
            "@root": path.resolve(__dirname, ""),
            "@router": path.resolve(__dirname, "src/router"),
            "@src": path.resolve(__dirname, "src"),
            "@static": path.resolve(__dirname, "src/static"),
            "@store": path.resolve(__dirname, "src/store"),
            "@styles": path.resolve(__dirname, "src/styles"),
            "@views": path.resolve(__dirname, "src/views"),
        },
    },
    plugins: [
        // Pour configurer correctement Vue.JS
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: false,
            __VUE_PROD_DEVTOOLS__: true,
        }),
        // Pour vider le dossier de build lors d'un nouveau build ou d'un npm start
        new CleanWebpackPlugin(),
        // Afin d'indiquer les fichiers de départ qui seront utilisé dans la compilation, ici index.html et son favicon
        new HtmlWebpackPlugin({
            filename: filename,
            favicon: "./src/static/images/favicon.ico",
            template: "./src/index.html",
        }),
        // Utiliser pour copier des fichier stockés dans public dans le dossier de build
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "./public"),
                    to: "",
                },
            ],
        }),
        // Afin que le css soit dans un fichier indépendant des fichiers js
        new MiniCssExtractPlugin({
            filename: "css/[name].css",
        }),
        // Plugin qui ouvrira un onglet à chaque run/build pour montrer la taille des différents package dans les fichiers compilé et aider à mieux les gérer
        // new BundleAnalyzerPlugin(), //! Pour activer ou désactiver
    ],
    // Des plugins visant à améliorer la vitesse de compilation en plus d'en améliorer l'optimisation et la taille
    optimization: {
        minimizer: [
            // Plugin censé réduire la taille des fichiers CSS compilés
            new TerserPlugin({
                minify: TerserPlugin.esbuildMinify,
                terserOptions: {},
            }),
            // Plugin censé réduire la taille des fichiers CSS compilés
            new OptimizeCSSAssetsPlugin({}),
        ],
        runtimeChunk: "single",
        splitChunks: {
            chunks: "all",
        },
    },
    module: {
        rules: [
            // Javascript loader
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                        },
                    },
                ],
            },
            // Pas de loader pour les images, elles sont traités comme des assets, ce qui change leurs utilisations surtout pour les petites images transformées en base64 sinon
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: "asset",
            },
            // SCSS loader et autres loaders ainsi que l'utilisation du plugin permettant que le css soit dans un fichier indépendant des fichiers js
            {
                test: /\.(s?css)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../",
                        },
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            importLoaders: 3,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require("sass"),
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    },
};
