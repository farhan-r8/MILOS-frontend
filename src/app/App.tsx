import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeProvider';

export default function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </RealtimeProvider>
    </AuthProvider>
  );
}
