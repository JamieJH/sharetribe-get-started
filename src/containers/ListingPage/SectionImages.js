import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { ResponsiveImage, Modal, ImageCarousel } from '../../components';
import ActionBarMaybe from './ActionBarMaybe';

import css from './ListingPage.module.css';

const SectionImages = props => {
  const {
    title,
    listing,
    isOwnListing,
    editParams,
    handleViewPhotosClick,
    imageCarouselOpen,
    onImageCarouselClose,
    onManageDisableScrolling,
    listingType
  } = props;

  const hasImages = listing.images && listing.images.length > 0;
  let finalImages = listing.images;
  let firstImage = null;

  if (hasImages) {
    const otherImagesUUIDs = listing.attributes.publicData.otherImages;
    if (listingType === 'equipment' && otherImagesUUIDs) {
      firstImage = listing.images.find(image => !otherImagesUUIDs[image.id.uuid]);
      finalImages = [firstImage];
    }
    else {
      firstImage = finalImages[0];
    }
  }

  // Action bar is wrapped with a div that prevents the click events
  // to the parent that would otherwise open the image carousel
  const actionBar = listing.id ? (
    <div onClick={e => e.stopPropagation()}>
      <ActionBarMaybe isOwnListing={isOwnListing} listing={listing} editParams={editParams} listingType={listingType} />
    </div>
  ) : null;

  const viewPhotosButton = (hasImages && listingType !== 'equipment') ? (
    <button className={css.viewPhotos} onClick={handleViewPhotosClick}>
      <FormattedMessage
        id="ListingPage.viewImagesButton"
        values={{ count: listing.images.length }}
      />
    </button>
  ) : null;

  return (
    <div className={css.sectionImages}>
      <div className={css.threeToTwoWrapper}>
        <div className={css.aspectWrapper} onClick={handleViewPhotosClick}>
          {actionBar}
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
      </div>
      <Modal
        id="ListingPage.imageCarousel"
        scrollLayerClassName={css.carouselModalScrollLayer}
        containerClassName={css.carouselModalContainer}
        lightCloseButton
        isOpen={imageCarouselOpen}
        onClose={onImageCarouselClose}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <ImageCarousel images={finalImages} />
      </Modal>
    </div>
  );
};

export default SectionImages;
