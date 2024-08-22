// Initialize the configuration for the sync service
module.exports = {
  localFolder: "D://",
  email : "paulchasseuil@hotmail.fr",
  apiBaseUrl: "https://balldontlie.fr/pbox/api",
  authToken: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJpYXQiOjE2MjYwNjYwNzJ9.1",
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  defaultFolderId: 1225,
  pollingInterval: 5 * 1000 * 60, // 5 minutes
};