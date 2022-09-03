import React, { useState } from 'react';
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

interface SingleFieldDialogProps {
  initialValue?: string;
  fieldName: string;
  fieldType: keyof typeof FieldTypes;
  isOpen: boolean;
  isMonetaryValue?: boolean;
  onClosed: () => void;
  onSubmitValue: (newValue?: string) => void;
  isValUnique?: (valToCheck: string) => boolean;
}

const SingleFieldDialog = (props: SingleFieldDialogProps) => {
  const { initialValue, isMonetaryValue, fieldName, fieldType, onSubmitValue, isOpen, onClosed, isValUnique } = props;
  const [valErr, setValErr] = useState<string | undefined>(undefined);
  const [fieldValue, setFieldValue] = useState<string | undefined>(initialValue);

  if (fieldType === 'ItemName' && !isValUnique) {
    console.error('Field is of type ItemName, but no function was provided to validate uniqueness.');
    return null;
  }

  const validateAndSetValue = (newValue?: string) => {
    setFieldValue(newValue);

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

    setFieldValue(initialValue);
    onClosed();
  };

  const calculateMoneyValue = () => {
    if (!fieldValue) return;

    // Thank god for the eval function - I thought I was about to have to custom-handle all math
    validateAndSetValue(`${eval(fieldValue)}`);
  };

  return (
    <Dialog open={isOpen} onClose={onClosed} fullWidth style={{ marginBottom: '35vh' }}>
      <DialogTitle>{`Edit ${fieldName}`}</DialogTitle>

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
