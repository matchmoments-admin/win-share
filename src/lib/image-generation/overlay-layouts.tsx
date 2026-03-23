import type { Archetype, OverlayRenderData } from "./archetypes";
import type React from "react";

interface OverlayProps {
  data: OverlayRenderData;
  width: number;
  height: number;
}

function WatermarkBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        fontSize: 11,
        color: "rgba(255,255,255,0.5)",
        fontWeight: 400,
      }}
    >
      Made with WinShare
    </div>
  );
}

function FullPhotoOverlay({ data, width, height }: OverlayProps) {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        position: "relative",
        padding: Math.round(width * 0.05),
      }}
    >
      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Math.round(height * 0.6),
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))",
        }}
      />

      {/* Logo top-left */}
      {data.logoUrl && (
        <img
          src={data.logoUrl}
          width={Math.round(width * 0.1)}
          height={Math.round(width * 0.1)}
          style={{
            position: "absolute",
            top: Math.round(width * 0.04),
            left: Math.round(width * 0.04),
            objectFit: "contain",
          }}
        />
      )}

      {/* Action verb banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
          position: "relative",
        }}
      >
        <div
          style={{
            backgroundColor: data.secondaryColor,
            color: data.primaryColor,
            padding: "6px 16px",
            borderRadius: 4,
            fontSize: Math.round(width * 0.022),
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
          }}
        >
          Just {data.actionVerb}
        </div>
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: Math.round(width * 0.05),
          fontWeight: 700,
          color: data.headlineColor,
          lineHeight: 1.15,
          position: "relative",
          maxWidth: "90%",
        }}
      >
        {data.headline}
      </div>

      {/* Detail line */}
      {data.detailLine && (
        <div
          style={{
            fontSize: Math.round(width * 0.025),
            color: data.subheadColor,
            opacity: 0.85,
            marginTop: 8,
            position: "relative",
          }}
        >
          {data.detailLine}
        </div>
      )}

      {/* Company name */}
      {data.companyName && (
        <div
          style={{
            fontSize: Math.round(width * 0.02),
            color: "rgba(255,255,255,0.7)",
            marginTop: 16,
            position: "relative",
          }}
        >
          {data.companyName}
          {data.tagline ? ` — ${data.tagline}` : ""}
        </div>
      )}

      <WatermarkBadge visible={data.watermark} />
    </div>
  );
}

function MinimalistModern({ data, width, height }: OverlayProps) {
  const pad = Math.round(width * 0.07);
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: pad,
        backgroundColor: "#F7F6F3",
        position: "relative",
      }}
    >
      {/* Logo top-left */}
      {data.logoUrl && (
        <img
          src={data.logoUrl}
          width={Math.round(width * 0.12)}
          height={Math.round(width * 0.06)}
          style={{
            position: "absolute",
            top: pad,
            left: pad,
            objectFit: "contain",
          }}
        />
      )}

      {/* Action verb */}
      <div
        style={{
          fontSize: Math.round(width * 0.02),
          fontWeight: 700,
          color: data.secondaryColor,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          marginBottom: 12,
        }}
      >
        Just {data.actionVerb}
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: Math.round(width * 0.06),
          fontWeight: 700,
          color: "#111111",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          maxWidth: "65%",
        }}
      >
        {data.headline}
      </div>

      {/* Detail line */}
      {data.detailLine && (
        <div
          style={{
            fontSize: Math.round(width * 0.022),
            color: "#787774",
            marginTop: 16,
            maxWidth: "60%",
            lineHeight: 1.5,
          }}
        >
          {data.detailLine}
        </div>
      )}

      {/* Company name bottom-left */}
      {data.companyName && (
        <div
          style={{
            position: "absolute",
            bottom: pad,
            left: pad,
            fontSize: Math.round(width * 0.018),
            color: "#787774",
          }}
        >
          {data.companyName}
        </div>
      )}

      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: data.secondaryColor,
        }}
      />

      <WatermarkBadge visible={data.watermark} />
    </div>
  );
}

function AnnouncementCard({ data, width, height }: OverlayProps) {
  const cardWidth = Math.round(width * 0.8);
  const cardPad = Math.round(width * 0.05);
  const headerHeight = Math.round(height * 0.08);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: "#E8E6E1",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: cardWidth,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Colored header bar */}
        <div
          style={{
            height: headerHeight,
            backgroundColor: data.primaryColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${cardPad}px`,
          }}
        >
          <div
            style={{
              fontSize: Math.round(width * 0.02),
              fontWeight: 700,
              color: data.headlineColor,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
          >
            Just {data.actionVerb}
          </div>
          {data.logoUrl && (
            <img
              src={data.logoUrl}
              width={Math.round(width * 0.08)}
              height={Math.round(headerHeight * 0.6)}
              style={{ objectFit: "contain" }}
            />
          )}
        </div>

        {/* Card body */}
        <div
          style={{
            padding: cardPad,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Headline */}
          <div
            style={{
              fontSize: Math.round(width * 0.042),
              fontWeight: 700,
              color: "#111111",
              lineHeight: 1.2,
            }}
          >
            {data.headline}
          </div>

          {/* Detail line */}
          {data.detailLine && (
            <div
              style={{
                fontSize: Math.round(width * 0.022),
                color: "#787774",
                lineHeight: 1.5,
              }}
            >
              {data.detailLine}
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: 1,
              backgroundColor: "#EAEAEA",
              marginTop: 8,
              marginBottom: 4,
            }}
          />

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {data.companyName && (
              <div
                style={{
                  fontSize: Math.round(width * 0.018),
                  color: "#787774",
                }}
              >
                {data.companyName}
              </div>
            )}
            {data.tagline && (
              <div
                style={{
                  fontSize: Math.round(width * 0.015),
                  color: "#AAAAAA",
                }}
              >
                {data.tagline}
              </div>
            )}
          </div>
        </div>
      </div>

      <WatermarkBadge visible={data.watermark} />
    </div>
  );
}

const ARCHETYPE_RENDERERS: Record<
  string,
  (props: OverlayProps) => React.ReactElement
> = {
  full_photo_overlay: FullPhotoOverlay,
  minimalist_modern: MinimalistModern,
  announcement_card: AnnouncementCard,
};

export function renderOverlayJsx(
  archetype: Archetype | string,
  data: OverlayRenderData,
  width: number,
  height: number
): React.ReactElement {
  const Renderer =
    ARCHETYPE_RENDERERS[archetype] ?? ARCHETYPE_RENDERERS.full_photo_overlay;
  return <Renderer data={data} width={width} height={height} />;
}
