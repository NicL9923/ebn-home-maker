import { Box, Button, Divider, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useUserStore } from '../state/UserStore';
import CreateFamily from './Forms/CreateFamily';

const NoFamily = () => {
    const [creatingFamily, setCreatingFamily] = useState(false);
    const profile = useUserStore((state) => state.profile);

    if (!profile) return null;

    return (
        <Box maxWidth='sm' mx='auto' p={2} textAlign='center'>
            <Heading size='md' mb={2}>
                {`Hey ${profile.firstName}!`}
            </Heading>
            <Heading size='lg' mb={3}>
                We couldn&apos;t find a family for this profile!
            </Heading>

            <Text>Ask your head-of-household(s) for the family invite link</Text>

            <Flex align='center' sx={{ width: 250, mx: 'auto', mt: 2, mb: 2 }}>
                <Divider />
                <Text padding='2'>OR</Text>
                <Divider />
            </Flex>

            <Stack direction='row' justifyContent='center'>
                <Button onClick={() => setCreatingFamily(true)} colorScheme='green'>
                    Create a family
                </Button>
            </Stack>

            <CreateFamily isOpen={creatingFamily} setIsOpen={setCreatingFamily} />
        </Box>
    );
};

export default NoFamily;
