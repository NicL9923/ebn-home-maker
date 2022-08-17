import React, { useState } from 'react';
import { Typography, TypographyTypeMap } from '@mui/material';
import SingleFieldDialog from './SingleFieldDialog';
import { FieldTypes } from '../../constants';

interface EditableLabelPropTypes {
  text: string;
  textVariant?: TypographyTypeMap['props']['variant'];
  isMonetaryValue?: boolean;
  fieldName: string;
  fieldType: keyof typeof FieldTypes;
  onSubmitValue: (newValue?: string) => void;
  isValUnique?: (valToCheck: string) => boolean;
}

const EditableLabel = (props: EditableLabelPropTypes) => {
  const { isValUnique, onSubmitValue, fieldType, fieldName, text, textVariant, isMonetaryValue } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const startEditing = () => {
    setIsEditing(true);
    setIsHovered(false);
  };

  return (
    <>
      <Typography
        variant={textVariant ?? 'h6'}
        onClick={startEditing}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
        sx={{
          borderBottom: isHovered ? '2px solid green' : '',
        }}
      >
        {isMonetaryValue && '$'}
        {text}
      </Typography>

      <SingleFieldDialog
        initialValue={isMonetaryValue ? text.replaceAll(',', '') : text} // If monetary value w/ commas, replace them when editing
        fieldName={fieldName}
        fieldType={fieldType}
        isOpen={isEditing}
        onClosed={() => setIsEditing(false)}
        isMonetaryValue={isMonetaryValue}
        isValUnique={isValUnique}
        onSubmitValue={onSubmitValue}
      />
    </>
  );
};

export default EditableLabel;
