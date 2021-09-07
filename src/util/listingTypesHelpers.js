import config from "../config"
import { LISTING_TYPE_EQUIPMENT, LISTING_TYPE_SAUNA } from "./types"

export const getListingUnitType = (listingType) => {
  switch (listingType) {
    case LISTING_TYPE_EQUIPMENT:
      return config.equipmentBookingUnitType;
    case LISTING_TYPE_SAUNA:
      return config.bookingUnitType;
    default:
      return config.bookingUnitType;
  }
}

export const getListingFirstTab = (listingType) => {
  switch (listingType) {
    case LISTING_TYPE_EQUIPMENT:
      return config.firstEquipmentTab;
    case LISTING_TYPE_SAUNA:
      return config.firstSaunaTab;
    default:
      return config.firstSaunaTab;
  }
}