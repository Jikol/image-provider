import express, { Router } from "express";

import config from "@/config";
import { images as imagesV1, upload as uploadV1 } from "@/router";

const versionedRouters: Router = express.Router();
const versionedPaths = [`${config.BASE_PATH}/v1`];

versionedRouters.use(versionedPaths[0], imagesV1);
versionedRouters.use(versionedPaths[0], uploadV1);

export { versionedRouters, versionedPaths };
