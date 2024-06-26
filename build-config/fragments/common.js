/**
 * @file common.js
 * @since 2.2.0
 */

const path = require('path');
const webpack = require('webpack');
const rootDir = path.resolve(__dirname, '..', '..');
const pckg = require(path.join(rootDir, 'package.json'));
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// enable logging of deprecation warnings stacktrace
process.traceDeprecation = true;
process.on('warning', (warning) => {
    console.log(warning.stack);
});

// inject JS version number
let jsVersionPlugin = new webpack.DefinePlugin({
    '__VERSION__': JSON.stringify(pckg.version)
});

// add CSS banner with version info
let cssBanner = `/*!
Default styles for ${pckg.name} ${pckg.version}
*/`;
let cssBannerPlugin = new webpack.BannerPlugin({
    banner: cssBanner,
    raw: true,
    test: /\.css$/
});

module.exports = {
    devtool: false,
    context: rootDir,
    output: {
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    performance: {
        hints: false
    },
    stats: {
        colors: true
    },
    resolve: {
        // webpack < 5 used to include polyfills for node.js core modules by default.
        // This is no longer the case; enable required polyfills here.
        fallback: {
            // used for ts-ebml plugin, see https://github.com/legokichi/ts-ebml/issues/25
            'buffer': require.resolve('buffer/')
        },
        alias: {
            // used for ts-ebml plugin, see https://github.com/legokichi/ts-ebml/issues/48
            ebml: 'ebml/lib/ebml.esm.js'
        }
    },
    // specify dependencies for the library that are not resolved by webpack,
    // but become dependencies of the output: they are imported from the
    // environment during runtime and never directly included in the
    // videojs-record library
    externals: {
        'video.js': {
            commonjs: 'video.js',
            commonjs2: 'video.js',
            amd: 'video.js',
            root: 'videojs' // indicates global variable
        },
        'wavesurfer.js': {
            commonjs: 'wavesurfer.js',
            commonjs2: 'wavesurfer.js',
            amd: 'wavesurfer.js',
            root: 'WaveSurfer' // indicates global variable
        },
        'recordrtc': {
            commonjs: 'recordrtc',
            commonjs2: 'recordrtc',
            amd: 'recordrtc',
            root: 'RecordRTC' // indicates global variable
        }
    },
    module: {
        rules: [
            {
                // javascript
                test: /\.js$/,
                include: path.resolve(rootDir, 'src', 'js'),
                exclude: /(node_modules|bower_components|test)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        comments: false
                    }
                }
            },
            {
                // scss -> css
                test: /\.scss$/,
                include: path.resolve(rootDir, 'src', 'css'),
                exclude: /(node_modules|bower_components|test)/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                // fonts
                test: /\.woff2?$|\.ttf$|\.svg$/,
                exclude: /(node_modules|bower_components|test)/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        // byte limit to inline files as Data URL
                        limit: 1000,
                        name: '../fonts/[name].[ext]',
                        emitFile: false
                    }
                }]
            }
        ]
    },
    plugins: [
        jsVersionPlugin,
        cssBannerPlugin
    ]
};
