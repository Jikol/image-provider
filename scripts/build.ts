console.log("Building for production...");

const result = await Bun.build({
  entrypoints: ["src/app.ts"],

  compile: {
    target: "bun-linux-x64",
    outfile: "dist/app"
  },
  minify: true,
  sourcemap: "linked",
  bytecode: true
});

if (!result.success) {
  console.error(result.logs);
  process.exit(1);
}

console.log("Built successfully!");

export {};
