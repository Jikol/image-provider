import express, { Router } from "express";

import config from "@/config";
import { imagesV1, uploadV1 } from "@/router";

const versionedRouters: Router = express.Router();

versionedRouters.use(`${config.BASE_PATH}`, imagesV1);
versionedRouters.use(`${config.BASE_PATH}`, uploadV1);

export { versionedRouters };
