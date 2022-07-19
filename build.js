import esbuild from 'esbuild'
import fs from "fs"
import glob from 'glob'
glob("lib/**/*.{js,jsx}", {}, function (er, files) {
    esbuild.build({
        entryPoints: files,
        bundle: false,
        outdir: 'dist',
        platform: "node",
        inject: ['lib/react-shim.js']
    }).catch((e) => {
        console.log(e);
        process.exit(1)
    })
})
