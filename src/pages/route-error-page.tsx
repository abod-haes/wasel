import { AlertTriangle, RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { Button, Card, CardContent } from '@/components/ui';
import { isChunkLoadError } from '@/lib/chunk-recovery';

export default function RouteErrorPage(): React.JSX.Element {
  const error = useRouteError();
  const isStaleChunk = isChunkLoadError(error);
  const status = isRouteErrorResponse(error) ? error.status : undefined;

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground"
    >
      <Card className="w-full max-w-lg border-border/70 shadow-floating">
        <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {isStaleChunk ? 'صار تحديث جديد للداشبورد' : 'تعذر فتح الصفحة'}
            </h1>
            <p className="leading-7 text-muted-foreground">
              {isStaleChunk
                ? 'النسخة المفتوحة عندك أقدم من آخر نسخة منشورة. حدّث الصفحة لنحمّل الملفات الجديدة.'
                : status
                  ? `تعذر تحميل الصفحة المطلوبة (رمز ${status}). جرّب إعادة التحميل.`
                  : 'صار خطأ غير متوقع أثناء تحميل الصفحة. جرّب إعادة التحميل.'}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row-reverse sm:justify-center">
            <Button
              type="button"
              className="gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              إعادة تحميل الصفحة
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.assign('/')}
            >
              العودة للرئيسية
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
