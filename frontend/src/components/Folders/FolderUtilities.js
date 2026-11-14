// folderUtils.js
import { tusUpload, notifyStorageChanged } from '../../tusUpload.js';

export const findParentFolderId = (folders, id) => {
	const folder = folders.find(folder => folder.id === id);
	return folder ? folder.parent_id : null;
};

export const traverseFileTree = async (item, parentId, email, path = '', api, token, baseUrl, setIsLoading, setUpdated, folderId) => {
	setIsLoading(true);
	if (item.isFile) {
		item.file((file) => {
			// Chunked + resumable upload (tus) into the folder created for this level.
			tusUpload(file, parentId)
				.then(() => { setUpdated && setUpdated(true); notifyStorageChanged(); })
				.catch((err) => { console.error(err); alert(err.message); });
		});
	} else if (item.isDirectory) {
		const requestData = {
			name: item.name,
			parent_id: parentId,
			email: localStorage.getItem('email')
		};
		const config = {
			headers: {
				'Authorization': `Bearer ${token}`
			},
			withCredentials: true
		};
		const response = await api.post(`${baseUrl}/folders/`, requestData, config);

		parentId = response.data.id;

		const dirReader = item.createReader();
		dirReader.readEntries((entries) => {
			for (let i = 0; i < entries.length; i++) {
				// Pass `email` too: it was missing, which shifted every later argument
				// and broke uploads of files inside nested subfolders.
				traverseFileTree(entries[i], parentId, email, path + item.name + '/', api, token, baseUrl, setIsLoading, setUpdated, folderId);
			}
		});
	}
	setIsLoading(false);
};

export const truncateFolderName = (folderName) => {	
	if (folderName.length > 16) {
		return folderName.substring(0, 16) + '...';
	}
	return folderName;
};