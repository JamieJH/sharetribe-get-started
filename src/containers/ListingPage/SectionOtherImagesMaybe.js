import React, { useState } from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { Modal, ImageCarousel, OtherImagesGrid } from '../../components';

import css from './ListingPage.module.css';
import cssText from './SectionTextContentMaybe.module.css';

const SectionOtherImagesMaybe = props => {
  const {
    title,
    listing,
    handleViewPhotosClick,
    imageCarouselOpen,
    onImageCarouselClose,
    onManageDisableScrolling,
  } = props;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const otherImagesUUIDs = listing.attributes && listing.attributes.publicData.otherImages;
  let hasOtherImages = otherImagesUUIDs && Object.keys(otherImagesUUIDs).length > 0;
  // there are no other images
  if (!hasOtherImages) {
    return '';
  }

  const hasImages = listing.images && listing.images && listing.images.length > 0;

  let otherImages = null;

  // filter and get all other images
  if (hasImages && hasOtherImages) {
    otherImages = listing.images.filter(image => {
      return listing.attributes.publicData.otherImages.indexOf(image.id.uuid) !== -1;
    })
  }

  const openImageModal = (e, imageIndex) => {
    handleViewPhotosClick(e);
    setSelectedImageIndex(imageIndex);
  }

  return (
    <div className={cssText.root}>
      <h2 className={css.featuresTitle}>
        <FormattedMessage id="EquipmentListingPage.otherImagesTitle" />
      </h2>

      <OtherImagesGrid
        title={title}
        otherImages={otherImages}
        onClick={openImageModal} />
      <Modal
        id="ListingPage.otherImageCarousel"
        scrollLayerClassName={css.carouselModalScrollLayer}
        containerClassName={css.carouselModalContainer}
        lightCloseButton
        isOpen={imageCarouselOpen}
        onClose={onImageCarouselClose}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <ImageCarousel
          key={selectedImageIndex}
          images={otherImages}
          initialImageIndex={selectedImageIndex}
        />
      </Modal>
    </div>
  );
};

export default SectionOtherImagesMaybe;
