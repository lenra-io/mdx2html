import esbuild from 'esbuild'
import mdx from '@mdx-js/esbuild'
import fs from 'fs';
import path from "path";
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import components from './components/index.js'
import { fileURLToPath } from 'url';


let __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);


export function bulkBuild(fileMaps, out) {
    let outdir = path.resolve(process.cwd(), out)
    let buildOutdir = path.resolve(outdir, 'tmp')

    let transformedFileMap = fileMaps.map(e => {
        return {
            ...e,
            compiled: path.resolve(buildOutdir, (e.relPath || e.source).replace(/\.[^/.]+$/, ".js"))
        }
    })

    build(transformedFileMap, buildOutdir).then(() => {
        return saveHtml(transformedFileMap)
    }).then(() => {
        fs.rmSync(buildOutdir, { recursive: true, force: true });
    })
}

async function saveHtml(fileMaps) {
    let promises =
        fileMaps.map(async (file) => {
            fs.mkdir(path.dirname(file.target), { recursive: true }, (err) => {
                if (err) console.log(err)
            })
            let mod = await import(file.compiled)
            let json = mod.json || { "title": "None" }
            const html = toHtml(mod.default, file.props)

            console.log("Writing", file.target)
            fs.writeFile(
                file.target,
                html,
                err => {
                    if (err) {
                        console.error(err)
                        return
                    }
                }
            )

            fs.writeFile(
                file.target + ".json",
                JSON.stringify(json),
                err => {
                    if (err) {
                        console.error(err)
                        return
                    }
                }
            )

        })
    return Promise.all(promises);
}

function build(fileMaps, buildOutdir) {

    fs.mkdir(buildOutdir, { recursive: true }, (err) => {
        if (err) {
            console.error(err)
            return
        }
    })

    let sources = fileMaps.map(e => e.source)
    console.log("Building files...")
    return esbuild.build({
        entryPoints: sources,
        bundle: true,
        format: "esm",
        outdir: buildOutdir,
        platform: 'node',
        plugins: [mdx({})],
        inject: [path.resolve(__dirname, './react-shim.js')],
    }).catch((e) => {
        console.log(e);
        process.exit(1)
    })
}

function toHtml(mdx, props) {
    return ReactDOMServer.renderToStaticMarkup(
        React.createElement(mdx, { ...props, components: components })
    )
}