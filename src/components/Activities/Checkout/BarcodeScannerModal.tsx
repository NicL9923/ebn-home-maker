import {
    Box,
    Button,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { MdCameraAlt } from 'react-icons/md';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

enum ScannerError {
    NotAllowedError = 'NotAllowedError',
    NotFoundError = 'NotFoundError',
}

interface BarcodeScannerModalProps {
    isOpen: boolean;
    handleBarcodeScan: (data: string) => void;
    closeScanner: () => void;
}

export const BarcodeScannerModal = ({ isOpen, handleBarcodeScan, closeScanner }: BarcodeScannerModalProps) => {
    const [hasCamera, setHasCamera] = useState(true);
    const [scannerError, setScannerError] = useState<string | null>(null);

    const scannerErrorMessage = useMemo(() => {
        switch (scannerError) {
            case ScannerError.NotAllowedError:
                return 'Camera permission denied. Please allow camera access and try again.';
            case ScannerError.NotFoundError:
                return 'No camera found on this device.';
            default:
                return 'Unable to access camera. Please check your camera settings.';
        }
    }, [scannerError]);

    // Check for camera availability when modal opens
    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices
                ?.getUserMedia({ video: true })
                .then(() => {
                    setHasCamera(true);
                    setScannerError(null);
                })
                .catch((error) => {
                    setHasCamera(false);
                    setScannerError(error.name);
                });
        }
    }, [isOpen]);

    const ScannerOverlay = () => (
        <Box position='absolute' top='0' left='0' right='0' bottom='0' pointerEvents='none' zIndex={1}>
            {/* Corner brackets */}
            <Box
                position='absolute'
                top='20px'
                left='20px'
                width='40px'
                height='40px'
                borderTop='3px solid'
                borderLeft='3px solid'
                borderColor='green.400'
                borderRadius='md'
            />
            <Box
                position='absolute'
                top='20px'
                right='20px'
                width='40px'
                height='40px'
                borderTop='3px solid'
                borderRight='3px solid'
                borderColor='green.400'
                borderRadius='md'
            />
            <Box
                position='absolute'
                bottom='20px'
                left='20px'
                width='40px'
                height='40px'
                borderBottom='3px solid'
                borderLeft='3px solid'
                borderColor='green.400'
                borderRadius='md'
            />
            <Box
                position='absolute'
                bottom='20px'
                right='20px'
                width='40px'
                height='40px'
                borderBottom='3px solid'
                borderRight='3px solid'
                borderColor='green.400'
                borderRadius='md'
            />

            {/* Center scanning line */}
            <Box
                position='absolute'
                top='50%'
                left='20px'
                right='20px'
                height='2px'
                bgGradient='linear(to-r, transparent, green.400, transparent)'
                transform='translateY(-50%)'
                animation='scanLine 2s ease-in-out infinite'
                sx={{
                    '@keyframes scanLine': {
                        '0%, 100%': { opacity: 0.3 },
                        '50%': { opacity: 1 },
                    },
                }}
            />
        </Box>
    );

    const CameraUnavailableView = () => (
        <VStack spacing={6} py={8} px={4}>
            <Icon as={MdCameraAlt} w={16} h={16} color='gray.400' />
            <VStack spacing={3} textAlign='center'>
                <Text fontSize='lg' fontWeight='semibold' color='gray.700'>
                    Camera Unavailable
                </Text>
                <Text color='gray.600' maxW='sm'>
                    {scannerErrorMessage}
                </Text>
            </VStack>
            {scannerError !== ScannerError.NotFoundError && (
                <Button
                    colorScheme='blue'
                    onClick={() => {
                        setHasCamera(true);
                        setScannerError(null);
                    }}
                    leftIcon={<Icon as={MdCameraAlt} />}
                >
                    Retry Camera Access
                </Button>
            )}
        </VStack>
    );

    return (
        <Modal isOpen={isOpen} onClose={closeScanner} size='lg'>
            <ModalOverlay bg='blackAlpha.700' />
            <ModalContent mx={4}>
                <ModalHeader textAlign='center' pb={2}>
                    <Text>Scan Barcode</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    {hasCamera && !scannerError ? (
                        <VStack spacing={4}>
                            <Text textAlign='center' color='gray.600' fontSize='sm'>
                                Position the barcode or QR code within the scanning area
                            </Text>
                            <Box
                                position='relative'
                                borderRadius='lg'
                                overflow='hidden'
                                w='full'
                                h='300px'
                                bg='black'
                                border='2px solid'
                                borderColor='gray.200'
                            >
                                <BarcodeScannerComponent
                                    width='100%'
                                    height='100%'
                                    onUpdate={(err, result) => {
                                        if (err) {
                                            console.error('Scanner error:', err);
                                            return;
                                        }
                                        if (result) {
                                            handleBarcodeScan(result.getText());
                                        }
                                    }}
                                />
                                <ScannerOverlay />
                            </Box>
                            <Text fontSize='xs' color='gray.500' textAlign='center'>
                                Make sure the barcode is well-lit and clearly visible
                            </Text>
                        </VStack>
                    ) : (
                        <CameraUnavailableView />
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
