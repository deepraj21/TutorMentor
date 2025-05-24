import Folder from '../model/Folder.js';
import File from '../model/File.js';

export const createFolder = async (req, res) => {
    try {
        const { name, batchId, adminId, parentFolderId } = req.body;

        let path = name;
        if (parentFolderId) {
            const parentFolder = await Folder.findById(parentFolderId);
            if (!parentFolder) {
                return res.status(404).json({ message: 'Parent folder not found' });
            }
            path = `${parentFolder.path}/${name}`;
        }

        const folder = new Folder({
            name,
            batch: batchId,
            parentFolder: parentFolderId || null,
            createdBy: adminId,
            path
        });

        await folder.save();
        res.status(201).json(folder);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A folder with this name already exists in this location' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

export const getFolderContents = async (req, res) => {
    try {
        const { batchId, folderId } = req.params;
        console.log('Fetching contents for batch:', batchId, 'folder:', folderId); // Debug log

        const folderQuery = { batch: batchId };
        const fileQuery = { batch: batchId };

        if (folderId) {
            folderQuery.parentFolder = folderId;
            fileQuery.folder = folderId;
        } else {
            folderQuery.parentFolder = null;
            fileQuery.folder = null;
        }

        console.log('Folder query:', folderQuery); // Debug log
        console.log('File query:', fileQuery); // Debug log

        const [folders, files] = await Promise.all([
            Folder.find(folderQuery)
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 }),
            File.find(fileQuery)
                .populate('uploadedBy', 'name')
                .sort({ createdAt: -1 })
        ]);

        console.log('Found folders:', folders.length); // Debug log
        console.log('Found files:', files.length); // Debug log

        res.json({ folders, files });
    } catch (error) {
        console.error('Error in getFolderContents:', error); // Debug log
        res.status(500).json({ message: error.message });
    }
};

export const deleteFolder = async (req, res) => {
    try {
        const { folderId } = req.params;

        // Find all subfolders recursively
        const getAllSubfolders = async (parentId) => {
            const directSubfolders = await Folder.find({ parentFolder: parentId });
            let allSubfolders = [...directSubfolders];
            
            for (const subfolder of directSubfolders) {
                const nestedSubfolders = await getAllSubfolders(subfolder._id);
                allSubfolders = [...allSubfolders, ...nestedSubfolders];
            }
            
            return allSubfolders;
        };

        const subfolders = await getAllSubfolders(folderId);
        const allFolderIds = [folderId, ...subfolders.map(f => f._id)];

        // Delete all files in these folders
        await File.deleteMany({ folder: { $in: allFolderIds } });

        // Delete all folders
        await Folder.deleteMany({ _id: { $in: allFolderIds } });

        res.json({ message: 'Folder and its contents deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 