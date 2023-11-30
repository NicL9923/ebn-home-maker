import { Container, Icon, Text } from '@chakra-ui/react';
import Dropzone, { DropzoneProps } from 'react-dropzone';
import { MdFilePresent } from 'react-icons/md';

interface FileDropzoneProps extends DropzoneProps {
  previewChildren?: React.ReactNode;
}

const FileDropzone = ({ accept, onDrop, previewChildren }: FileDropzoneProps) => {
  return (
    <Dropzone
      accept={accept}
      onDrop={onDrop}
      maxFiles={1}
      maxSize={3145728} // 3MB
    >
      {({ getRootProps, getInputProps }) => (
        <Container borderWidth='1px' centerContent p={50} borderRadius='md' {...getRootProps()}>
          <input {...getInputProps()} />

          <Icon as={MdFilePresent} fontSize={48} />
          <Text mt={4}>Click to upload or drag and drop</Text>

          {previewChildren}
        </Container>
      )}
    </Dropzone>
  );
};

export default FileDropzone;
