import type {
  ImageGenerator,
  ImageRenderRequest,
  ImageRenderResult,
  PLATFORM_DIMENSIONS,
} from "./interface";

const TEMPLATED_API_URL = "https://api.templated.io/v1";

interface TemplatedLayer {
  name: string;
  text?: string;
  image_url?: string;
  color?: string;
  font_size?: number;
  visible?: boolean;
}

interface TemplatedRenderResponse {
  id: string;
  status: string;
  render_url: string;
  width: number;
  height: number;
}

export class TemplatedIoGenerator implements ImageGenerator {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TEMPLATED_API_KEY || "";
    if (!this.apiKey) {
      console.warn(
        "TEMPLATED_API_KEY not set — image generation will not work"
      );
    }
  }

  async renderImage(request: ImageRenderRequest): Promise<ImageRenderResult> {
    const templatedLayers = request.layers.map(
      (layer): TemplatedLayer => ({
        name: layer.name,
        ...(layer.type === "text" && { text: layer.value }),
        ...(layer.type === "image" && { image_url: layer.value }),
        ...(layer.type === "shape" && { color: layer.color || layer.value }),
        ...(layer.color && layer.type === "text" && { color: layer.color }),
        ...(layer.fontSize && { font_size: layer.fontSize }),
        ...(layer.visible !== undefined && { visible: layer.visible }),
      })
    );

    const response = await fetch(`${TEMPLATED_API_URL}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        template: request.templateId,
        layers: templatedLayers,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Templated.io render failed (${response.status}): ${errorBody}`
      );
    }

    const data = (await response.json()) as TemplatedRenderResponse;

    return {
      imageUrl: data.render_url,
      renderId: data.id,
      width: data.width,
      height: data.height,
      format: "png",
    };
  }

  async getTemplates(): Promise<{ id: string; name: string }[]> {
    const response = await fetch(`${TEMPLATED_API_URL}/templates`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.status}`);
    }

    const data = (await response.json()) as {
      id: string;
      name: string;
    }[];
    return data.map((t) => ({ id: t.id, name: t.name }));
  }

  async getTemplateDetails(
    templateId: string
  ): Promise<{ id: string; layers: string[] }> {
    const response = await fetch(
      `${TEMPLATED_API_URL}/templates/${templateId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch template details: ${response.status}`);
    }

    const data = (await response.json()) as {
      id: string;
      layers: { name: string }[];
    };
    return {
      id: data.id,
      layers: data.layers.map((l) => l.name),
    };
  }
}

// Singleton instances
let templatedGenerator: TemplatedIoGenerator | null = null;

export function getImageGenerator(
  engine: "satori" | "templated_io" = "templated_io"
): ImageGenerator {
  if (engine === "satori") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getSatoriRenderer } = require("./satori-renderer");
    return getSatoriRenderer();
  }
  if (!templatedGenerator) {
    templatedGenerator = new TemplatedIoGenerator();
  }
  return templatedGenerator;
}
