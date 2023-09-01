/** @type {import('next').NextConfig} */
const keys = require("./private.key.js");
const websiteSetting = require("./website.config.js");

const nextConfig = {
  // reactStrictMode: true,
  async headers() {
    return [{
      // matching all API routes
      source: "/api/:path*",
      headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
      ]
    }];
  },
  env: {
    ENABLE_STYLE_LOG: false,
    ENABLE_EVENT_LOG: true,
    PARSE_SERVER_URL: "https://parseapi.back4app.com",
    PARSE_APPLICATION_ID: "0z7MPWat3Ie4pKJzs48lIif1Vfs6tT90OdEm8iJU",
    PARSE_REST_API_KEY: "euhIL8u7nsu70Oh0Nq2UjkMyouE32OfzS41lBE4U",
    ...keys,
    ...websiteSetting
  }
};

module.exports = nextConfig
