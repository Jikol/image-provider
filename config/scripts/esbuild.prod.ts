import { BuildOptions, build } from "esbuild";
import fs from "fs/promises";
import path from "path";

import config from "/config";
import log from "/logger";

const options: BuildOptions = {
  bundle: true,
  platform: "node",
  target: ["node21.0"],
  entryPoints: [
    { out: "index", in: path.join(config.ROOT_PATH, "src/app.ts") },
    {
      out: "public/style",
      in: path.join(config.ROOT_PATH, "node_modules/serve-index/public/style.css")
    },
    {
      out: "public/directory",
      in: path.join(config.ROOT_PATH, "node_modules/serve-index/public/directory.html")
    },
    {
      out: "public/icons/image",
      in: path.join(config.ROOT_PATH, "node_modules/serve-index/public/icons/image.png")
    },
    {
      out: "static/redoc",
      in: path.join(config.ROOT_PATH, "static/redoc.html")
    }
  ],
  entryNames: "[dir]/[name]",
  loader: { ".html": "copy", ".png": "copy" },
  format: "cjs",
  minify: true,
  sourcemap: true,
  treeShaking: true,
  outdir: path.join(config.ROOT_PATH, "dist")
};

const copyFiles: Array<Record<"src" | "dest", string>> = [
  {
    src: path.join(config.ROOT_PATH, "docs/openapi.json"),
    dest: path.join(options.outdir as string, "docs/openapi.json")
  }
];

(async (): Promise<void> => {
  log.debug("Building...");
  await build(options)
    .then(async (): Promise<void> => {
      log.debug("Copying static files...");
      for (const file of copyFiles) {
        await fs.mkdir(path.dirname(file.dest), { recursive: true });
        await fs.copyFile(file.src, file.dest);
      }
      log.debug("Builded successfully");
      process.exit(0);
    })
    .catch((err): void => {
      log.error("Build failed");
      log.error(err);
      process.exit(1);
    });
})();
