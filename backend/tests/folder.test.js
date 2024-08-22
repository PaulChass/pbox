const request = require('supertest');
const app = require('../server'); // Assuming app is exported from server.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadFiles } = require('../controllers/fileController');
const authenticate = require('../middleware/auth');

// Mocking multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Mocking authenticate middleware
app.post('/api/folders/:folderId/upload', upload.array('files'), uploadFiles);

// Helper function to create a directory
const createUploadDir = (folderId) => {
  const uploadPath = path.join(__dirname, '..', 'uploads', folderId);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

// Clean up function to remove the directory after tests
const removeUploadDir = (folderId) => {
  const uploadPath = path.join(__dirname, '..', 'uploads', folderId);
  if (fs.existsSync(uploadPath)) {
    fs.rmdirSync(uploadPath, { recursive: true });
  }
};

describe('POST /api/folders', () => {
  it('should create a new folder', async () => {
    const res = await request(app)
      .post('/api/folders/')
      .send({
        name: 'testFolder',
        parent_id: 17,
        email: 'o@o.o'
      });
    expect(res.statusCode).toEqual(201);
  });

  it('should get the existing folder', async () => {
    // add authentication token to the request
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzIzODgzNzUwLCJleHAiOjE3MjQ0ODg1NTB9.bytdVKcvOa1oXHH89ED018ufrnkyZp1PHL-TM_voV_c';
    const res = await request(app)
      .get('/api/folders/17')
      .set('Authorization', `Bearer ${token}`);
    
    console.log(res.body); // Log the response body to inspect its structure
  
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  describe('Upload Files API', () => {
    it('should upload files successfully', async () => {
      const folderId = 17; // Replace with a valid folder ID for testing
      const filePath1 = path.join(__dirname, 'test_files', 'test_file_1.txt'); // Path to your test file 1
      const filePath2 = path.join(__dirname, 'test_files', 'test_file_2.txt'); // Path to your test file 2

      const response = await request(app)
        .post(`/api/folders/${folderId}/upload`)
        .attach('files', fs.readFileSync(filePath1), 'test_file_1.txt')
        .attach('files', fs.readFileSync(filePath2), 'test_file_2.txt');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Files uploaded and saved successfully');
    });
  });

  afterAll(async () => {
    // Clean up any resources if needed
  });
});