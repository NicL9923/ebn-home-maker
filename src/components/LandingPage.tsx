import { Box, Button, Flex, Heading, Icon, Stack, Text, useBreakpointValue, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { FaWrench } from 'react-icons/fa';
import { MdAccountBalance, MdChecklist } from 'react-icons/md';

const LandingPage = () => {
  return (
    <>
      <Flex
        w='full'
        h='96vh'
        backgroundImage='url(https://firebasestorage.googleapis.com/v0/b/our-home-239c1.appspot.com/o/ebn-home-maker-bg.jpg?alt=media&token=2045c3e9-8f39-4005-8ee8-874adfbedfb9)'
        backgroundSize='cover'
        backgroundPosition='center center'
      >
        <VStack
          w='full'
          justify='center'
          px={useBreakpointValue({ base: 4, md: 8 })}
          bgGradient='linear(to-r, blackAlpha.800, transparent)'
        >
          <Stack as={Box} textAlign='center' spacing={{ base: 8, md: 14 }} py={{ base: 20, md: 36 }}>
            <Heading color='white' fontWeight={600} fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }} lineHeight='110%'>
              Don&apos;t let your home run <br />
              <Text as='span' color='green.300' textDecoration='underline' textUnderlineOffset='20px'>
                you
              </Text>
              .
            </Heading>
            <Text color='white' fontSize='lg'>
              Create an account & profile, then create or join a family to get started!
            </Text>
            <Stack direction={'column'} spacing={3} align='center' alignSelf='center' position='relative'>
              <Link href='/signup'>
                <Button
                  colorScheme='green'
                  bg='green.400'
                  px={6}
                  _hover={{
                    bg: 'green.500',
                  }}
                >
                  Create an account
                </Button>
              </Link>

              <Link href='#home-maker-details'>
                <Button variant='link' color='blue.300' size='sm'>
                  Learn more
                </Button>
              </Link>
            </Stack>
          </Stack>
        </VStack>
      </Flex>

      <Stack id='home-maker-details' direction='row' justifyContent='space-evenly' alignItems='center' height='50vh'>
        <Box>
          <Stack direction='column' justifyContent='center' alignItems='center' width={250} textAlign='center'>
            <Icon as={MdAccountBalance} fontSize={64} />
            <Heading size='md' mt={4}>
              Manage your finances
            </Heading>
            <Text>(budget / savings / transactions)</Text>
          </Stack>
        </Box>
        <Box>
          <Stack direction='column' justifyContent='center' alignItems='center' width={250} textAlign='center'>
            <Icon as={MdChecklist} fontSize={64} />
            <Heading size='md' mt={4}>
              Manage your household
            </Heading>
            <Text>(grocery list / family info board)</Text>
          </Stack>
        </Box>
        <Box>
          <Stack direction='column' justifyContent='center' alignItems='center' width={250} textAlign='center'>
            <Icon as={FaWrench} fontSize={64} />
            <Heading size='md' mt={4}>
              Keep up on maintenance
            </Heading>
            <Text>(home / auto)</Text>
          </Stack>
        </Box>
      </Stack>
    </>
  );
};

export default LandingPage;
