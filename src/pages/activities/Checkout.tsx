import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Container,
    Divider,
    Grid,
    Heading,
    HStack,
    IconButton,
    Text,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { MdArrowBack, MdBarcodeReader, MdDelete, MdShoppingCart } from 'react-icons/md';
import { BarcodeScannerModal } from '../../components/Activities/Checkout/BarcodeScannerModal';
import { genUuid } from '../../utils/utils';

interface GroceryItem {
    id: string;
    name: string;
    price: number;
    image: string;
    barcode: string;
}

const GROCERY_ITEMS: GroceryItem[] = [
    { id: '1', name: 'Apple', price: 1.99, image: '🍎', barcode: '123456789' },
    { id: '2', name: 'Banana', price: 0.99, image: '🍌', barcode: '987654321' },
    { id: '3', name: 'Milk', price: 3.49, image: '🥛', barcode: '456789123' },
    { id: '4', name: 'Bread', price: 2.99, image: '🍞', barcode: '789123456' },
    { id: '5', name: 'Cheese', price: 4.99, image: '🧀', barcode: '321654987' },
    { id: '6', name: 'Eggs', price: 3.99, image: '🥚', barcode: '654987321' },
    { id: '7', name: 'Orange', price: 2.49, image: '🍊', barcode: '147258369' },
    { id: '8', name: 'Carrot', price: 1.79, image: '🥕', barcode: '369258147' },
    { id: '9', name: 'Chicken', price: 8.99, image: '🍗', barcode: '258147369' },
    { id: '10', name: 'Tomato', price: 2.99, image: '🍅', barcode: '741852963' },
];

const hashBarcodeToPrice = (barcode: string): number => {
    let hash = 0;
    for (let i = 0; i < barcode.length; i++) {
        const char = barcode.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to price between $1.00 and $20.00
    return ((Math.abs(hash) % 1900) + 100) / 100;
};

interface CartItem extends GroceryItem {
    quantity: number;
}

const Checkout = () => {
    const toast = useToast();
    const { isOpen: isScannerOpen, onOpen: openScanner, onClose: closeScanner } = useDisclosure();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);

    const addToCart = useCallback(
        (item: (typeof GROCERY_ITEMS)[0]) => {
            setCart((prevCart) => {
                const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
                if (existingItem) {
                    const updatedCart = prevCart.map((cartItem) =>
                        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
                    );
                    setTotal((prev) => prev + item.price);
                    return updatedCart;
                } else {
                    const newCartItem: CartItem = { ...item, quantity: 1 };
                    setTotal((prev) => prev + item.price);
                    return [...prevCart, newCartItem];
                }
            });

            toast({
                title: `Added ${item.name}`,
                description: `$${item.price.toFixed(2)} added to cart`,
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        },
        [toast],
    );

    const removeFromCart = useCallback((itemId: string) => {
        setCart((prevCart) => {
            const item = prevCart.find((cartItem) => cartItem.id === itemId);
            if (!item) return prevCart;

            if (item.quantity > 1) {
                setTotal((prev) => prev - item.price);
                return prevCart.map((cartItem) =>
                    cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
                );
            } else {
                setTotal((prev) => prev - item.price);
                return prevCart.filter((cartItem) => cartItem.id !== itemId);
            }
        });
    }, []);

    const handleBarcodeScan = useCallback(
        (data: string) => {
            if (!data) return;

            const knownItem = GROCERY_ITEMS.find((item) => item.barcode === data);

            if (knownItem) {
                addToCart(knownItem);
            } else {
                const price = hashBarcodeToPrice(data);
                const scannedItem: GroceryItem = {
                    id: genUuid(),
                    name: `Scanned item`,
                    price: price,
                    image: '📦',
                    barcode: data,
                };
                addToCart(scannedItem);
            }

            closeScanner();
        },
        [addToCart, closeScanner],
    );

    const clearCart = useCallback(() => {
        setCart([]);
        setTotal(0);
        toast({
            title: 'Cart cleared',
            description: 'All items removed from cart',
            status: 'info',
            duration: 2000,
            isClosable: true,
        });
    }, [toast]);

    const completePurchase = useCallback(() => {
        if (cart.length === 0) {
            toast({
                title: 'Empty cart',
                description: 'Add some items to purchase',
                status: 'warning',
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        toast({
            title: 'Purchase Complete! 🎉',
            description: `Total: $${total.toFixed(2)} - Thank you for shopping!`,
            status: 'success',
            duration: 4000,
            isClosable: true,
        });

        clearCart();
    }, [cart.length, total, toast, clearCart]);

    return (
        <Container maxWidth='container.xl' mt={4}>
            <Link to='/activities'>
                <Button leftIcon={<MdArrowBack />} variant='link' colorScheme='blue' mb={4}>
                    Back to Activities
                </Button>
            </Link>

            <VStack spacing={6} align='stretch'>
                <Box textAlign='center'>
                    <Heading size='xl' mb={2} color='green.600'>
                        🛒 Checkout 🛒
                    </Heading>
                    <Text fontSize='lg' color='gray.600'>
                        Scan barcodes or click items to add them to your cart!
                    </Text>
                </Box>

                <Card borderColor='green.200' borderWidth={2}>
                    <CardBody textAlign='center'>
                        <VStack spacing={2}>
                            <Text fontSize='sm' color='gray.600' fontWeight='bold'>
                                TOTAL
                            </Text>
                            <Text fontSize='4xl' fontWeight='bold' color='green.600'>
                                ${total.toFixed(2)}
                            </Text>
                            <HStack spacing={4}>
                                <Button
                                    leftIcon={<MdBarcodeReader />}
                                    colorScheme='blue'
                                    onClick={openScanner}
                                    size='lg'
                                >
                                    Scan barcode
                                </Button>
                                <Button
                                    leftIcon={<MdShoppingCart />}
                                    colorScheme='green'
                                    onClick={completePurchase}
                                    size='lg'
                                    isDisabled={cart.length === 0}
                                >
                                    Purchase
                                </Button>
                                <Button
                                    leftIcon={<MdDelete />}
                                    colorScheme='red'
                                    variant='outline'
                                    onClick={clearCart}
                                    size='lg'
                                    isDisabled={cart.length === 0}
                                >
                                    Clear
                                </Button>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(2, 1fr)' }} gap={6}>
                    <Card>
                        <CardBody>
                            <Heading size='md' mb={4} textAlign='center' color='blue.600'>
                                Groceries
                            </Heading>
                            <Grid templateColumns='repeat(3, 1fr)' gap={3}>
                                {GROCERY_ITEMS.map((item) => (
                                    <Card
                                        key={item.id}
                                        cursor='pointer'
                                        onClick={() => addToCart(item)}
                                        _hover={{ shadow: 'md', transform: 'scale(1.05)' }}
                                        transition='all 0.2s'
                                        borderWidth={1}
                                    >
                                        <CardBody p={3} textAlign='center'>
                                            <VStack spacing={2}>
                                                <Text fontSize='2xl'>{item.image}</Text>
                                                <Text fontSize='sm' fontWeight='bold' noOfLines={1}>
                                                    {item.name}
                                                </Text>
                                                <Badge colorScheme='green' fontSize='xs'>
                                                    ${item.price.toFixed(2)}
                                                </Badge>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                ))}
                            </Grid>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Heading size='md' mb={4} textAlign='center' color='orange.600'>
                                Shopping cart
                            </Heading>
                            {cart.length === 0 ? (
                                <Box textAlign='center' py={8} color='gray.500'>
                                    <Text fontSize='lg'>Your cart is empty</Text>
                                    <Text fontSize='sm'>Click items or scan barcodes to add them!</Text>
                                </Box>
                            ) : (
                                <VStack spacing={3} divider={<Divider />}>
                                    {cart.map((item) => (
                                        <HStack key={item.id} justify='space-between' w='full'>
                                            <HStack spacing={3}>
                                                <Text fontSize='lg'>{item.image}</Text>
                                                <VStack align='start' spacing={0}>
                                                    <Text fontWeight='bold' fontSize='sm'>
                                                        {item.name}
                                                    </Text>
                                                    <Text fontSize='xs' color='gray.500'>
                                                        ${item.price.toFixed(2)} each
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <HStack spacing={2}>
                                                <Badge colorScheme='blue'>x{item.quantity}</Badge>
                                                <IconButton
                                                    icon={<MdDelete />}
                                                    size='sm'
                                                    colorScheme='red'
                                                    variant='ghost'
                                                    onClick={() => removeFromCart(item.id)}
                                                    aria-label='Remove item'
                                                />
                                            </HStack>
                                        </HStack>
                                    ))}
                                    <Box pt={3} borderTopWidth={2} borderColor='gray.200' w='full'>
                                        <HStack justify='space-between'>
                                            <Text fontWeight='bold'>Items:</Text>
                                            <Text fontWeight='bold'>
                                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                            </Text>
                                        </HStack>
                                    </Box>
                                </VStack>
                            )}
                        </CardBody>
                    </Card>
                </Grid>
            </VStack>

            <BarcodeScannerModal
                isOpen={isScannerOpen}
                handleBarcodeScan={handleBarcodeScan}
                closeScanner={closeScanner}
            />
        </Container>
    );
};

export default Checkout;
