import { Crosshair, LocateFixed, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface UserLocationMapDialogProps {
  open: boolean;
  latitude?: number;
  longitude?: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: (coordinate: Coordinate) => void;
}

interface LeafletMap {
  on: (event: 'click', handler: (event: { latlng: { lat: number; lng: number } }) => void) => void;
  setView: (latLng: [number, number], zoom: number) => LeafletMap;
  flyTo: (latLng: [number, number], zoom: number) => void;
  invalidateSize: () => void;
  remove: () => void;
}

interface LeafletCircleMarker {
  addTo: (map: LeafletMap) => LeafletCircleMarker;
  setLatLng: (latLng: [number, number]) => void;
}

interface LeafletNamespace {
  map: (
    element: HTMLElement,
    options?: { zoomControl?: boolean; attributionControl?: boolean },
  ) => LeafletMap;
  tileLayer: (
    url: string,
    options?: { attribution?: string; maxZoom?: number },
  ) => { addTo: (map: LeafletMap) => void };
  circleMarker: (
    latLng: [number, number],
    options?: {
      radius?: number;
      color?: string;
      fillColor?: string;
      fillOpacity?: number;
      weight?: number;
    },
  ) => LeafletCircleMarker;
}

const DEFAULT_COORDINATE: Coordinate = {
  latitude: 36.2021,
  longitude: 37.1343,
};

const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_SCRIPT_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
let leafletPromise: Promise<LeafletNamespace> | null = null;

function getLeafletFromWindow(): LeafletNamespace | undefined {
  return (window as Window & { L?: LeafletNamespace }).L;
}

function loadLeaflet(): Promise<LeafletNamespace> {
  const existing = getLeafletFromWindow();
  if (existing) return Promise.resolve(existing);

  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise<LeafletNamespace>((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = LEAFLET_CSS_URL;
      style.crossOrigin = '';
      document.head.appendChild(style);
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${LEAFLET_SCRIPT_URL}"]`,
    );

    const resolveLeaflet = () => {
      const leaflet = getLeafletFromWindow();
      if (leaflet) {
        resolve(leaflet);
        return;
      }

      reject(new Error('تعذر تحميل الخريطة.'));
    };

    if (existingScript) {
      existingScript.addEventListener('load', resolveLeaflet, { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('تعذر تحميل الخريطة.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = LEAFLET_SCRIPT_URL;
    script.async = true;
    script.crossOrigin = '';
    script.addEventListener('load', resolveLeaflet, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('تعذر تحميل الخريطة.')),
      { once: true },
    );
    document.body.appendChild(script);
  });

  return leafletPromise;
}

function isValidCoordinate(latitude?: number, longitude?: number): boolean {
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

export function UserLocationMapDialog({
  open,
  latitude,
  longitude,
  onOpenChange,
  onConfirm,
}: UserLocationMapDialogProps): React.JSX.Element {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletCircleMarker | null>(null);
  const [selected, setSelected] = useState<Coordinate>(() =>
    isValidCoordinate(latitude, longitude)
      ? { latitude: latitude!, longitude: longitude! }
      : DEFAULT_COORDINATE,
  );
  const [isLocating, setIsLocating] = useState(false);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    if (!open) return;

    setSelected(
      isValidCoordinate(latitude, longitude)
        ? { latitude: latitude!, longitude: longitude! }
        : DEFAULT_COORDINATE,
    );
    setMapError('');
  }, [latitude, longitude, open]);

  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    let cancelled = false;

    void loadLeaflet()
      .then((leaflet) => {
        if (cancelled || !mapContainerRef.current) return;

        const initial = isValidCoordinate(latitude, longitude)
          ? { latitude: latitude!, longitude: longitude! }
          : DEFAULT_COORDINATE;

        const map = leaflet
          .map(mapContainerRef.current, {
            zoomControl: true,
            attributionControl: true,
          })
          .setView([initial.latitude, initial.longitude], isValidCoordinate(latitude, longitude) ? 16 : 12);

        leaflet
          .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          })
          .addTo(map);

        const marker = leaflet
          .circleMarker([initial.latitude, initial.longitude], {
            radius: 9,
            color: '#ffffff',
            fillColor: '#D62828',
            fillOpacity: 1,
            weight: 4,
          })
          .addTo(map);

        map.on('click', (event) => {
          const next = {
            latitude: event.latlng.lat,
            longitude: event.latlng.lng,
          };
          setSelected(next);
          marker.setLatLng([next.latitude, next.longitude]);
        });

        mapRef.current = map;
        markerRef.current = marker;

        window.setTimeout(() => map.invalidateSize(), 120);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : 'تعذر تحميل الخريطة.');
        }
      });

    return () => {
      cancelled = true;
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, open]);

  const useCurrentLocation = (): void => {
    if (!navigator.geolocation) {
      setMapError('المتصفح لا يدعم تحديد الموقع الحالي.');
      return;
    }

    setIsLocating(true);
    setMapError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setSelected(next);
        markerRef.current?.setLatLng([next.latitude, next.longitude]);
        mapRef.current?.flyTo([next.latitude, next.longitude], 16);
        setIsLocating(false);
      },
      () => {
        setMapError('تعذر الوصول لموقعك الحالي. تأكد من صلاحية الموقع بالمتصفح.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 30_000,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="mx-0 mt-0">
          <DialogTitle>اختيار الموقع من الخريطة</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-6 pb-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/25 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crosshair className="h-4 w-4 text-primary" />
              اضغط على الخريطة لتحديد الموقع
            </div>

            <Button
              type="button"
              variant="outline"
              className="shrink-0 gap-2"
              onClick={useCurrentLocation}
              disabled={isLocating}
            >
              <LocateFixed className="h-4 w-4" />
              {isLocating ? 'جاري التحديد...' : 'موقعي الحالي'}
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-[22px] border bg-muted">
            <div ref={mapContainerRef} className="h-[420px] w-full" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 z-[400] -translate-x-1/2 -translate-y-[calc(100%+10px)] opacity-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
          </div>

          {mapError ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {mapError}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <MapPin className="h-4 w-4" />
              النقطة المحددة جاهزة للحفظ
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm(selected);
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
