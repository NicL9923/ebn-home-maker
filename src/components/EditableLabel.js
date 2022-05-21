import React, { useState, useRef } from "react";
import { TextField, Typography } from "@mui/material";

const ENTER_KEY_CODE = 13;

const EditableLabel = ({ onFocus = () => {}, onBlur = () => {}, ...props }) => {
  const [isEditing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [value, setValue] = useState(props.initialValue);
  const inputRef = useRef(null);
  
  const isTextValueValid = () => typeof value !== 'undefined' && value.trim().length > 0;

  const handleFocus = () => {
    if (isEditing) {
      onBlur(value);
      setIsHovered(false);
    } else {
      onFocus(value);
    }

    handleEditState();
  };

  const handleChange = e => setValue(inputRef.current.value);

  const handleKeyDown = e => {
    if (e.keyCode === ENTER_KEY_CODE) {
      handleFocus();
    }
  };

  const handleEditState = () => {
    if (!isTextValueValid()) return;
    setEditing(prev => !prev);
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
        />
    );
  }

  const labelText = isTextValueValid() ? value : props.labelPlaceHolder;

  return (
    <Typography
      variant={props.variant ? props.variant : 'h6'}
      onClick={handleFocus}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      sx={{
        borderBottom: isHovered ? '2px solid green' : ''
      }}
    >
      {props.prefix}{labelText}
    </Typography>
  );
};

export default EditableLabel;