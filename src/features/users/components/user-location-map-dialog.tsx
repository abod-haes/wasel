import { Crosshair, LocateFixed, MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/components/ui';
import { env } from '@/env';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface UserLocationMapDialogProps {
  open: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (coordinate: Coordinate & { address: string }) => void;
}

interface GoogleLatLng {
  lat(): number;
  lng(): number;
}

interface GoogleMap {
  addListener(event: 'click', handler: (event: { latLng?: GoogleLatLng }) => void): void;
  panTo(coordinate: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
}

interface GoogleMarker {
  addListener(event: 'dragend', handler: () => void): void;
  getPosition(): GoogleLatLng | undefined;
  setPosition(coordinate: { lat: number; lng: number }): void;
  setMap(map: GoogleMap | null): void;
}

interface GoogleGeocodingResult {
  formatted_address: string;
  geometry: { location: GoogleLatLng };
}

interface GoogleGeocoder {
  geocode(
    request: { address?: string; location?: { lat: number; lng: number } },
    callback: (results: GoogleGeocodingResult[] | null, status: string) => void,
  ): void;
}

interface GoogleMaps {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => GoogleMap;
  Marker: new (options: Record<string, unknown>) => GoogleMarker;
  Geocoder: new () => GoogleGeocoder;
  event: { clearInstanceListeners(instance: GoogleMap | GoogleMarker): void };
}

type GoogleMapsWindow = Window & {
  google?: { maps?: GoogleMaps };
  __rodoGoogleMapsReady?: () => void;
  gm_authFailure?: () => void;
};

const ALEPPO: Coordinate = { latitude: 36.2021, longitude: 37.1343 };
let googleMapsLoader: Promise<GoogleMaps> | undefined;

function isValidLocation(latitude?: number, longitude?: number): boolean {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function toGooglePoint(value: Coordinate): { lat: number; lng: number } {
  return { lat: value.latitude, lng: value.longitude };
}

function loadGoogleMaps(key: string): Promise<GoogleMaps> {
  const googleWindow = window as GoogleMapsWindow;
  if (googleWindow.google?.maps?.Map && googleWindow.google.maps.Marker) {
    return Promise.resolve(googleWindow.google.maps);
  }
  if (googleMapsLoader) return googleMapsLoader;

  googleMapsLoader = new Promise<GoogleMaps>((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    const finish = (maps?: GoogleMaps, error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      googleWindow.__rodoGoogleMapsReady = undefined;
      if (maps) {
        resolve(maps);
      } else {
        script.remove();
        reject(error ?? new Error('تعذر تحميل Google Maps. حاول مرة ثانية.'));
      }
    };
    const timeout = window.setTimeout(
      () => finish(undefined, new Error('تأخر تحميل Google Maps. تأكد من اتصال الإنترنت.')),
      20_000,
    );

    googleWindow.gm_authFailure = () => {
      const error = new Error(
        'رفضت Google Maps مفتاح الداشبورد. تأكد من تفعيل Maps JavaScript API ومن إضافة رابط الداشبورد ضمن Website restrictions.',
      );
      finish(undefined, error);
      window.dispatchEvent(new Event('rodo-google-maps-auth-failure'));
    };

    googleWindow.__rodoGoogleMapsReady = () => {
      const maps = googleWindow.google?.maps;
      if (maps?.Map && maps.Marker && maps.Geocoder) {
        finish(maps);
      } else {
        finish(undefined, new Error('خدمة Google Maps غير جاهزة في المتصفح.'));
      }
    };
    script.src =
      'https://maps.googleapis.com/maps/api/js?' +
      new URLSearchParams({
        key,
        callback: '__rodoGoogleMapsReady',
        loading: 'async',
        v: 'weekly',
        language: 'ar',
        region: 'SY',
      }).toString();
    script.async = true;
    script.onerror = () =>
      finish(undefined, new Error('تعذر الاتصال بـ Google Maps. راجع مفتاح الويب وصلاحياته.'));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    googleMapsLoader = undefined;
    throw error;
  });

  return googleMapsLoader;
}

export function UserLocationMapDialog({
  open,
  latitude,
  longitude,
  address = '',
  onOpenChange,
  onConfirm,
}: UserLocationMapDialogProps): React.JSX.Element {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleMarker | null>(null);
  const geocoderRef = useRef<GoogleGeocoder | null>(null);
  const googleMapsRef = useRef<GoogleMaps | null>(null);
  const requestSequenceRef = useRef(0);
  const [selected, setSelected] = useState<Coordinate>(ALEPPO);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
  const [addressText, setAddressText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState('');
  const [addressHint, setAddressHint] = useState('');
  const apiKey = env.googleMapsBrowserApiKey;

  useEffect(() => {
    if (!open) return;
    const onAuthFailure = () => {
      setLoading(false);
      setMapError(
        'مفتاح Google Maps للويب غير مصرح له بعرض الخرائط على هذا الموقع. تحقق من رابط الداشبورد في Website restrictions.',
      );
    };
    window.addEventListener('rodo-google-maps-auth-failure', onAuthFailure);
    return () => window.removeEventListener('rodo-google-maps-auth-failure', onAuthFailure);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const hasExistingLocation = isValidLocation(latitude, longitude);
    setSelected(
      hasExistingLocation ? { latitude: latitude!, longitude: longitude! } : ALEPPO,
    );
    setHasSelectedLocation(hasExistingLocation);
    setAddressText(address);
    setSearchText('');
    setMapError('');
    setAddressHint('');
    setSearching(false);
    setLocating(false);
    setLoading(Boolean(apiKey));
    requestSequenceRef.current += 1;
  }, [address, apiKey, latitude, longitude, open]);

  useEffect(() => {
    if (!open || !apiKey || !mapContainerRef.current) return;
    let cancelled = false;

    void loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapContainerRef.current) return;
        const hasExistingLocation = isValidLocation(latitude, longitude);
        const initial = hasExistingLocation
          ? { latitude: latitude!, longitude: longitude! }
          : ALEPPO;
        const map = new maps.Map(mapContainerRef.current, {
          center: toGooglePoint(initial),
          zoom: hasExistingLocation ? 17 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        });
        const marker = new maps.Marker({
          map,
          position: toGooglePoint(initial),
          draggable: true,
          title: 'موقع السوبر ماركت',
        });

        const changeLocation = (next: Coordinate) => {
          setSelected(next);
          setHasSelectedLocation(true);
          setAddressText('');
          setAddressHint('جاري تحديد عنوان النقطة. يمكنك كتابته يدوياً.');
          marker.setPosition(toGooglePoint(next));
          const sequence = ++requestSequenceRef.current;
          geocoderRef.current?.geocode(
            { location: toGooglePoint(next) },
            (results, status) => {
              if (cancelled || sequence !== requestSequenceRef.current) return;
              if (status === 'OK' && results?.[0]?.formatted_address) {
                setAddressText(results[0].formatted_address);
                setAddressHint('');
              } else {
                setAddressHint('ما قدرنا نجيب العنوان تلقائياً. اكتب وصف الموقع قبل التأكيد.');
              }
            },
          );
        };

        map.addListener('click', (event) => {
          if (!event.latLng) return;
          changeLocation({
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
          });
        });
        marker.addListener('dragend', () => {
          const point = marker.getPosition();
          if (!point) return;
          changeLocation({ latitude: point.lat(), longitude: point.lng() });
        });

        googleMapsRef.current = maps;
        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = new maps.Geocoder();
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoading(false);
          setMapError(
            error instanceof Error ? error.message : 'تعذر عرض Google Maps في هذه النسخة.',
          );
        }
      });

    return () => {
      cancelled = true;
      ++requestSequenceRef.current;
      const maps = googleMapsRef.current;
      if (maps && markerRef.current) {
        maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current.setMap(null);
      }
      if (maps && mapRef.current) maps.event.clearInstanceListeners(mapRef.current);
      mapRef.current = null;
      markerRef.current = null;
      geocoderRef.current = null;
      googleMapsRef.current = null;
    };
  }, [apiKey, latitude, longitude, open]);

  const searchAddress = (): void => {
    const term = searchText.trim();
    if (!term || !geocoderRef.current || !mapRef.current || !markerRef.current) return;

    setSearching(true);
    setAddressHint('');
    const sequence = ++requestSequenceRef.current;
    geocoderRef.current.geocode({ address: term }, (results, status) => {
      if (sequence !== requestSequenceRef.current) return;
      setSearching(false);
      const match = results?.[0];
      if (status !== 'OK' || !match) {
        setAddressHint('ما لقينا العنوان. جرّب اسم الحي أو الشارع، أو حدده على الخريطة.');
        return;
      }
      const next = {
        latitude: match.geometry.location.lat(),
        longitude: match.geometry.location.lng(),
      };
      setSelected(next);
      setAddressText(match.formatted_address);
      setHasSelectedLocation(true);
      markerRef.current?.setPosition(toGooglePoint(next));
      mapRef.current?.panTo(toGooglePoint(next));
      mapRef.current?.setZoom(17);
    });
  };

  const useCurrentLocation = (): void => {
    if (!navigator.geolocation) {
      setAddressHint('متصفحك لا يدعم تحديد الموقع الحالي.');
      return;
    }
    setLocating(true);
    setAddressHint('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setSelected(next);
        setHasSelectedLocation(true);
        setAddressText('');
        markerRef.current?.setPosition(toGooglePoint(next));
        mapRef.current?.panTo(toGooglePoint(next));
        mapRef.current?.setZoom(17);
        const sequence = ++requestSequenceRef.current;
        geocoderRef.current?.geocode(
          { location: toGooglePoint(next) },
          (results, status) => {
            if (sequence !== requestSequenceRef.current) return;
            if (status === 'OK' && results?.[0]?.formatted_address) {
              setAddressText(results[0].formatted_address);
            } else {
              setAddressHint('اكتب وصف موقع السوبر ماركت قبل التأكيد.');
            }
          },
        );
        setLocating(false);
      },
      () => {
        setAddressHint('ما قدرنا نحدد موقعك. اسمح بالوصول للموقع أو اختاره يدوياً.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 },
    );
  };

  const canConfirm = Boolean(
    !loading &&
    !mapError &&
    hasSelectedLocation &&
    isValidLocation(selected.latitude, selected.longitude) &&
    addressText.trim(),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="mx-0 mt-0">
          <DialogTitle>تحديد موقع السوبر ماركت – Google Maps</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-5 pb-2 sm:px-6" dir="rtl">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-primary" />
              اضغط على الخريطة أو اسحب العلامة لتحديد باب المحل بالضبط.
            </span>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 gap-2"
              disabled={loading || Boolean(mapError) || locating}
              onClick={useCurrentLocation}
            >
              <LocateFixed className="h-4 w-4" />
              {locating ? 'جاري التحديد…' : 'موقعي الحالي'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Input
              aria-label="البحث عن موقع السوبر ماركت"
              className="min-w-[180px] flex-1"
              placeholder="ابحث عن حي، شارع أو عنوان..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  searchAddress();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={loading || Boolean(mapError) || searching || !searchText.trim()}
              onClick={searchAddress}
            >
              <Search className="h-4 w-4" />
              {searching ? 'جاري البحث…' : 'ابحث على الخريطة'}
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-muted">
            <div ref={mapContainerRef} className="h-[330px] w-full sm:h-[400px]" aria-label="خريطة موقع السوبر ماركت" />
            {loading && apiKey ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm text-muted-foreground">
                جاري تحميل Google Maps…
              </div>
            ) : null}
            {!apiKey ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/95 px-6 text-center text-sm text-destructive">
                Google Maps غير مُعدّة للداشبورد. أضف VITE_GOOGLE_MAPS_BROWSER_API_KEY في بيئة نشر الويب.
              </div>
            ) : null}
          </div>

          {mapError ? (
            <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {mapError} تأكد من تفعيل Maps JavaScript API ومن نطاق موقع الداشبورد المسموح بالمفتاح.
            </p>
          ) : null}
          <label htmlFor="rodo-market-map-address" className="block space-y-2 text-sm font-medium">
            <span>وصف موقع السوبر ماركت</span>
            <Input
              id="rodo-market-map-address"
              placeholder="مثال: حلب، الفرقان، بجانب..."
              value={addressText}
              onChange={(event) => setAddressText(event.target.value)}
              maxLength={300}
            />
          </label>
          {addressHint ? <p className="text-xs text-muted-foreground">{addressHint}</p> : null}
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {hasSelectedLocation
              ? 'تم تحديد النقطة. تأكد من العنوان ثم اضغط تأكيد الموقع.'
              : 'حدّد نقطة المحل على الخريطة أولاً. الموقع الافتراضي ليس موقعاً محفوظاً.'}
          </p>
        </div>

        <DialogFooter className="mx-0 mb-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (!canConfirm) return;
              onConfirm({ ...selected, address: addressText.trim() });
              onOpenChange(false);
            }}
          >
            تأكيد الموقع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
