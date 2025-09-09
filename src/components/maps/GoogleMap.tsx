import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  title: string;
  zoom?: number;
  height?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude,
  longitude,
  title,
  zoom = 15,
  height = "400px"
}) => {
  // For now, we'll show a placeholder since Google Maps requires API key
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${latitude},${longitude}&zoom=${zoom}`;
  
  return (
    <Card>
      <CardContent className="p-0">
        <div style={{ height }} className="relative w-full">
          {/* Placeholder Map */}
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border rounded-lg">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Latitude: {latitude}<br />
                Longitude: {longitude}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Abrir no Google Maps
              </a>
            </div>
          </div>
          
          {/* Uncomment this when Google Maps API key is available */}
          {/*
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={googleMapsUrl}
            title={title}
          />
          */}
        </div>
      </CardContent>
    </Card>
  );
};