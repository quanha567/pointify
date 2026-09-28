import oneShipSunset from '@/assets/sidebar/one-ship-sunset.webp';

export function SidebarVesselWidget() {
  return (
    <div className="relative flex flex-col w-full overflow-hidden select-none">
      {/* Full-bleed front-facing container vessel – Seamless gradient mask merging directly into sidebar */}
      <div className="relative w-full h-80 sm:h-96 overflow-hidden pointer-events-none">
        <img
          src={oneShipSunset}
          alt="Ocean Network Express"
          className="w-full h-full object-cover object-top"
          style={{
            maskImage:
              'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 12%, black 28%, black 85%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 12%, black 28%, black 85%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar/60 via-transparent to-sidebar/20 pointer-events-none" />
      </div>
    </div>
  );
}
