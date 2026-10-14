import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Image, ImageOff, Images, RefreshCw } from 'lucide-react';

import { PageContainer, SectionHeader } from '@/components/shared';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { productImageStatsApi } from '@/features/settings/api/product-image-stats-api';

const formatNumber = (value: number): string => new Intl.NumberFormat('ar').format(value);

export default function ProductImageStatsPage(): React.JSX.Element {
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['settings', 'product-image-stats'],
    queryFn: productImageStatsApi.getStats,
    staleTime: 60_000,
    retry: 1,
  });

  const cards = data ? [
    { label: 'منتجات لديها صور', value: data.productsWithImage, icon: Image },
    { label: 'منتجات بدون صور', value: data.productsWithoutImage, icon: ImageOff },
    { label: 'منتجات بصور غير صالحة', value: data.productsWithBrokenImages, icon: AlertTriangle },
    { label: 'صور النكهات', value: data.variantImages, icon: Images },
    { label: 'نكهات بدون صور', value: data.variantsWithoutImage, icon: ImageOff },
  ] : [];

  const totalProducts = data ? data.productsWithImage + data.productsWithoutImage : 0;
  const coverage = data && totalProducts > 0 ? Math.round((data.productsWithImage / totalProducts) * 100) : 0;

  return (
    <PageContainer>
      <SectionHeader titleKey="إحصائيات صور المنتجات" descriptionKey="متابعة تغطية صور المنتجات والنكهات مباشرةً من السيرفر." />
      <div className="mb-4 flex justify-end">
        <Button type="button" variant="outline" disabled={isFetching} onClick={() => void refetch()} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          تحديث الإحصائيات
        </Button>
      </div>
      {isPending ? (
        <p className="py-10 text-center text-muted-foreground" role="status">جاري تحميل إحصائيات الصور...</p>
      ) : isError || !data ? (
        <Card><CardContent className="space-y-3 p-6 text-center">
          <p role="alert" className="text-destructive">تعذّر جلب إحصائيات الصور. تأكد من الاتصال والصلاحيات ثم حاول مجدداً.</p>
          <Button variant="outline" onClick={() => void refetch()}>إعادة المحاولة</Button>
        </CardContent></Card>
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent><p className="text-3xl font-bold tabular-nums" dir="ltr">{formatNumber(value)}</p></CardContent>
              </Card>
            ))}
          </div>
          <Card><CardHeader><CardTitle>تغطية صور المنتجات</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <span>المنتجات التي تحتوي على صورة من إجمالي {formatNumber(totalProducts)} منتج</span>
                <strong>{coverage}%</strong>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={coverage} aria-valuemin={0} aria-valuemax={100} aria-label="نسبة تغطية صور المنتجات">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${coverage}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">تُحسب النسبة من المنتجات التي لديها صور والمنتجات بدون صور. صور النكهات لا تدخل بالحساب.</p>
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  );
}
