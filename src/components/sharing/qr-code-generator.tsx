"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, QrCode } from "lucide-react";
import { toast } from "sonner";

interface QrCodeGeneratorProps {
  url: string;
}

export function QrCodeGenerator({ url }: QrCodeGeneratorProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    const svgElement = svgContainerRef.current?.querySelector("svg");
    if (!svgElement) {
      toast.error("QR code not found");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngUrl = canvas.toDataURL("image/png");
      const anchor = document.createElement("a");
      anchor.href = pngUrl;
      anchor.download = "qr-code.png";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      toast.success("QR code downloaded");
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="size-5 text-primary" />
          QR Code
        </CardTitle>
        <CardDescription>
          Scan to view the public post page.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">
        <div
          ref={svgContainerRef}
          className="rounded-lg border bg-white p-4"
        >
          <QRCodeSVG
            value={url}
            size={160}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        </div>

        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="size-4" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
}
