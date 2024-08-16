import express, { Router } from "express";

import config from "@/config";
import { imagesV1Router, uploadV1Router } from "@/router";

const versionedRouters: Router = express.Router();

versionedRouters.use(`${config.BASE_PATH}`, imagesV1Router);
versionedRouters.use(`${config.BASE_PATH}`, uploadV1Router);

export { versionedRouters };
