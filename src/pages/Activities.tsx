import { Container, Heading, Text, Stack, Card, CardBody, Button } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { MdShoppingCart, MdEventNote, MdSports } from 'react-icons/md';

const Activities = () => {
    return (
        <Container maxWidth='container.lg' mt={4}>
            <Heading size='2xl' mb={4}>
                Family Activities
            </Heading>

            <Text fontSize='lg' mb={6} color='gray.600'>
                Manage and track your family's activities and events.
            </Text>

            <Stack spacing={4}>
                <Card>
                    <CardBody>
                        <Stack direction='row' align='center' spacing={4}>
                            <MdShoppingCart size={32} />
                            <Stack flex={1}>
                                <Heading size='md'>Shopping & Checkout</Heading>
                                <Text color='gray.600'>
                                    Review and checkout items from your grocery list and manage shopping activities.
                                </Text>
                            </Stack>
                            <Link to='/activities/checkout'>
                                <Button colorScheme='green'>Go to Checkout</Button>
                            </Link>
                        </Stack>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stack direction='row' align='center' spacing={4}>
                            <MdEventNote size={32} />
                            <Stack flex={1}>
                                <Heading size='md'>Upcoming Events</Heading>
                                <Text color='gray.600'>
                                    Plan and track family events, activities, and important dates.
                                </Text>
                            </Stack>
                            <Button colorScheme='blue' isDisabled>
                                Coming Soon
                            </Button>
                        </Stack>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stack direction='row' align='center' spacing={4}>
                            <MdSports size={32} />
                            <Stack flex={1}>
                                <Heading size='md'>Recreation & Sports</Heading>
                                <Text color='gray.600'>
                                    Track sports activities, recreational events, and fitness goals.
                                </Text>
                            </Stack>
                            <Button colorScheme='orange' isDisabled>
                                Coming Soon
                            </Button>
                        </Stack>
                    </CardBody>
                </Card>
            </Stack>
        </Container>
    );
};

export default Activities;
