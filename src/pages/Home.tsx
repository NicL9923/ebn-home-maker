import { Card, CardBody, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { MdList, MdOutlineEventNote, MdOutlinePayments, MdOutlineSettings, MdLocalActivity } from 'react-icons/md';
import Clock from '../components/Clock';
import { useUserStore } from '../state/UserStore';

interface MajorLinkCardProps {
    link: '/finances' | '/grocerylist' | '/familyboard' | '/maintenance' | '/activities';
    icon: JSX.Element;
    text: string;
}

const MajorLinkCard = (props: MajorLinkCardProps) => {
    const { link, icon, text } = props;

    return (
        <Link to={link}>
            <Card align='center'>
                <CardBody padding='12px'>
                    <Stack direction='row' align='center'>
                        {icon}
                        <Text fontSize={18}>{text}</Text>
                    </Stack>
                </CardBody>
            </Card>
        </Link>
    );
};

const Home = () => {
    const profile = useUserStore((state) => state.profile);
    const family = useUserStore((state) => state.family);

    return (
        <Container centerContent>
            {family && <Heading mt='5'>The {family.name} family</Heading>}

            {profile && <Text fontSize='xl'>Welcome back, {profile.firstName}!</Text>}

            <Heading size='lg' mt={5} mb={3}>
                <Clock />
            </Heading>

            <Stack spacing='1rem' mt='36px'>
                <MajorLinkCard link='/finances' icon={<MdOutlinePayments />} text='Finances' />

                <Stack direction='row'>
                    <MajorLinkCard link='/grocerylist' icon={<MdList />} text='Grocery list' />

                    <MajorLinkCard link='/familyboard' icon={<MdOutlineEventNote />} text='Family board' />
                </Stack>

                <Stack direction='row'>
                    <MajorLinkCard link='/activities' icon={<MdLocalActivity />} text='Activities' />

                    <MajorLinkCard link='/maintenance' icon={<MdOutlineSettings />} text='Home & Auto maintenance' />
                </Stack>
            </Stack>
        </Container>
    );
};

export default Home;
