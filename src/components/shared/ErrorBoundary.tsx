import { Component, type ErrorInfo, type ReactNode } from 'react';

import i18n from '@/i18n';
import { Button, Card, CardContent } from '@/components/ui';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  public constructor(props: { children: ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="container py-12">
          <Card>
            <CardContent className="space-y-4 py-8 text-center">
              <h2 className="text-xl font-semibold">{i18n.t('states.error.title')}</h2>
              <p className="text-sm text-muted-foreground">{i18n.t('states.error.description')}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                {i18n.t('common.reset')}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
