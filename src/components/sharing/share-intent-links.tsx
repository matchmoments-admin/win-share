/**
 * Re-exports sharing utilities from the core lib.
 *
 * Import from this module when working inside the `components/sharing` directory
 * to keep import paths short and co-located.
 */
export {
  getShareIntentUrl,
  getPublicPostUrl,
  SHARE_PLATFORMS,
  type ShareData,
} from "@/lib/sharing";
