import { generateReactHelpers } from "@uploadthing/react";
import type { UploadRouter } from "./upload";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<UploadRouter>();
