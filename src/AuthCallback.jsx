import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pocketbase-albert.temtem.africa');

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Support both hash and query params
    const params = new URLSearchParams(window.location.hash.substring(1) || window.location.search.substring(1));
    const token = params.get('token');
    const user = params.get('user');
    if (token && user) {
      pb.authStore.save(token, JSON.parse(decodeURIComponent(user)));
      // Redirect to main app page
      navigate('/', { replace: true });
    } else {
      // Handle error or show a message
      navigate('/?oauth_error=1', { replace: true });
    }
  }, [navigate]);

  return <div>Logging you in with Google...</div>;
}
