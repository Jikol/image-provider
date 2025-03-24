import express, { Router } from "express";

import { imagesV1Router, uploadV1Router } from "@/router";

import config from "/config";

const versionedRouters: Router = express.Router();

versionedRouters.use(config.API_BASE_PATH, imagesV1Router);
versionedRouters.use(config.API_BASE_PATH, uploadV1Router);

export { versionedRouters };
