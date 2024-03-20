const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Bloom API document",
    description: "프론트를 위한 API document 😘",
  },
  host: "3.36.116.225",
  tags: [
    {
      name: "Users",
      description: "유저",
    },
    {
      name: "Search",
      description: "검색",
    },
    {
      name: "Chat",
      description: "챗봇",
    },
  ],
};

const outputFile = "./swagger-output.json";
const routes = ["../app.js"];

swaggerAutogen(outputFile, routes, doc);
