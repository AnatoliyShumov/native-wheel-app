import { Stack } from 'expo-router';

import  Welcome  from '@/templates/WhellApp';
import  CameraApp  from '@/templates/CameraApp';

const Home = () => (
  <>
    <Stack.Screen
      options={{
        title: 'My home',
      }}
    />
    <CameraApp />
  </>
);

export default Home;
