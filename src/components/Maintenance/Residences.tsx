import React, { useEffect, useState } from 'react';
import type { Residence, ServiceLogEntry } from 'models/types';
import AddResidence from 'components/Forms/AddResidence';
import { MdAdd, MdEdit, MdHouse } from 'react-icons/md';
import { useUserStore } from 'state/UserStore';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import { Box, Button, CircularProgress, Container, Grid, GridItem, Heading, Stack, Text } from '@chakra-ui/react';

export const Residences = () => {
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [residences, setResidences] = useState<Residence[]>([]);
  const [isFetchingResidences, setIsFetchingResidences] = useState(false);
  const [addingResidence, setAddingResidence] = useState(false);

  const batch = writeBatch(db);

  const getResidences = () => {
    if (!family?.residences) return;

    setIsFetchingResidences(true);
    const residencesArr: Residence[] = [];

    family.residences.forEach((residence) => {
      getDoc(doc(db, FsCol.Residences, residence)).then((resDoc) => {
        if (resDoc.exists()) {
          const docData = resDoc.data();
          docData.serviceLogEntries.forEach((entry: ServiceLogEntry) => {
            entry.date = new Date(entry.date).toLocaleDateString();
          });
          residencesArr.push(docData as Residence);
          setResidences(residencesArr);
        }
      });
    });

    setIsFetchingResidences(false);
  };

  const deleteResidence = (resId: string) => {
    if (!family || !profile) return;

    const newResIdArr = family.residences.filter((res) => res !== resId);

    batch.update(doc(db, FsCol.Families, profile.familyId), { residences: newResIdArr });
    batch.delete(doc(db, FsCol.Residences, resId));

    batch.commit();
  };

  // const addLogEntry = () => {};

  useEffect(() => {
    if (family) {
      getResidences();
    }
  }, [family]);

  return (
    <Box mt={2}>
      <Heading>Residences</Heading>
      {!residences ? (
        isFetchingResidences && (
          <Box mx='auto' textAlign='center' mt={20}>
            <CircularProgress isIndeterminate />
          </Box>
        )
      ) : (
        <Grid mt={2} mb={2} gap={2}>
          {residences.map((residence) => (
            <GridItem key={residence.name}>
              <Box p={2}>
                {residence.img ? (
                  <img height='250' src={residence.img} />
                ) : (
                  <Container>
                    <MdHouse />
                  </Container>
                )}

                <Text>{residence.name}</Text>
                <Text>Built: {residence.yearBuilt}</Text>
                <Text>Purchased: {residence.yearPurchased}</Text>

                <Text mt={2}>Service Log</Text>
                <Box height={300}>
                  {/*
                  <DataGrid
                    columns={[
                      { field: 'date', headerName: 'Date' },
                      { field: 'note', headerName: 'Note', flex: 1 },
                    ]}
                    rows={residence.serviceLogEntries.map((entry) => ({ ...entry, id: entry.uid }))}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                  />
                  */}
                </Box>
                <Button leftIcon={<MdAdd />} sx={{ mt: 1 }}>
                  Add to log
                </Button>

                <Text mt={2}>Maintenance</Text>
                <Button leftIcon={<MdEdit />} sx={{ mt: 1 }}>
                  Edit maintenance schedule
                </Button>

                <Stack direction='row' justifyContent='right' spacing={1} mt={3}>
                  <Button>Edit</Button>
                  <Button onClick={() => deleteResidence(residence.uid)}>Delete</Button>
                </Stack>
              </Box>
            </GridItem>
          ))}
        </Grid>
      )}
      <Button onClick={() => setAddingResidence(true)}>Add residence</Button>

      <AddResidence isOpen={addingResidence} setIsOpen={setAddingResidence} />
    </Box>
  );
};
