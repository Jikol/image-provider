import path from "path";
import { build, BuildOptions } from "esbuild";

const projectRoot = path.resolve(__dirname);
const options: BuildOptions = {
  bundle: true,
  platform: "node",
  target: ["node21.0"],
  entryPoints: [path.resolve(projectRoot, "src/app.ts")],
  format: "cjs",
  minify: true,
  sourcemap: true,
  outfile: path.resolve(projectRoot, "dist/index.js")
};

(async (): Promise<void> => {
  console.info("Building...");
  await build(options)
    .then((): void => {
      console.info("Builded successfully");
      process.exit(0);
    })
    .catch((): void => {
      console.error("Build failed");
      process.exit(1);
    });
})();
