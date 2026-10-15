import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const sha='36642e509e9ad5485763904fcfc09b00d95cee3d';
const root=resolve(process.env.REACT_UI_OS_SOURCE || '.vendor-source');
if (!existsSync(root)) {
  execFileSync('git',['clone','https://github.com/saschb2b/react-ui-os.git',root],{stdio:'inherit'});
  execFileSync('git',['checkout',sha],{cwd:root,stdio:'inherit'});
}
if(execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()!==sha) throw new Error('Upstream revision mismatch');
mkdirSync('src/vendor',{recursive:true});
// Keep the upstream compositor and all its context providers in one bundle.
await build({stdin:{contents:`export * from '${root}/packages/core/src/index.ts'; export * from '${root}/packages/desktop/src/index.ts'; export * from '${root}/packages/theme-macos/src/index.ts';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,format:'esm',jsx:'automatic',minify:true,outfile:'src/vendor/react-ui-os.js',external:['react','react-dom','react/jsx-runtime'],alias:{'@react-ui-os/core':`${root}/packages/core/src/index.ts`}});
writeFileSync('src/vendor/react-ui-os.LICENSE',readFileSync(`${root}/LICENSE`));
