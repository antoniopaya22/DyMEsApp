/**
 * Registro estático de imágenes de cabecera para campañas.
 * Cada ID corresponde a un asset en assets/images/campanas/.
 */

import type { ImageSourcePropType } from "react-native";

export type CampaignImageId =
  | "campana1"
  | "campana2"
  | "campana3"
  | "campana4"
  | "campana5";

export interface CampaignImageEntry {
  id: CampaignImageId;
  label: string;
  source: ImageSourcePropType;
}

export const CAMPAIGN_IMAGES: CampaignImageEntry[] = [
  {
    id: "campana1",
    label: "Castillo",
    source: require("../../assets/images/campanas/Campana1.png"),
  },
  {
    id: "campana2",
    label: "Bosque",
    source: require("../../assets/images/campanas/Campana2.png"),
  },
  {
    id: "campana3",
    label: "Pueblo",
    source: require("../../assets/images/campanas/Campana3.png"),
  },
  {
    id: "campana4",
    label: "Montaña",
    source: require("../../assets/images/campanas/Campana4.png"),
  },
  {
    id: "campana5",
    label: "Mazmorra",
    source: require("../../assets/images/campanas/Campana5.png"),
  },
];

/** Mapa rápido para obtener el source por ID */
export const CAMPAIGN_IMAGE_MAP: Record<CampaignImageId, ImageSourcePropType> =
  Object.fromEntries(
    CAMPAIGN_IMAGES.map((img) => [img.id, img.source]),
  ) as Record<CampaignImageId, ImageSourcePropType>;

/** Obtiene el source de una imagen de campaña por ID, con fallback al primero */
export function getCampaignImageSource(
  imageId: string | null | undefined,
): ImageSourcePropType {
  if (imageId && imageId in CAMPAIGN_IMAGE_MAP) {
    return CAMPAIGN_IMAGE_MAP[imageId as CampaignImageId];
  }
  return CAMPAIGN_IMAGES[0].source;
}
