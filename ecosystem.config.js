module.exports = {
  apps: [
    {
      name: "app",
      script: "./dist/main.js",
      cwd: "./apps/server",
      args: "start"
    },
  ],
};
