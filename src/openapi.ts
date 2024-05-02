import fs from "fs";
import path from "path";

import config from "@/config";
import logger from "@/logger";

const generateOpenAPI = (): void => {
  if (fs.existsSync(path.join(config.APISCHEMA_DIR, "openapi.json"))) return;

  // language=JSON
  const docs = `
    {
      "openapi": "3.0.0",
      "info": {
        "title": "Image Provider",
        "version": "${config.VERSION}",
        "description": "API for uploading and serving images for Retina API"
      },
      "servers": [
        {
          "url": "http://${config.HOSTNAME}:${config.PORT}${config.BASE_PATH}"
        }
      ],
      "paths": {
        "/uploads": {
          "post": {
            "summary": "Upload array of images",
            "requestBody": {
              "required": true,
              "content": {
                "multipart/form-data": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "file": {
                        "type": "array",
                        "items": {
                          "type": "string",
                          "format": "binary"
                        }
                      }
                    }
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "File Uploaded Successfully",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "imageUrls": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              },
              "400": {
                "description": "Bad Request",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "context": {
                          "type": "object",
                          "properties": {
                            "message": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "413": {
                "description": "Payload Too Large",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "context": {
                          "type": "object",
                          "properties": {
                            "message": {
                              "type": "string"
                            },
                            "maxFileSize": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "415": {
                "description": "Unsupported Media Type",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "context": {
                          "type": "object",
                          "properties": {
                            "message": {
                              "type": "string"
                            },
                            "allowedMimeTypes": {
                              "type": "array",
                              "items": {
                                "type": "string"
                              }
                            },
                            "expectedFormId": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/images": {
          "get": {
            "summary": "List uploaded images",
            "responses": {
              "200": {
                "description": "List of images"
              }
            }
          }
        },
        "/images/{imageName}": {
          "get": {
            "summary": "Get image by name",
            "parameters": [
              {
                "name": "imageName",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "string"
                },
                "description": "name of the image"
              }
            ],
            "responses": {
              "200": {
                "description": "Image details"
              },
              "404": {
                "description": "Image not found"
              }
            }
          }
        }
      }
    }
  `;

  fs.writeFile(path.join(config.APISCHEMA_DIR, "openapi.json"), docs, "utf8", (err) => {
    if (!err) {
      logger.info("OpenAPI docs generated successfully!");

      return;
    }

    logger.error(err.message);
  });
};

export { generateOpenAPI };
