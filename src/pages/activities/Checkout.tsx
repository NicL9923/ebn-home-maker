import {
    Container,
    Heading,
    Text,
    Stack,
    Card,
    CardBody,
    Button,
    Badge,
    Divider,
    Box,
    useToast,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { MdArrowBack, MdShoppingCart, MdCheck } from 'react-icons/md';
import { useUserStore } from '../../state/UserStore';
import Client from '../../Client';

const Checkout = () => {
    const toast = useToast();
    const family = useUserStore((state) => state.family);
    const profile = useUserStore((state) => state.profile);
    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

    const groceryItems = family?.groceryList || [];

    const { boughtItems, unboughtItems, totalItems } = useMemo(() => {
        const bought = groceryItems.filter((item) => item.isBought);
        const unbought = groceryItems.filter((item) => !item.isBought);
        return {
            boughtItems: bought,
            unboughtItems: unbought,
            totalItems: groceryItems.length,
        };
    }, [groceryItems]);

    const processCheckout = async () => {
        if (!family || !profile) return;

        setIsProcessingCheckout(true);
        try {
            // Remove all purchased items from the grocery list
            const updatedGroceryList = groceryItems.filter((item) => !item.isBought);

            await Client.updateFamily(profile.familyId, { groceryList: updatedGroceryList });

            toast({
                title: 'Checkout Complete!',
                description: `Removed ${boughtItems.length} purchased items from your grocery list.`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Checkout Failed',
                description: 'There was an error processing your checkout.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsProcessingCheckout(false);
        }
    };

    return (
        <Container maxWidth='container.md' mt={4}>
            <Link to='/activities'>
                <Button leftIcon={<MdArrowBack />} variant='link' colorScheme='blue' mb={4}>
                    Back to Activities
                </Button>
            </Link>

            <Stack spacing={6}>
                <Box>
                    <Heading size='xl' mb={2}>
                        Shopping Checkout
                    </Heading>
                    <Text fontSize='lg' color='gray.600'>
                        Review your shopping progress and complete your checkout.
                    </Text>
                </Box>

                {/* Summary Cards */}
                <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <Card flex={1}>
                        <CardBody textAlign='center'>
                            <Text fontSize='2xl' fontWeight='bold' color='green.500'>
                                {boughtItems.length}
                            </Text>
                            <Text color='gray.600'>Items Purchased</Text>
                        </CardBody>
                    </Card>
                    <Card flex={1}>
                        <CardBody textAlign='center'>
                            <Text fontSize='2xl' fontWeight='bold' color='orange.500'>
                                {unboughtItems.length}
                            </Text>
                            <Text color='gray.600'>Items Remaining</Text>
                        </CardBody>
                    </Card>
                    <Card flex={1}>
                        <CardBody textAlign='center'>
                            <Text fontSize='2xl' fontWeight='bold' color='blue.500'>
                                {totalItems}
                            </Text>
                            <Text color='gray.600'>Total Items</Text>
                        </CardBody>
                    </Card>
                </Stack>

                {/* Checkout Action */}
                {boughtItems.length > 0 ? (
                    <Card>
                        <CardBody>
                            <Stack spacing={4}>
                                <Box>
                                    <Heading size='md' mb={2}>
                                        Ready to Checkout
                                    </Heading>
                                    <Text color='gray.600'>
                                        You have {boughtItems.length} purchased item(s) ready to be removed from your
                                        grocery list.
                                    </Text>
                                </Box>
                                <Button
                                    leftIcon={<MdShoppingCart />}
                                    colorScheme='green'
                                    size='lg'
                                    onClick={processCheckout}
                                    isLoading={isProcessingCheckout}
                                    loadingText='Processing...'
                                >
                                    Complete Checkout
                                </Button>
                            </Stack>
                        </CardBody>
                    </Card>
                ) : (
                    <Alert status='info'>
                        <AlertIcon />
                        <Box>
                            <AlertTitle>No items to checkout!</AlertTitle>
                            <AlertDescription>
                                Mark items as purchased in your grocery list to see them here for checkout.
                            </AlertDescription>
                        </Box>
                    </Alert>
                )}

                {/* Purchased Items List */}
                {boughtItems.length > 0 && (
                    <Card>
                        <CardBody>
                            <Heading size='md' mb={4}>
                                Purchased Items
                            </Heading>
                            <Stack spacing={2} divider={<Divider />}>
                                {boughtItems.map((item, index) => (
                                    <Stack key={item.uid} direction='row' align='center' justify='space-between' py={2}>
                                        <Text>{item.name}</Text>
                                        <Badge colorScheme='green' variant='subtle'>
                                            <MdCheck style={{ marginRight: 4 }} />
                                            Purchased
                                        </Badge>
                                    </Stack>
                                ))}
                            </Stack>
                        </CardBody>
                    </Card>
                )}

                {/* Remaining Items List */}
                {unboughtItems.length > 0 && (
                    <Card>
                        <CardBody>
                            <Heading size='md' mb={4}>
                                Remaining Items
                            </Heading>
                            <Stack spacing={2} divider={<Divider />}>
                                {unboughtItems.map((item, index) => (
                                    <Stack key={item.uid} direction='row' align='center' justify='space-between' py={2}>
                                        <Text>{item.name}</Text>
                                        <Badge colorScheme='orange' variant='subtle'>
                                            Pending
                                        </Badge>
                                    </Stack>
                                ))}
                            </Stack>
                        </CardBody>
                    </Card>
                )}
            </Stack>
        </Container>
    );
};

export default Checkout;
