import { execFileSync } from "child_process";
import { BuildOptions, build } from "esbuild";
import path from "path";

const projectRoot = path.resolve(process.cwd());
const options: BuildOptions = {
  bundle: true,
  platform: "node",
  target: ["node21.0"],
  entryPoints: [
    { out: "index", in: path.resolve(projectRoot, "src/app.ts") },
    {
      out: "public/style",
      in: path.resolve(projectRoot, "node_modules/serve-index/public/style.css")
    },
    {
      out: "public/directory",
      in: path.resolve(projectRoot, "node_modules/serve-index/public/directory.html")
    },
    {
      out: "public/icons/image",
      in: path.resolve(projectRoot, "node_modules/serve-index/public/icons/image.png")
    }
  ],
  entryNames: "[dir]/[name]",
  loader: { ".html": "copy", ".png": "copy" },
  format: "cjs",
  minify: true,
  sourcemap: true,
  treeShaking: true,
  outdir: path.resolve(projectRoot, "dist")
};

(async (): Promise<void> => {
  console.info("Building...");
  await build(options)
    .then((): void => {
      try {
        execFileSync("ts-node", ["src/scripts/generateDocs.ts"], { stdio: "inherit" });
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
      console.info("Builded successfully");
      process.exit(0);
    })
    .catch((): void => {
      console.error("Build failed");
      process.exit(1);
    });
})();
