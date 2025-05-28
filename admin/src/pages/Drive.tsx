import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Breadcrumbs,
  Link,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  CreateNewFolder as NewFolderIcon,
  Upload as UploadIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from "@/contexts/AuthContext"

interface DriveFile {
  _id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: { name: string };
  createdAt: string;
}

interface Folder {
  _id: string;
  name: string;
  path: string;
  createdBy: { name: string };
  createdAt: string;
}

interface Batch {
  _id: string;
  name: string;
  batchCode: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const Drive = () => {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [path, setPath] = useState<{ id: string; name: string }[]>([]);
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [fileUploadDialog, setFileUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: 'file' | 'folder', id: string } | null>(null);
  const { admin, isLoggedIn, signout } = useAuth();

  // Fetch all batches for the admin
  const fetchBatches = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/batch/all`, {
        adminId: admin?._id
      });
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  useEffect(() => {
    if (admin?._id) {
      fetchBatches();
    }
  }, [admin]);

  const fetchContents = async (folderId?: string) => {
    if (!selectedBatch) return;
    
    try {
      const url = folderId 
        ? `${BACKEND_URL}/api/folder/${selectedBatch}/folder/${folderId}`
        : `${BACKEND_URL}/api/folder/${selectedBatch}`;
      const response = await axios.get(url);
      setFolders(response.data.folders);
      setFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching contents:', error);
    }
  };

  useEffect(() => {
    if (selectedBatch) {
      setCurrentFolder(null);
      setPath([]);
      fetchContents();
    }
  }, [selectedBatch]);

  const handleCreateFolder = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/folder`, {
        name: newFolderName,
        batchId: selectedBatch,
        parentFolderId: currentFolder,
        adminId: admin?._id
      });
      setNewFolderDialog(false);
      setNewFolderName('');
      fetchContents(currentFolder || undefined);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    if (!selectedBatch) {
      alert('Please select a batch before uploading a file.');
      return;
    }

    const formData = new FormData();
    formData.append('batchId', selectedBatch);
    formData.append('folderId', currentFolder || '');
    if (admin && admin._id) {
      formData.append('adminId', admin._id);
    }
    formData.append('file', selectedFile as Blob); // <-- append file LAST

    try {
      const response = await axios.post(`${BACKEND_URL}/api/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFileUploadDialog(false);
      setSelectedFile(null);
      fetchContents(currentFolder || undefined);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.type === 'folder') {
        await axios.delete(`${BACKEND_URL}/api/folder/${selectedItem.id}`);
      } else {
        await axios.delete(`${BACKEND_URL}/api/file/${selectedItem.id}`);
      }
      setMenuAnchor(null);
      setSelectedItem(null);
      fetchContents(currentFolder || undefined);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolder(folder._id);
    setPath([...path, { id: folder._id, name: folder.name }]);
    fetchContents(folder._id);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    const folderId = newPath[newPath.length - 1]?.id || null;
    setCurrentFolder(folderId);
    fetchContents(folderId || undefined);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isLoggedIn || !admin) {
    return <Typography>Please login to access the drive</Typography>;
  }

  return (
    <Box sx={{ p: 3 }} className="container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }} className="flex md:flex-row flex-col gap-4">
        <Typography variant="h5">Drive</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Batch</InputLabel>
            <Select
              value={selectedBatch}
              label="Select Batch"
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              {batches.map((batch) => (
                <MenuItem key={batch._id} value={batch._id}>
                  {batch.name} ({batch.batchCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedBatch && (
            <>
              <Button
                startIcon={<NewFolderIcon />}
                onClick={() => setNewFolderDialog(true)}
              >
                <span className='hidden md:block'> New Folder</span>
               
              </Button>
              <Button
                startIcon={<UploadIcon />}
                onClick={() => setFileUploadDialog(true)}
              >
                <span className='hidden md:block'> Upload File</span>
              </Button>
            </>
          )}
        </Box>
      </Box>

      {selectedBatch ? (
        <>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              component="button"
              variant="body1"
              onClick={() => {
                setCurrentFolder(null);
                setPath([]);
                fetchContents();
              }}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ArrowBackIcon sx={{ mr: 0.5 }} />
              Root
            </Link>
            {path.map((item, index) => (
              <Link
                key={item.id}
                component="button"
                variant="body1"
                onClick={() => handleBreadcrumbClick(index)}
              >
                {item.name}
              </Link>
            ))}
          </Breadcrumbs>

          <Grid container spacing={2}>
            {folders.map((folder) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={folder._id}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    width: '100%'
                  }}
                  onClick={() => handleFolderClick(folder)}
                >
                  <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">{folder.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created by {folder.createdBy.name}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem({ type: 'folder', id: folder._id });
                      setMenuAnchor(e.currentTarget);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Paper>
              </Grid>
            ))}

            {files.map((file) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={file._id}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%'
                  }}
                >
                  <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">{file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)} • Uploaded by {file.uploadedBy.name}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      setSelectedItem({ type: 'file', id: file._id });
                      setMenuAnchor(e.currentTarget);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          Please select a batch to view its contents
        </Typography>
      )}

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialog} onClose={() => setNewFolderDialog(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={fileUploadDialog} onClose={() => setFileUploadDialog(false)}>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            style={{ marginTop: '1rem' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleFileUpload}
            variant="contained"
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Drive;