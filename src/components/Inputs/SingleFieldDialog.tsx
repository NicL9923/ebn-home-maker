import {
    Button,
    FormControl,
    FormErrorMessage,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Tooltip,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { MdCalculate } from 'react-icons/md';
import { FieldTypes, ValidationErrorMsgs } from '../../constants';
import { evaluateExprAndRoundTo2Decimals, getMonetaryValue2DecimalString } from '../../utils/utils';

interface SingleFieldDialogProps {
    initialValue?: string;
    fieldName: string;
    fieldType: keyof typeof FieldTypes;
    isOpen: boolean;
    isMonetaryValue?: boolean;
    onClosed: () => void;
    onSubmitValue: (newValue?: string) => void;
    isValUnique?: (valToCheck: string) => boolean;
    titleVerb?: string;
}

const SingleFieldDialog = (props: SingleFieldDialogProps) => {
    const {
        initialValue,
        isMonetaryValue,
        fieldName,
        fieldType,
        onSubmitValue,
        isOpen,
        onClosed,
        isValUnique,
        titleVerb = 'Edit',
    } = props;
    const [valErr, setValErr] = useState<string | undefined>(undefined);
    const [fieldValue, setFieldValue] = useState<string>(initialValue ?? '');

    const validateAndSetValue = (newValue?: string) => {
        setFieldValue(newValue ?? '');

        // Check empty/undefined
        if (!newValue) {
            setValErr(ValidationErrorMsgs.Empty);
            return;
        }

        // If item name, check uniqueness
        if (isValUnique && !isValUnique(newValue)) {
            setValErr(ValidationErrorMsgs.ItemNameUnique);
            return;
        }

        // Check regex
        if (!newValue.match(FieldTypes[fieldType].regex)) {
            setValErr(FieldTypes[fieldType].valErrMsg);
            return;
        }

        setValErr(undefined);
    };

    const saveValue = () => {
        if (fieldValue !== initialValue) {
            onSubmitValue(fieldValue);
            setFieldValue(initialValue ?? '');
        }

        onClosed();
    };

    const calculateMoneyValue = () => {
        if (!fieldValue) return;

        const exprResultValue = evaluateExprAndRoundTo2Decimals(fieldValue);
        validateAndSetValue(getMonetaryValue2DecimalString(exprResultValue));
    };

    useEffect(() => {
        setFieldValue(initialValue ?? '');
    }, [initialValue]);

    if (fieldType === 'ItemName' && !isValUnique) {
        console.error('Field is of type ItemName, but no function was provided to validate uniqueness.');
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClosed}>
            <ModalOverlay />

            <ModalContent>
                <ModalHeader>{`${titleVerb} ${fieldName}`}</ModalHeader>

                <ModalBody>
                    <Stack direction='row' alignItems='center' spacing={1}>
                        <FormControl isInvalid={!!valErr}>
                            <InputGroup>
                                {isMonetaryValue && <InputLeftElement>$</InputLeftElement>}
                                <Input
                                    type='text'
                                    value={fieldValue}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                        validateAndSetValue(event.target.value)
                                    }
                                    isInvalid={!!valErr}
                                    isRequired
                                    autoFocus
                                />
                            </InputGroup>
                            <FormErrorMessage>{valErr}</FormErrorMessage>
                        </FormControl>

                        {isMonetaryValue && (
                            <Tooltip title='Calculate value'>
                                <IconButton
                                    icon={<MdCalculate />}
                                    onClick={calculateMoneyValue}
                                    variant='ghost'
                                    fontSize='32'
                                    aria-label='Calculate expression value'
                                />
                            </Tooltip>
                        )}
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <Button onClick={onClosed}>Cancel</Button>
                    <Button isDisabled={!!valErr} onClick={saveValue} colorScheme='green' ml='3'>
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SingleFieldDialog;
