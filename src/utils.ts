const resolveMatchesRoute = (routePath: string, reqPath: string): boolean =>
  new RegExp(`^${routePath.replace(/:([^/]+)/g, "[^/]+")}$`).test(reqPath);

export { resolveMatchesRoute };
