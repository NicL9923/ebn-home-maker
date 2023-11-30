import React, { useState } from 'react';
import SingleFieldDialog from './SingleFieldDialog';
import { FieldTypes } from '../../constants';
import { Text } from '@chakra-ui/react';

interface EditableLabelPropTypes {
  text: string;
  textSize?: string;
  isMonetaryValue?: boolean;
  fieldName: string;
  fieldType: keyof typeof FieldTypes;
  onSubmitValue: (newValue?: string) => void;
  isValUnique?: (valToCheck: string) => boolean;
}

const EditableLabel = (props: EditableLabelPropTypes) => {
  const { isValUnique, onSubmitValue, fieldType, fieldName, text, textSize, isMonetaryValue } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const startEditing = () => {
    setIsEditing(true);
    setIsHovered(false);
  };

  return (
    <>
      <Text
        fontSize={textSize}
        onClick={startEditing}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          borderBottom: isHovered ? '2px solid green' : '2px solid transparent',
        }}
      >
        {isMonetaryValue && '$'}
        {text}
      </Text>

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
