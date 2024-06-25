import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Checkbox,
  Heading,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { doc, updateDoc } from 'firebase/firestore';
import { useMemo, useRef, useState } from 'react';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { MdAdd, MdDelete, MdEdit, MdKeyboardArrowDown } from 'react-icons/md';
import AddGroceryItem from '../components/Forms/AddGroceryItem';
import { catSubcatKeySeparator } from '../components/Forms/AddTransaction';
import SingleFieldDialog from '../components/Inputs/SingleFieldDialog';
import { FsCol, db } from '../firebase';
import { GroceryItem } from '../models/types';
import { useUserStore } from '../state/UserStore';

const GroceryList = () => {
  const toast = useToast();
  const listBgColor = useColorModeValue('gray.50', 'gray.700');
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [isAdding, setIsAdding] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<GroceryItem>();
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const cancelRef = useRef(null);

  const editGroceryItem = async (newItemName?: string) => {
    if (!itemToEdit || !newItemName || !family || !profile) return;

    const newList = [...family.groceryList];
    const idx = newList.findIndex((item) => item.uid === itemToEdit.uid);
    newList[idx].name = newItemName;

    await updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: newList });

    toast({
      title: `Successfully edited item!`,
      status: 'success',
      isClosable: true,
    });
  };

  const toggleGroceryItem = (idx: number, isBought: boolean) => {
    if (!family || !profile) return;

    const updGroceryList = [...family.groceryList];

    updGroceryList[idx].isBought = isBought;

    updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: updGroceryList });
  };

  const removeGroceryItems = () => {
    if (!family || !profile) return;

    const updGroceryList = family.groceryList.filter((val) => val.isBought === false);

    updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: updGroceryList });
  };

  const removeGroceryItemByUid = (uid: string) => {
    if (!family || !profile) return;

    const updGroceryList = family.groceryList.filter((val) => val.uid !== uid);

    updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: updGroceryList });
  }

  const onDragEnd = ({ type, source, destination }: DropResult) => {
    if (!family || !profile) return;
    if (!source || !destination || !type) return;

    if (type === 'gListItem') {
      const newGList = [...family.groceryList];
      const listItem = newGList[source.index];

      newGList.splice(source.index, 1);
      newGList.splice(destination.index, 0, listItem);

      updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: newGList });
    }
  };

  const numItemsSelected = useMemo(() => family?.groceryList.filter((item) => item.isBought).length ?? 0, [family]);

  if (!profile || !family) {
    return null;
  }

  return (
    <Box p={2}>
      <Heading mb={2}>Grocery list</Heading>

      <Stack direction='row' mt={2}>
        <Button size='sm' leftIcon={<MdAdd />} onClick={() => setIsAdding(true)}>
          Add item
        </Button>

        <Button
          size='sm'
          leftIcon={<MdEdit />}
          onClick={() => setItemToEdit(family.groceryList.find((item) => item.isBought))}
          isDisabled={numItemsSelected !== 1}
        >
          Edit
        </Button>

        <Button
          size='sm'
          leftIcon={<MdDelete />}
          onClick={() => setIsConfirmingRemove(true)}
          colorScheme='red'
          isDisabled={numItemsSelected === 0}
        >
          Remove checked
        </Button>
      </Stack>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='groceryList' type='gListItem'>
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              mt='2'
              height='calc(100vh - 265px)'
              width='85vw'
              overflow='auto'
              bgColor={listBgColor}
              p='3'
              borderRadius='md'
            >
              {family.groceryList.map((groceryItem, idx) => (
                <Draggable draggableId={`${groceryItem.uid}`} index={idx} key={`${groceryItem.uid}`}>
                  {(provided) => (
                    <ListItem {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                      {groceryItem.uid.startsWith(catSubcatKeySeparator)
                      ? <Stack direction='row' align='center' spacing={0.5}>
                          <Heading size='md' fontWeight='bold'>{groceryItem.name}</Heading>
                          <Menu>
                            <MenuButton>
                              <IconButton
                                icon={<MdKeyboardArrowDown />}
                                variant='ghost'
                                size='sm'
                                aria-label='Category menu'
                                ml={-1}
                              />
                            </MenuButton>

                            <MenuList>
                              <MenuItem icon={<MdDelete />} onClick={() => removeGroceryItemByUid(groceryItem.uid)}>Delete header</MenuItem>
                            </MenuList>
                          </Menu>
                        </Stack>
                      :
                      <Checkbox
                        size='lg'
                        colorScheme='green'
                        checked={groceryItem.isBought}
                        onChange={(e) => toggleGroceryItem(idx, e.target.checked)}
                        m='2'
                      >
                        {groceryItem.name}
                      </Checkbox>
                    }
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <AddGroceryItem
        isOpen={isAdding}
        setIsOpen={(isOpen) => setIsAdding(isOpen)}
      />

      <SingleFieldDialog
        initialValue={itemToEdit?.name}
        titleVerb={'Edit'}
        fieldName={'grocery item'}
        fieldType={'EntityName'}
        isOpen={!!itemToEdit}
        onClosed={() => {
          setItemToEdit(undefined);
        }}
        onSubmitValue={editGroceryItem}
      />

      <AlertDialog
        isOpen={isConfirmingRemove}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmingRemove(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Remove items
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure you want to remove all checked items?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsConfirmingRemove(false)}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={() => {
                  setIsConfirmingRemove(false);
                  removeGroceryItems();
                }}
                ml={3}
              >
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default GroceryList;
