import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { FieldTypes, ValidationErrorMsgs } from '../../constants';
import { Calculate } from '@mui/icons-material';
import { evaluate, round } from 'mathjs';

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
    <Dialog open={isOpen} onClose={onClosed} fullWidth style={{ marginBottom: '35vh' }}>
      <DialogTitle>{`${titleVerb} ${fieldName}`}</DialogTitle>

      <DialogContent>
        <Stack direction='row' alignItems='center' spacing={1}>
          <TextField
            variant='standard'
            label={fieldName}
            value={fieldValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => validateAndSetValue(event.target.value)}
            error={!!valErr}
            helperText={valErr}
            InputProps={{
              startAdornment: isMonetaryValue ? <InputAdornment position='start'>$</InputAdornment> : undefined,
            }}
            required
            autoFocus
          />
          {isMonetaryValue && (
            <Tooltip title='Calculate value'>
              <IconButton onClick={calculateMoneyValue} sx={{ height: '50%' }}>
                <Calculate />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClosed}>Cancel</Button>
        <Button variant='contained' disabled={!!valErr} onClick={saveValue}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SingleFieldDialog;
