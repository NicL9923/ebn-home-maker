import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
} from '@chakra-ui/react';
import { useRef } from 'react';

interface ConfirmDialogProps {
    title: string;
    text: string;
    primaryActionText: string;
    isOpen: boolean;
    onClose: (confirmed: boolean) => void;
}

const ConfirmDialog = (props: ConfirmDialogProps) => {
    const { title, text, primaryActionText, isOpen, onClose } = props;

    const cancelRef = useRef(null);

    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={() => onClose(false)}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {title}
                    </AlertDialogHeader>

                    <AlertDialogBody>{text}</AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={() => onClose(false)}>
                            Cancel
                        </Button>

                        <Button
                            colorScheme='red'
                            onClick={() => {
                                onClose(true);
                            }}
                            ml={3}
                        >
                            {primaryActionText}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

export default ConfirmDialog;
