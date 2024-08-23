module.exports = {
  apps: [
    {
      name: "sync-service",
      script: "./sync.js",
      watch: true,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};