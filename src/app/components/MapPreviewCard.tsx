import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { MapPin } from 'lucide-react';

interface MapPreviewCardProps {
  title: string;
  description: string;
  query?: string;
  latitude?: number | null;
  longitude?: number | null;
  emptyMessage?: string;
  className?: string;
}

const buildEmbedUrl = ({
  query,
  latitude,
  longitude,
}: {
  query?: string;
  latitude?: number | null;
  longitude?: number | null;
}) => {
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
  }

  if (query && query.trim()) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  }

  return null;
};

export function MapPreviewCard({
  title,
  description,
  query,
  latitude,
  longitude,
  emptyMessage = 'Lokasi belum tersedia untuk dipratinjau.',
  className,
}: MapPreviewCardProps) {
  const embedUrl = buildEmbedUrl({ query, latitude, longitude });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-green-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {embedUrl ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <iframe
              title={title}
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
