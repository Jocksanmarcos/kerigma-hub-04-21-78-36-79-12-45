import React, { useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  className?: string;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
  quality?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallback = '/placeholder.svg',
  aspectRatio,
  className,
  priority = false,
  sizes,
  blurDataURL,
  quality = 75,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px',
    skip: priority
  });

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      default:
        return '';
    }
  };

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
    setImageSrc(fallback);
  }, [fallback]);

  // Generate optimized image URL with quality and format
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (originalSrc.includes('lovable-uploads')) {
      // For Lovable uploads, add optimization parameters
      const url = new URL(originalSrc, window.location.origin);
      url.searchParams.set('quality', quality.toString());
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    return originalSrc;
  }, [quality]);

  React.useEffect(() => {
    if (priority || inView) {
      const optimizedSrc = getOptimizedSrc(src);
      setImageSrc(optimizedSrc);
    }
  }, [inView, priority, src, getOptimizedSrc]);

  return (
    <div 
      ref={ref} 
      className={cn(
        'relative overflow-hidden bg-muted',
        getAspectRatioClass(),
        className
      )}
    >
      {!isLoaded && (
        <div className="absolute inset-0 w-full h-full">
          {blurDataURL ? (
            <img
              src={blurDataURL}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
              aria-hidden="true"
            />
          ) : (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
        </div>
      )}
      
      {(priority || inView) && imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;