import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { ResponsiveImage, Modal, ImageCarousel } from '../../components';

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
      return listing.attributes.publicData.otherImages[image.id.uuid];
    })
  }
  const firstImage = otherImages ? otherImages[0] : null;

  const viewPhotosButton = hasImages ? (
    <button className={css.viewPhotos} onClick={handleViewPhotosClick}>
      <FormattedMessage
        id="ListingPage.viewImagesButton"
        values={{ count: otherImages.length }}
      />
    </button>
  ) : null;

  return (
    <div className={cssText.root}>
      <h2 className={css.featuresTitle}>
        <FormattedMessage id="EquipmentListingPage.otherImagesTitle" />
      </h2>

      {/* <div className={css.threeToTwoWrapper}> */}
        <div className={css.aspectWrapper} onClick={handleViewPhotosClick}>
          <ResponsiveImage
            rootClassName={css.rootForImage}
            alt={title}
            image={firstImage}
            variants={[
              'landscape-crop',
              'landscape-crop2x',
              'landscape-crop4x',
              'landscape-crop6x',
            ]}
          />
          {viewPhotosButton}
        </div>
      {/* </div> */}
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
        <ImageCarousel images={otherImages} />
      </Modal>
    </div>
  );
};

export default SectionOtherImagesMaybe;
