import { Avatar, Button, Container, Icon, Text, useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import Dropzone, { FileRejection } from 'react-dropzone';
import { MdFilePresent } from 'react-icons/md';

const acceptedFiles = { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] };
const maxNumFiles = 1;
const threeMegabytesInBytes = 3145728; // (3MB)

interface FileDropzoneProps {
    file?: File;
    setFile: (file: File | undefined) => void;
}

const FileDropzone = (props: FileDropzoneProps) => {
    const { file, setFile } = props;
    const toast = useToast();

    const [filePreviewUrl, setFilePreviewUrl] = useState<string>();

    const handleFileUpdate = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) {
            toast({
                title: `File was rejected: ${fileRejections[0].errors.map((error) => error.message).join(', ')}`,
                status: 'error',
                isClosable: true,
            });
        } else if (acceptedFiles.length > 0) {
            const newImgFile = acceptedFiles[0];

            setFilePreviewUrl(URL.createObjectURL(newImgFile));
            setFile(newImgFile);
        }
    }, []);

    const clearCurrentUpload = useCallback(() => {
        setFilePreviewUrl(undefined);
        setFile(undefined);
    }, []);

    useEffect(() => {
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [filePreviewUrl]);

    return (
        <Dropzone
            accept={acceptedFiles}
            onDrop={(acceptedFiles: File[], fileRejections) => handleFileUpdate(acceptedFiles, fileRejections)}
            maxFiles={maxNumFiles}
            maxSize={threeMegabytesInBytes}
        >
            {({ getRootProps, getInputProps }) => (
                <Container borderWidth='1px' centerContent p={50} borderRadius='md' {...getRootProps()}>
                    <input {...getInputProps()} />

                    {filePreviewUrl ? (
                        <Avatar
                            src={filePreviewUrl}
                            onLoad={() => {
                                URL.revokeObjectURL(filePreviewUrl);
                            }}
                            mt={3}
                            size='xl'
                        />
                    ) : (
                        <Icon as={MdFilePresent} fontSize={48} />
                    )}

                    <Text mt={4}>Click to upload or drag and drop</Text>
                    {file && (
                        <Button
                            variant='link'
                            onClick={(event) => {
                                event.stopPropagation();
                                clearCurrentUpload();
                            }}
                        >
                            Clear upload
                        </Button>
                    )}
                </Container>
            )}
        </Dropzone>
    );
};

export default FileDropzone;
