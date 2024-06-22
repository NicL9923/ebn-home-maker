import {
  Avatar,
  Box,
  Button,
  Checkbox,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { genUuid } from '../../utils/utils';
import FileDropzone from './FileDropzone';

type FileWithPreview = File & { preview: string };

interface EditableImageProps {
  curImgLink?: string;
  updateCurImgLink: (newImgLink: string) => void;
  height: number;
  width: number;
}

const EditableImage = ({ curImgLink, updateCurImgLink, height, width }: EditableImageProps) => {
  const [isHoveringImg, setIsHoveringImg] = useState(false);

  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [newImgFile, setNewImgFile] = useState<FileWithPreview | null>(null);
  const [deleteExistingPhoto, setDeleteExistingPhoto] = useState(false);

  const updateImg = async () => {
    if (deleteExistingPhoto || newImgFile) {
      const storage = getStorage();

      // Submit new picture to Storage -> get/save link -> remove old one
      if (curImgLink) {
        const oldImgRef = ref(storage, curImgLink);
        deleteObject(oldImgRef);
      }

      if (newImgFile) {
        const imgRef = ref(storage, genUuid());
        updateCurImgLink(await getDownloadURL((await uploadBytes(imgRef, newImgFile)).ref));
      } else {
        updateCurImgLink('');
      }
    }

    setIsEditingPhoto(false);
  };

  useEffect(() => {
    return () => URL.revokeObjectURL(newImgFile?.preview ?? '');
  }, [newImgFile?.preview]);

  return (
    <Box>
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

          <ModalBody p={2}>
            {!deleteExistingPhoto && (
              <FileDropzone
                accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }}
                onDrop={(acceptedFiles) =>
                  setNewImgFile({ ...acceptedFiles[0], preview: URL.createObjectURL(acceptedFiles[0]) })
                }
                previewChildren={
                  newImgFile ? (
                    <Avatar
                      src={newImgFile.preview}
                      onLoad={() => {
                        URL.revokeObjectURL(newImgFile.preview);
                      }}
                      mt={3}
                      size='xl'
                    />
                  ) : null
                }
              />
            )}

            {curImgLink && (
              <Checkbox checked={deleteExistingPhoto} onChange={() => setDeleteExistingPhoto(!deleteExistingPhoto)}>
                Only delete existing photo
              </Checkbox>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => setIsEditingPhoto(false)}>Cancel</Button>
            <Button onClick={updateImg} isDisabled={!newImgFile && !deleteExistingPhoto} ml={3} colorScheme='green'>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EditableImage;
