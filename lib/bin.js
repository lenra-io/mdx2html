#! /usr/bin/env node
import fs from "fs";
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

    let fileMaps = argv.files.flatMap(file => listFiles(file).map(source => {
        return {
            source,
            relPath: file != source ? path.relative(file, source) : file
        }
    }))
        .map(({ source, relPath }) => {
            let target = path.join(argv.outdir, relPath.replace(new RegExp(`\\.${path.extname(source)}$`), ".html"));
            return {
                source,
                relPath,
                target,
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

/**
 * List all files
 * @param {string} file 
 * @returns string[]
 */
function listFiles(file) {
    const infos = fs.lstatSync(file);
    if (infos.isDirectory()) {
        return fs.readdirSync(file).flatMap(f => listFiles(path.join(file, f)));
    }
    return [file];
}
