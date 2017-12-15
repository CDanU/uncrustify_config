const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractSass = new ExtractTextPlugin("css/app.css");
const extractCSS = new ExtractTextPlugin("css/app.css");

module.exports = {
    entry: ['./js/buildCss.js', './js/main.ts'],
    output:
    {
        filename: './js/app.js',
    },
    module:
    {
        rules:
        [
            {
                test: /\.png$/,
                use: [{
                    loader: 'url-loader',
                    options:
                    {
                        limit: 10000,
                    },
                }],
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
            {
                test: /\.css$/,
                use: extractCSS.extract({
                    use:
                    [{
                        loader: "css-loader"
                    }],
                    fallback: "style-loader"
                }),
            },
            {
                test: /\.(scss|sass)$/,
                use: extractSass.extract({
                    use:
                    [
                        {
                            loader: "css-loader"
                        },
                        {
                            loader: "sass-loader"
                        }
                    ],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },
        ],
    },
    plugins: [extractSass],
    resolve:
    {
        extensions: ['.ts', '.js'],
        modules:
        [
            'node_modules',
            'bower_components',
            'js',
        ],
    },
    target: "web",
    node:
    {
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false
    },
    devtool: 'source-map',
};
