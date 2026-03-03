import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { geoOrthographic, geoPath, geoGraticule10, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import landData from "world-atlas/land-110m.json";
import { MarkerData } from "../types";

const landFeature = feature(landData as any, (landData as any).objects.land);

export interface InteractiveGlobeProps {
  theta?: number;
  dark?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  markers?: MarkerData[];
  scale?: number;
  offset?: [number, number];
  rotationSpeed?: number;
  dragSensitivity?: number;
  enableFadeMask?: boolean;
  showGraticule?: boolean;
  graticuleColor?: string;
  graticuleOpacity?: number;
  graticuleScale?: number;
  showLandOutline?: boolean;
  landOutlineColor?: string;
  landOutlineOpacity?: number;
  landOutlineScale?: number;
  pulseMarkers?: boolean;
}

export default function InteractiveGlobe({
  theta = 0.3,
  dark = 1,
  diffuse = 1.2,
  mapSamples = 16000,
  mapBrightness = 6,
  baseColor = [0.3, 0.3, 0.3],
  markerColor = [0.1, 0.8, 1],
  glowColor = [1, 1, 1],
  markers = [],
  scale = 1,
  offset = [0, 0],
  rotationSpeed = 0.005,
  dragSensitivity = 0.005,
  enableFadeMask = true,
  showGraticule = false,
  graticuleColor = "#ffffff",
  graticuleOpacity = 0.2,
  graticuleScale = 0.8,
  showLandOutline = false,
  landOutlineColor = "#ffffff",
  landOutlineOpacity = 0.5,
  landOutlineScale = 0.8,
  pulseMarkers = true,
}: InteractiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const landPathRef = useRef<SVGPathElement>(null);
  const markersRef = useRef<SVGGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const currentPhiRef = useRef(0);
  const fadeMask = enableFadeMask 
    ? "radial-gradient(circle at 50% 50%, rgb(0, 0, 0) 60%, rgb(0, 0, 0, 0) 100%)" 
    : "none";

  const baseColorStr = baseColor.join(',');
  const markerColorStr = markerColor.join(',');
  const markerColorCss = `rgb(${Math.round(markerColor[0]*255)}, ${Math.round(markerColor[1]*255)}, ${Math.round(markerColor[2]*255)})`;
  const glowColorStr = glowColor.join(',');
  const offsetStr = offset.join(',');

  useEffect(() => {
    let width = 0;
    
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: phiRef.current,
      theta,
      dark,
      diffuse,
      mapSamples,
      mapBrightness,
      scale,
      // cobe's offset is in a normalized coordinate space affected by scale and devicePixelRatio.
      // To move the globe by exactly `offset[0]` CSS pixels, we must multiply by 4 and divide by scale.
      offset: [offset[0] * 4 / scale, offset[1] * 4 / scale],
      baseColor: baseColorStr.split(',').map(Number) as [number, number, number],
      markerColor: markerColorStr.split(',').map(Number) as [number, number, number],
      glowColor: glowColorStr.split(',').map(Number) as [number, number, number],
      markers: markers,
      onRender: (state) => {
        // Auto-rotate if not interacting
        if (pointerInteracting.current === null) {
          phiRef.current += rotationSpeed;
        }
        
        // Smoothly interpolate to the target rotation
        currentPhiRef.current += ((phiRef.current + pointerInteractionMovement.current) - currentPhiRef.current) * 0.1;
        
        state.phi = currentPhiRef.current;
        state.width = width * 2;
        state.height = width * 2;

        // Animate markers
        if (pulseMarkers && markers.length > 0) {
          const time = Date.now();
          const animatedMarkers = markers.map((marker, i) => {
            // Create a subtle pulse effect based on time and index
            const pulse = Math.sin(time * 0.003 + i) * (marker.size * 0.2);
            return {
              location: marker.location,
              size: Math.max(0.01, marker.size + pulse)
            };
          });
          
          // Workaround for a bug in cobe: when updating markers dynamically, 
          // cobe sets the shader's marker count to `markers.length` instead of `markers.length * 2`.
          // We pad the array with dummy markers so the length is doubled, which fixes the loop limit.
          state.markers = [
            ...animatedMarkers,
            ...animatedMarkers.map(() => ({ location: [0, 0] as [number, number], size: 0 }))
          ];
        } else {
          // If not animating, we don't need to set state.markers, 
          // which avoids triggering the cobe bug entirely.
          state.markers = undefined;
        }

        // Update Graticule (Meridian Lines) and Land Outline
        if (showGraticule || showLandOutline) {
          const rotationX = (currentPhiRef.current * 180) / Math.PI + 90;
          const rotationY = -(theta * 180) / Math.PI;

          const projection = geoOrthographic()
            .translate([width / 2 + offset[0], width / 2 + offset[1]])
            .scale((width / 2) * scale * graticuleScale)
            .rotate([rotationX, rotationY, 0]);
          
          const pathGenerator = geoPath(projection);
          
          if (pathRef.current && showGraticule) {
            pathRef.current.setAttribute("d", pathGenerator(geoGraticule10()) || "");
          }
          
          if (landPathRef.current && showLandOutline) {
            const landProjection = geoOrthographic()
              .translate([width / 2 + offset[0], width / 2 + offset[1]])
              .scale((width / 2) * scale * landOutlineScale)
              .rotate([rotationX, rotationY, 0]);
            const landPathGenerator = geoPath(landProjection);
            landPathRef.current.setAttribute("d", landPathGenerator(landFeature as any) || "");
          }
        }

        // Update 3D SVG Markers
        if (markersRef.current && markers.length > 0) {
          const rotationX = (currentPhiRef.current * 180) / Math.PI + 90;
          const rotationY = -(theta * 180) / Math.PI;
          // cobe's internal globe radius is exactly 0.8 of the canvas half-width
          const R = (width / 2) * scale * 0.8;
          const time = Date.now();

          const baseProjection = geoOrthographic()
            .translate([width / 2 + offset[0], width / 2 + offset[1]])
            .scale(R)
            .rotate([rotationX, rotationY, 0]);

          const children = markersRef.current.children;
          markers.forEach((marker, i) => {
            const child = children[i] as SVGGElement;
            if (!child) return;

            const [lat, lng] = marker.location;
            const distance = geoDistance([lng, lat], [-rotationX, -rotationY]);
            const isVisible = distance < Math.PI / 2;

            if (isVisible) {
              const pulse = pulseMarkers ? Math.sin(time * 0.003 + i) * (marker.size * 0.2) : 0;
              const currentSize = Math.max(0.01, marker.size + pulse);
              
              const basePoint = baseProjection([lng, lat]);
              const h = currentSize * R * 1.5; // Extrusion height
              const topProjection = geoOrthographic()
                .translate([width / 2 + offset[0], width / 2 + offset[1]])
                .scale(R + h)
                .rotate([rotationX, rotationY, 0]);
              const topPoint = topProjection([lng, lat]);

              if (basePoint && topPoint) {
                child.style.display = 'block';
                // Fade out near the edge of the globe
                const edgeFade = Math.pow(1 - (distance / (Math.PI / 2)), 0.3);
                child.style.opacity = edgeFade.toString();

                const line = child.children[0] as SVGLineElement;
                line.setAttribute('x1', basePoint[0].toString());
                line.setAttribute('y1', basePoint[1].toString());
                line.setAttribute('x2', topPoint[0].toString());
                line.setAttribute('y2', topPoint[1].toString());

                const circle = child.children[1] as SVGCircleElement;
                circle.setAttribute('cx', topPoint[0].toString());
                circle.setAttribute('cy', topPoint[1].toString());
                circle.setAttribute('r', (currentSize * 30).toString());

                const pulseCircle = child.children[2] as SVGCircleElement;
                pulseCircle.setAttribute('cx', topPoint[0].toString());
                pulseCircle.setAttribute('cy', topPoint[1].toString());
                pulseCircle.setAttribute('r', (currentSize * 30 + (pulseMarkers ? (Math.sin(time * 0.005 + i) + 1) * 4 : 0)).toString());
                pulseCircle.style.opacity = pulseMarkers ? (0.6 - Math.sin(time * 0.005 + i) * 0.5).toString() : '0';
              } else {
                child.style.display = 'none';
              }
            } else {
              child.style.display = 'none';
            }
          });
        }
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [theta, dark, diffuse, mapSamples, mapBrightness, baseColorStr, markerColorStr, glowColorStr, markers, scale, offsetStr, rotationSpeed, showGraticule, graticuleScale, showLandOutline, landOutlineScale, pulseMarkers]);

  const handleMouseMove = (e: React.MouseEvent, label?: string) => {
    if (tooltipRef.current && label) {
      tooltipRef.current.style.display = 'block';
      tooltipRef.current.style.transform = `translate(${e.clientX + 15}px, ${e.clientY + 15}px)`;
      tooltipRef.current.innerText = label;
    }
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };

  return (
    <div className="w-full max-w-[600px] aspect-square mx-auto relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        style={{
          contain: "layout paint size",
          opacity: 1,
          transition: "opacity 1s ease",
          WebkitMaskImage: fadeMask,
          maskImage: fadeMask,
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
        }}
        onPointerMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current += delta * dragSensitivity;
            pointerInteracting.current = e.clientX;
          }
        }}
      />
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        style={{
          opacity: (showGraticule || showLandOutline) ? 1 : 0,
          transition: "opacity 0.5s ease",
          WebkitMaskImage: fadeMask,
          maskImage: fadeMask,
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      >
        {showGraticule && (
          <path
            ref={pathRef}
            fill="none"
            stroke={graticuleColor}
            strokeWidth={1}
            strokeOpacity={graticuleOpacity}
            style={{ transition: "none" }}
          />
        )}
        {showLandOutline && (
          <path
            ref={landPathRef}
            fill="none"
            stroke={landOutlineColor}
            strokeWidth={1.5}
            strokeOpacity={landOutlineOpacity}
            style={{ transition: "none" }}
          />
        )}
        <g ref={markersRef}>
          {markers.map((marker, i) => (
            <g 
              key={i} 
              style={{ display: "none", transition: "none", pointerEvents: "auto", cursor: "pointer" }}
              onMouseMove={(e) => handleMouseMove(e, marker.label || `Marker ${i + 1}`)}
              onMouseLeave={handleMouseLeave}
            >
              <line stroke={markerColorCss} strokeWidth={2} opacity={0.6} style={{ transition: "none", pointerEvents: "none" }} />
              <circle fill={markerColorCss} style={{ transition: "none", pointerEvents: "auto" }} />
              <circle fill="none" stroke={markerColorCss} strokeWidth={1} style={{ transition: "none", pointerEvents: "none" }} />
            </g>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className="fixed z-50 pointer-events-none bg-neutral-900/90 text-white px-3 py-1.5 rounded-md text-sm font-medium border border-white/10 shadow-xl backdrop-blur-sm whitespace-nowrap"
        style={{ display: 'none', top: 0, left: 0 }}
      />
    </div>
  );
}
