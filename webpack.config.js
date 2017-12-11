var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    target: "web",
    node:{
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false
    },
    devtool: 'source-map',
    entry: ['./js/buildCss.js', './js/main.ts'],
    module: {
        loaders: [
            {
                test: /\.png$/,
                loader: 'url-loader?limit=10000'
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            {
                test: /\.(scss|sass)$/,
                loader: ExtractTextPlugin.extract( 'style', 'css?sourceMap!sass?sourceMap' )
            }
        ]
    },
    output: {
        filename: './js/app.js'
    },
    plugins: [ new ExtractTextPlugin('./css/app.css') ],
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js'],
        modulesDirectories: ['node_modules', 'bower_components', 'js']
    },
    sassLoader: {
        includePaths: [ './css' ]
    }
};
