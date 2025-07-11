import {
    Box,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
} from '@chakra-ui/react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

interface BarcodeScannerModalProps {
    isOpen: boolean;
    handleBarcodeScan: (data: string) => void;
    closeScanner: () => void;
}

export const BarcodeScannerModal = ({ isOpen, handleBarcodeScan, closeScanner }: BarcodeScannerModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={closeScanner} size='lg'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign='center'>Scan Barcode</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={4}>
                        <Text textAlign='center' color='gray.600'>
                            Point your camera at a barcode or QR code
                        </Text>
                        <Box borderRadius='lg' overflow='hidden' w='full' h='300px'>
                            <BarcodeScannerComponent
                                width='100%'
                                height='100%'
                                onUpdate={(_err, result) => {
                                    if (result) {
                                        handleBarcodeScan(result.getText());
                                    }
                                }}
                            />
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
