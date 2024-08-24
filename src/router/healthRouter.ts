import express, { Router } from "express";
import path from "path";

import config from "@/config";
import { request } from "@/middleware";

const healthRouter: Router = express.Router();
const healthPaths = {
  healt: path.join(config.API_BASE_PATH, "health")
};

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Checks if the API is up and functional.
 *     responses:
 *       '200':
 *         description: API is up and functional.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API is up and functional
 *       '500':
 *         description: Internal server error.
 */
healthRouter.all(healthPaths.healt, request(["GET"]), (_req, res) => {
  res.success({
    message: "API is up and functional"
  });
});

export { healthRouter, healthPaths };
