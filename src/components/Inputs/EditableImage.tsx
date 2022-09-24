import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import { DropzoneArea } from 'mui-file-dropzone';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Edit } from '@mui/icons-material';

// TODO: On image hover -> grey background + Edit icon overlay on image (and cursor pointer)

interface EditableImageProps {
  curImgLink?: string;
  updateCurImgLink: (newImgLink: string) => void;
  imgPlaceholder: JSX.Element;
  height: number;
  width: number;
}

const EditableImage = ({ curImgLink, updateCurImgLink, imgPlaceholder, height, width }: EditableImageProps) => {
  const [isHoveringImg, setIsHoveringImg] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [newImgFile, setNewImgFile] = useState<File | null>(null);
  const [deleteExistingPhoto, setDeleteExistingPhoto] = useState(false);

  const updateImg = () => {
    if (deleteExistingPhoto || newImgFile) {
      const storage = getStorage();

      // Submit new picture to Storage -> get/save link -> remove old one
      if (curImgLink) {
        const oldImgRef = ref(storage, curImgLink);
        deleteObject(oldImgRef);
      }

      if (newImgFile) {
        const imgRef = ref(storage, uuidv4());
        uploadBytes(imgRef, newImgFile).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            updateCurImgLink(url);
          });
        });
      } else {
        updateCurImgLink('');
      }
    }
  };

  return (
    <Box>
      <IconButton
        onClick={() => setIsEditingPhoto(true)}
        sx={{ position: 'relative', borderRadius: '50%' }}
        onMouseOver={() => setIsHoveringImg(true)}
        onMouseOut={() => setIsHoveringImg(false)}
      >
        {isHoveringImg && (
          <Edit
            sx={{
              position: 'absolute',
              top: '27%',
              left: '29%',
              zIndex: 100,
              color: '#eaeaea',
              height: height / 2,
              width: width / 2,
            }}
          />
        )}
        <Avatar src={curImgLink} sx={{ height, width }}>
          {!curImgLink && imgPlaceholder}
        </Avatar>
      </IconButton>

      <Dialog open={isEditingPhoto} onClose={() => setIsEditingPhoto(false)} fullWidth>
        <DialogTitle>Update/Delete image</DialogTitle>

        <DialogContent>
          {!deleteExistingPhoto && (
            <DropzoneArea
              acceptedFiles={['image/jpeg', 'image/png']}
              filesLimit={1}
              onChange={(files) => setNewImgFile(files[0])}
              fileObjects={[]}
            />
          )}
          {curImgLink && (
            <FormControlLabel
              control={
                <Checkbox checked={deleteExistingPhoto} onChange={() => setDeleteExistingPhoto(!deleteExistingPhoto)} />
              }
              label='Only delete existing photo'
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIsEditingPhoto(false)}>Cancel</Button>
          <Button variant='contained' onClick={updateImg} disabled={!newImgFile && !deleteExistingPhoto}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditableImage;
