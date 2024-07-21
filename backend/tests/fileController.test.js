const { findFileById } = require('../controllers/fileController');
const { File } = require('../models');

describe('findFileById', () => {
    test('should return the file with the given ID', async () => {
        const fileId = 1;
        const expectedFile = { id: fileId, name: 'example.txt', folder_id: 1 };
        jest.spyOn(File, 'findOne').mockResolvedValue(expectedFile);

        const result = await findFileById(fileId);

        expect(result).toEqual(expectedFile);
        expect(File.findOne).toHaveBeenCalledWith({ where: { id: fileId } });
    });

    test('should return null if no file is found', async () => {
        const fileId = 1;
        jest.spyOn(File, 'findOne').mockResolvedValue(null);

        const result = await findFileById(fileId);

        expect(result).toBeNull();
        expect(File.findOne).toHaveBeenCalledWith({ where: { id: fileId } });
    });

    test('should throw an error if an exception occurs', async () => {
        const fileId = 1;
        const expectedError = new Error('Database error');
        jest.spyOn(File, 'findOne').mockRejectedValue(expectedError);

        await expect(findFileById(fileId)).rejects.toThrow(expectedError);
        expect(File.findOne).toHaveBeenCalledWith({ where: { id: fileId } });
    });
});