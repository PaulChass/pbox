const request = require('supertest');
const app = require('../server');
const File = require('../models/File');
const Folder = require('../models/Folder');
const fs = require('fs');

describe('Sync Controller', () => {
    // token for authorization from sync config file
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJpYXQiOjE2MjYwNjYwNzJ9.1';
    
    describe('GET /api/sync/get-remote-files', () => {
        it('should fetch remote files', async () => {
            const remoteFolder = await Folder.findOne({ where: { name: 'SyncFolder' } });
            const file1 = await File.create({ name: 'file1.txt', path: '/path/to/file1.txt', size: 123, folder_id: remoteFolder.id });
            const file2 = await File.create({ name: 'file2.txt', path: '/path/to/file2.txt', size: 456, folder_id: remoteFolder.id });
            const subfolder = await Folder.create({ name: 'Subfolder', parent_id: remoteFolder.id });
            const file3 = await File.create({ name: 'file3.txt', path: '/path/to/file3.txt', size: 789, folder_id: subfolder.id });

            const response = await request(app)
                .get('/api/sync/get-remote-files')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.arrayContaining([
                expect.objectContaining({ name: 'file1.txt' }),
                expect.objectContaining({ name: 'file2.txt' }),
                expect.objectContaining({ name: 'file3.txt' })
            ]));

            await file1.destroy();
            await file2.destroy();
            await file3.destroy();
            await subfolder.destroy();
        });


        it('should return 500 if an error occurs', async () => {
            jest.spyOn(Folder, 'findOne').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/api/sync/get-remote-files')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Failed to fetch remote files' });
        });
    });

   
});