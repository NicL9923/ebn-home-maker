import React, { useState, useEffect } from 'react';
import { FieldTypes, ValidationErrorMsgs } from '../../constants';
import { MdCalculate } from 'react-icons/md';
import { evaluate, round } from 'mathjs';
import {
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tooltip,
} from '@chakra-ui/react';

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

  if (fieldType === 'ItemName' && !isValUnique) {
    console.error('Field is of type ItemName, but no function was provided to validate uniqueness.');
    return null;
  }

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
    }

    onClosed();
  };

  const calculateMoneyValue = () => {
    if (!fieldValue) return;

    validateAndSetValue(`${round(evaluate(fieldValue), 2)}`);
  };

  useEffect(() => {
    setFieldValue(initialValue ?? '');
  }, [initialValue]);

  return (
    <Modal isOpen={isOpen} onClose={onClosed}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{`${titleVerb} ${fieldName}`}</ModalHeader>

        <Stack direction='row' alignItems='center' spacing={1}>
          <InputGroup>
            {isMonetaryValue && <InputLeftElement>$</InputLeftElement>}
            <Input
              type='text'
              variant='standard'
              label={fieldName}
              value={fieldValue}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => validateAndSetValue(event.target.value)}
              error={!!valErr}
              helperText={valErr}
              required
              autoFocus
            />
          </InputGroup>

          {isMonetaryValue && (
            <Tooltip title='Calculate value'>
              <IconButton
                icon={<MdCalculate />}
                onClick={calculateMoneyValue}
                sx={{ height: '50%' }}
                aria-label='Calculate expression value'
              />
            </Tooltip>
          )}
        </Stack>

        <ModalFooter>
          <Button onClick={onClosed}>Cancel</Button>
          <Button variant='contained' disabled={!!valErr} onClick={saveValue}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SingleFieldDialog;
