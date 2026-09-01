export const PRESENTER_ID_PARAM = "id";

export function viewerPath(presenterId: string): string {
  return `/espectador?${PRESENTER_ID_PARAM}=${encodeURIComponent(presenterId)}`;
}
