import React, { useState, useRef } from "react";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { TextField, Typography } from "@mui/material";

const ENTER_KEY_CODE = 13;

const EditableLabel = ({ onFocus = () => {}, onBlur = () => {}, ...props }) => {
  const [isEditing, setEditing] = useState(false);
  const [value, setValue] = useState(props.initialValue);
  const inputRef = useRef(null);
  
  const isTextValueValid = () => typeof value !== "undefined" && value.trim().length > 0;

  const handleFocus = () => {
    const fn = isEditing ? onBlur : onFocus;
    fn(value);
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

  return <Typography variant='h6' onClick={handleFocus}>{labelText}</Typography>;
};

export default EditableLabel;