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

// TODO: File dropzone
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
      <Avatar src={curImgLink} sx={{ height, width, position: 'relative' }}>
        {!curImgLink && imgPlaceholder}

        {isHoveringImg && (
          <IconButton
            icon={<MdEdit />}
            onClick={() => setIsEditingPhoto(true)}
            sx={{
              borderRadius: '50%',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
              color: '#eaeaea',
            }}
            onMouseOver={() => setIsHoveringImg(true)}
            onMouseOut={() => setIsHoveringImg(false)}
            aria-label='Edit image'
          />
        )}
      </Avatar>

      <Modal isOpen={isEditingPhoto} onClose={() => setIsEditingPhoto(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update/Delete image</ModalHeader>

          {!deleteExistingPhoto && (
            <DropzoneArea
              acceptedFiles={['image/jpeg', 'image/png']}
              filesLimit={1}
              onChange={(files) => setNewImgFile(files[0])}
              fileObjects={[]}
            />
          )}
          {curImgLink && (
            <Checkbox checked={deleteExistingPhoto} onChange={() => setDeleteExistingPhoto(!deleteExistingPhoto)}>
              Only delete existing photo
            </Checkbox>
          )}

          <ModalFooter>
            <Button onClick={() => setIsEditingPhoto(false)}>Cancel</Button>
            <Button variant='contained' onClick={updateImg} disabled={!newImgFile && !deleteExistingPhoto}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EditableImage;
