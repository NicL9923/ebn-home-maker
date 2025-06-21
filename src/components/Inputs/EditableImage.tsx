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
import { useState } from 'react';
import { MdEdit } from 'react-icons/md';
import Client from '../../Client';
import FileDropzone from './FileDropzone';

interface EditableImageProps {
    curImgLink?: string;
    updateCurImgLink: (newImgLink: string) => void;
    height: number;
    width: number;
}

const EditableImage = ({ curImgLink, updateCurImgLink, height, width }: EditableImageProps) => {
    const [isHoveringImg, setIsHoveringImg] = useState(false);

    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [newImgFile, setNewImgFile] = useState<File>();
    const [deleteExistingPhoto, setDeleteExistingPhoto] = useState(false);

    const updateImg = async () => {
        if (deleteExistingPhoto || newImgFile) {
            setIsUploadingImage(true);

            if (curImgLink) {
                Client.deleteImage(curImgLink);
            }

            if (newImgFile) {
                const newImgLink = await Client.uploadImageAndGetUrl(newImgFile);
                updateCurImgLink(newImgLink);
            } else {
                updateCurImgLink('');
            }
        }

        setIsUploadingImage(false);
        setIsEditingPhoto(false);
        setDeleteExistingPhoto(false);
        setNewImgFile(undefined);
    };

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
                        {!deleteExistingPhoto && <FileDropzone file={newImgFile} setFile={setNewImgFile} />}

                        {curImgLink && (
                            <Checkbox
                                isChecked={deleteExistingPhoto}
                                onChange={() => setDeleteExistingPhoto(!deleteExistingPhoto)}
                            >
                                Only delete existing photo
                            </Checkbox>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={() => setIsEditingPhoto(false)}>Cancel</Button>
                        <Button
                            onClick={updateImg}
                            isDisabled={!newImgFile && !deleteExistingPhoto}
                            ml={3}
                            colorScheme='green'
                            isLoading={isUploadingImage}
                        >
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default EditableImage;
