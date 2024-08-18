import express, { Router } from "express";

import { imagesV1Router, uploadV1Router } from "@/router";

const versionedRouters: Router = express.Router();

versionedRouters.use(imagesV1Router);
versionedRouters.use(uploadV1Router);

export { versionedRouters };
