import { Card, CardBody, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { MdShoppingCart } from 'react-icons/md';

const Activities = () => {
    return (
        <Container maxWidth='container.lg' mt={4}>
            <Heading size='2xl' mb={4}>
                Activities
            </Heading>

            <Text fontSize='lg' mb={6} color='gray.600'>
                Fun activities for the family!
            </Text>

            <Stack spacing={4}>
                <Link to='/activities/checkout'>
                    <Card
                        cursor='pointer'
                        _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                        transition='all 0.2s'
                    >
                        <CardBody>
                            <Stack direction='row' align='center' spacing={4}>
                                <MdShoppingCart size={32} />
                                <Stack flex={1}>
                                    <Heading size='md'>Checkout</Heading>
                                    <Text color='gray.600'>A cash register simulator with barcode scanning</Text>
                                </Stack>
                            </Stack>
                        </CardBody>
                    </Card>
                </Link>
            </Stack>
        </Container>
    );
};

export default Activities;
