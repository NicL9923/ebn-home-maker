import React, { useContext, useEffect, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import { FirebaseContext } from '..';
import { UserContext } from '../App';
import { Add, Edit, Save } from '@mui/icons-material';
import { doc, setDoc } from 'firebase/firestore';
import { Calendar, luxonLocalizer } from 'react-big-calendar';
import { DateTime } from 'luxon';

const localizer = luxonLocalizer(DateTime);

const Information = () => {
  const { db } = useContext(FirebaseContext);
  const { userId, profile, family, getFamily } = useContext(UserContext);
  const [upcomingEvents, setUpcomingEvents] = useState(null);
  const [isEditingMd, setIsEditingMd] = useState(false);
  const [editedMd, setEditedMd] = useState(null);

  let dateConvertedEvents = family.events;

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

  const checkForUpcomingEvents = () => {
    if (!family.events) return;

    const upcEv = [];

    family.events.forEach(event => {
      // TODO: check for upcoming events (in the next week)
    });

    setUpcomingEvents(upcEv);
  };

  useEffect(() => {
    checkForUpcomingEvents();

    dateConvertedEvents = family.events;
    if (dateConvertedEvents) {
      dateConvertedEvents.forEach(ev => {
        ev.start = new Date(Date(ev.start));
        ev.end = new Date(Date(ev.end));
      });
    }
  }, [family]);
  
  return (
    <Box maxWidth='lg' mx='auto' mt={2}>
      <Typography variant='h3' mb={2}>Information</Typography>

      <Paper sx={{ p: 2 }}>
        <Box>
          <Typography variant='h4'>Upcoming Events</Typography>

          <Stack mt={2}>
            { upcomingEvents && upcomingEvents.map(event => 
              <Alert key={`${event.name}-${event.date}`} severity='info'>{event.date} - {event.name}</Alert>
            )}

            { !upcomingEvents && 
              <Typography variant='h6'>Looks like this week is clear!</Typography>
            }
          </Stack>
        </Box>
      </Paper>
      
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
            // selectable
            // onSelectEvent
            // onSelectSlot - these are for later, potentially to click/delete events
          />

          <Box mt={2}>
            <Button variant='contained' startIcon={<Add />} onClick={() => {}}>Add Event</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Information;
