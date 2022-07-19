#! /usr/bin/env node
import path from "path";
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { bulkBuild } from "./build.js"

const yargBuilded = yargs(hideBin(process.argv));
yargBuilded.command("build <files...>", "Build the mdx to html", (yargs) => {
    return yargs.positional('files', {
        describe: 'mdx files to transform'
    })
}, (argv) => {

    let fileMaps = argv.files.map(mdx => {
        const basename = path.basename(mdx, path.extname(mdx))
        let target = path.join(argv.outdir, basename + ".html")
        return {
            source: mdx,
            target: target,
            props: {}
        }
    })

    bulkBuild(fileMaps, argv.outdir)
}).option('outdir', {
    alias: 'o',
    type: 'string',
    description: 'output directory for html files',
    default: "build"
}).parse()

