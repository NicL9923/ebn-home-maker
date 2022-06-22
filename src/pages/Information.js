import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import { FirebaseContext } from '..';
import { UserContext } from '../App';
import { Add, Edit, Save } from '@mui/icons-material';
import { arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Calendar, luxonLocalizer } from 'react-big-calendar';
import { DateTime } from 'luxon';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

const localizer = luxonLocalizer(DateTime);
const defaultEvent = {
  title: '',
  start: '',
  end: ''
};

const Information = () => {
  const { db } = useContext(FirebaseContext);
  const { userId, profile, family, getFamily } = useContext(UserContext);
  const [isEditingMd, setIsEditingMd] = useState(false);
  const [editedMd, setEditedMd] = useState(null);
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState(defaultEvent);
  const [editingEvent, setEditingEvent] = useState(false);
  const [eventBeingEdited, setEventBeingEdited] = useState(defaultEvent);
  const [dateConvertedEvents, setDateConvertedEvents] = useState([...family.events]);

  const beginEditingBoard = () => {
    setEditedMd(family.boardMarkdown);
    setIsEditingMd(true);
  };

  const endEditingBoard = () => {
    setIsEditingMd(false);

    if (editedMd === family.boardMarkdown) return;

    setDoc(doc(db, 'families', profile.familyId), { boardMarkdown: editedMd }, { merge: true }).then(() => {
      getFamily();
      setEditedMd(null);
    });
  };

  const addNewEvent = () => {
    let convertedEvent = { ...newEvent };

    convertedEvent.start = convertedEvent.start.toString();
    convertedEvent.end = convertedEvent.end.toString();

    updateDoc(doc(db, 'families', profile.familyId), { events: arrayUnion(convertedEvent) }).then(() => getFamily());

    setAddingEvent(false);
    setNewEvent(defaultEvent);
  };

  const handleEventSelection= (calEvent) => {
    setEditingEvent(true);
    setEventBeingEdited({ ...calEvent, originalTitle: calEvent.title });
  };

  const updateEvent = () => {
    const updEvArr = [...family.events];
    updEvArr[updEvArr.findIndex(ev => ev.title === eventBeingEdited.originalTitle)] = {
      title: eventBeingEdited.title,
      start: eventBeingEdited.start.toString(),
      end: eventBeingEdited.end.toString()
    };

    updateDoc(doc(db, 'families', profile.familyId), { events: updEvArr }).then(() => getFamily());

    setEditingEvent(false);
  };

  const deleteEvent = () => {
    const updEvArr = [...family.events];
    updEvArr.splice(updEvArr.findIndex(ev => ev.title === eventBeingEdited.originalTitle), 1);

    updateDoc(doc(db, 'families', profile.familyId), { events: updEvArr }).then(() => getFamily());

    setEditingEvent(false);
  };

  useEffect(() => {
    let fmtdEvts = [...family.events];

    if (fmtdEvts) {
      fmtdEvts.forEach(ev => {
        ev.start = new Date(ev.start);
        ev.end = new Date(ev.end);
      });

      setDateConvertedEvents(fmtdEvts);
    }
  }, [family]);
  
  return (
    <Box maxWidth='lg' mx='auto' mt={2}>
      <Typography variant='h3' mb={2}>Information</Typography>
      
      <Paper sx={{ p: 2, mt: 3 }}>
        <Box data-color-mode='light'>
          <Typography variant='h4' mb={2}>Family Board</Typography>
          
          { isEditingMd ?
            <MDEditor value={editedMd} onChange={setEditedMd} />
            :
            <MDEditor.Markdown style={{ padding: 15 }} source={family.boardMarkdown} />
          }

          <Box mt={3}>
            { userId === family.headOfFamily && !isEditingMd &&
              <Button variant='contained' startIcon={<Edit />} onClick={beginEditingBoard}>Edit Board</Button>
            }
            { userId === family.headOfFamily && isEditingMd &&
              <Button variant='contained' startIcon={<Save />} onClick={endEditingBoard}>Save Changes</Button>
            }
          </Box>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 2, mt: 3 }}>
        <Box>
          <Typography variant='h4' mb={2}>Family Calendar</Typography>

          <Calendar
            events={dateConvertedEvents}
            step={15}
            localizer={localizer}
            style={{ height: 750 }}
            onSelectEvent={handleEventSelection}
          />

          <Box mt={2}>
            <Button variant='contained' startIcon={<Add />} onClick={() => setAddingEvent(true)}>Add Event</Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={addingEvent} onClose={() => setAddingEvent(false)}>
          <DialogTitle>Add Event</DialogTitle>

          <DialogContent>
              <Stack>
                  <TextField
                      autoFocus
                      variant='standard'
                      label='Event Name'
                      value={newEvent.title}
                      onChange={(event) => setNewEvent({ ...newEvent, title: event.target.value })}
                  />

                  <LocalizationProvider dateAdapter={AdapterLuxon}>
                      <DateTimePicker
                          label='Start Date/Time'
                          value={newEvent.start}
                          onChange={(newVal) => setNewEvent({ ...newEvent, start: newVal })}
                          renderInput={(params) => <TextField { ...params } variant='standard' />}
                      />
                  </LocalizationProvider>

                  <LocalizationProvider dateAdapter={AdapterLuxon}>
                      <DateTimePicker
                          label='End Date/Time'
                          value={newEvent.end}
                          onChange={(newVal) => setNewEvent({ ...newEvent, end: newVal })}
                          renderInput={(params) => <TextField { ...params } variant='standard' />}
                      />
                  </LocalizationProvider>
              </Stack>
          </DialogContent>

          <DialogActions>
              <Button onClick={() => setAddingEvent(false)}>Cancel</Button>
              <Button variant='contained' onClick={addNewEvent}>Save</Button>
          </DialogActions>
      </Dialog>

      <Dialog open={editingEvent} onClose={() => setEditingEvent(false)}>
          <DialogTitle>Edit Event</DialogTitle>

          <DialogContent>
              <Stack>
                  <TextField
                      variant='standard'
                      label='Event Name'
                      value={eventBeingEdited.title}
                      onChange={(event) => setEventBeingEdited({ ...eventBeingEdited, title: event.target.value })}
                      autoFocus
                  />

                  <LocalizationProvider dateAdapter={AdapterLuxon}>
                      <DateTimePicker
                          label='Start Date/Time'
                          value={eventBeingEdited.start}
                          onChange={(newVal) => setEventBeingEdited({ ...eventBeingEdited, start: newVal })}
                          renderInput={(params) => <TextField { ...params } variant='standard' />}
                      />
                  </LocalizationProvider>

                  <LocalizationProvider dateAdapter={AdapterLuxon}>
                      <DateTimePicker
                          label='End Date/Time'
                          value={eventBeingEdited.end}
                          onChange={(newVal) => setEventBeingEdited({ ...eventBeingEdited, end: newVal })}
                          renderInput={(params) => <TextField { ...params } variant='standard' />}
                      />
                  </LocalizationProvider>
              </Stack>
          </DialogContent>

          <DialogActions>
              <Button onClick={() => setEditingEvent(false)}>Cancel</Button>
              <Button variant='contained' onClick={updateEvent}>Update</Button>
              <Button variant='text' color='error' onClick={deleteEvent}>Delete</Button>
          </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Information;
