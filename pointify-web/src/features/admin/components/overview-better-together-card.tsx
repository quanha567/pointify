import { Card, CardContent } from '@/components/ui/card';
import betterTogether from '@/assets/promo/better-together.webp';
import oneLogoWhite from '@/assets/one-logo-white.webp';

export function OverviewBetterTogetherCard() {
  return (
    <Card className="relative overflow-hidden rounded-lg border-0 bg-gradient-to-b from-primary via-primary/95 to-primary text-primary-foreground shadow-xs flex flex-col justify-between p-0 h-full">
      {/* Top Header: ONE Logo + Title */}
      <CardContent className="p-5 pb-0 z-10">
        <div className="flex flex-col gap-1">
          <img
            src={oneLogoWhite}
            alt="Ocean Network Express"
            className="h-7 w-auto max-w-[120px] object-contain select-none"
          />

          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Better
              <br />
              Together
            </h3>
          </div>
        </div>
      </CardContent>

      {/* Bottom: ONE Container Vessel in Pink/Magenta Sunset */}
      <div className="relative mt-auto w-full h-44 sm:h-48 overflow-hidden">
        <img
          src={betterTogether}
          alt="ONE Better Together"
          className="w-full h-full object-cover object-bottom select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 15%, black 45%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 15%, black 45%)',
          }}
        />
      </div>
    </Card>
  );
}
