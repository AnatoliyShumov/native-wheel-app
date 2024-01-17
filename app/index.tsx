import { Stack } from 'expo-router';

import  Welcome  from '@/templates/WhellApp';

const Home = () => (
  <>
    <Stack.Screen
      options={{
        title: 'My home',
      }}
    />
    <Welcome />
  </>
);

export default Home;
