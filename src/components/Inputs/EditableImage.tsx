import React, { useState } from 'react';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { MdEdit } from 'react-icons/md';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  IconButton,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import Dropzone from 'react-dropzone';

interface EditableImageProps {
  curImgLink?: string;
  updateCurImgLink: (newImgLink: string) => void;
  height: number;
  width: number;
}

const EditableImage = ({ curImgLink, updateCurImgLink, height, width }: EditableImageProps) => {
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
    <Box pointerEvents='all'>
      <Avatar
        src={curImgLink}
        cursor='pointer'
        sx={{ height, width, position: 'relative' }}
        onMouseEnter={() => setIsHoveringImg(true)}
        onMouseLeave={() => setIsHoveringImg(false)}
      >
        {isHoveringImg && (
          <IconButton
            icon={<MdEdit />}
            onClick={() => setIsEditingPhoto(true)}
            size='lg'
            fontSize='64'
            variant='ghost'
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'black',
            }}
            aria-label='Edit image'
          />
        )}
      </Avatar>

      <Modal isOpen={isEditingPhoto} onClose={() => setIsEditingPhoto(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update/Delete image</ModalHeader>

          {!deleteExistingPhoto && (
            <Dropzone
              accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }}
              onDrop={(acceptedFiles) => setNewImgFile(acceptedFiles[0])}
              // TODO: maxSize (in bytes)
            />
          )}
          {curImgLink && (
            <Checkbox checked={deleteExistingPhoto} onChange={() => setDeleteExistingPhoto(!deleteExistingPhoto)}>
              Only delete existing photo
            </Checkbox>
          )}

          <ModalFooter>
            <Button onClick={() => setIsEditingPhoto(false)}>Cancel</Button>
            <Button onClick={updateImg} disabled={!newImgFile && !deleteExistingPhoto}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EditableImage;
