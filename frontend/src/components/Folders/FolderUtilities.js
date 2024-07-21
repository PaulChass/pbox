// folderUtils.js

export const findParentFolderId = (folders, id) => {
	const folder = folders.find(folder => folder.id === id);
	return folder ? folder.parent_id : null;
};

export const traverseFileTree = async (item, parentId, email, path = '', api, token, baseUrl, setIsLoading, setUpdated, folderId) => {
	setIsLoading(true);
	if (item.isFile) {
		item.file((file) => {
			const formData = new FormData();
			formData.append('files', file);
			formData.append('email', email);
			formData.append('folderId', folderId);
			let postUrl = `${baseUrl}/folders/${parentId}/upload`;
			api.post(postUrl, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': `Bearer ${token}`
				},
				withCredentials: true
			});
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
				traverseFileTree(entries[i], parentId, path + item.name + '/', api, token, baseUrl, setIsLoading, setUpdated, folderId);
			}
		});
	}
	setIsLoading(false);
};