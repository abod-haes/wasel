import { AppProviders } from '@/app/providers/app-providers';
import { AppRouter } from '@/app/router/router';

export function App(): React.JSX.Element {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
