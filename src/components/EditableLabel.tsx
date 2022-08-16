import React, { useState, useRef } from 'react';
import { InputAdornment, TextField, Typography, TypographyTypeMap } from '@mui/material';

interface EditableLabelPropTypes {
  onFocus?: (value: string | undefined) => void;
  onBlur: (value: string | undefined) => void;
  initialValue: string;
  labelPlaceholder?: string;
  variant?: TypographyTypeMap['props']['variant'];
  prefix?: string;
}

const EditableLabel = (props: EditableLabelPropTypes) => {
  const { initialValue, labelPlaceholder, variant, prefix, onFocus, onBlur } = props;
  const [isEditing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [value, setValue] = useState<string | undefined>(initialValue ?? undefined);
  const inputRef = useRef<any>(null);

  const isTextValueValid = () => typeof value !== 'undefined' && value.trim().length > 0;

  const handleFocus = () => {
    if (isEditing) {
      onBlur(value);
      setIsHovered(false);
    } else {
      // If monetary value w/ commas, replace them when editing
      if (prefix === '$' && value?.includes(',')) {
        setValue(value.replaceAll(',', ''));
      }

      if (onFocus) onFocus(value);
    }

    handleEditState();
  };

  const handleChange = () => setValue(inputRef?.current?.value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFocus();
    }
  };

  const handleEditState = () => {
    if (!isTextValueValid()) return;
    setEditing((prev) => !prev);
  };

  if (isEditing) {
    return (
      <TextField
        inputProps={{ ref: inputRef, value }}
        onChange={handleChange}
        onBlur={handleFocus}
        onKeyDown={handleKeyDown}
        autoFocus
        variant='standard'
        InputProps={{
          startAdornment: prefix === '$' ? <InputAdornment position='start'>$</InputAdornment> : undefined,
        }}
      />
    );
  }

  const labelText = isTextValueValid() ? value : labelPlaceholder;

  return (
    <Typography
      variant={variant ? variant : 'h6'}
      onClick={handleFocus}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      sx={{
        borderBottom: isHovered ? '2px solid green' : '',
      }}
    >
      {prefix}
      {labelText}
    </Typography>
  );
};

export default EditableLabel;
