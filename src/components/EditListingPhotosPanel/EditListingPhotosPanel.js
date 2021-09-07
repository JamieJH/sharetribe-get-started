import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { LISTING_STATE_DRAFT, LISTING_TYPE_EQUIPMENT, LISTING_TYPE_SAUNA } from '../../util/types';
import { EditEquipmentListingPhotosForm, EditListingPhotosForm } from '../../forms';
import { ensureOwnListing } from '../../util/data';
import { ListingLink } from '../../components';

import css from './EditListingPhotosPanel.module.css';

class EditListingPhotosPanel extends Component {
  render() {
    const {
      className,
      rootClassName,
      errors,
      disabled,
      ready,
      images,
      listing,
      onImageUpload,
      onUpdateImageOrder,
      submitButtonText,
      panelUpdated,
      updateInProgress,
      onChange,
      onSubmit,
      onRemoveImage,
    } = this.props;


    const rootClass = rootClassName || css.root;
    const classes = classNames(rootClass, className);
    const currentListing = ensureOwnListing(listing);
    const listingType = currentListing.attributes.publicData.listingType;

    const onSaunaPhotosSubmit = (values) => {
      const { addImage, ...updateValues } = values;
      onSubmit(updateValues);
    }

    const onEquipmentPhotosSubmit = (values) => {
      const { addMainImages, addOtherImage, ...updateValues } = values;
      const { mainImages, otherImages } = updateValues;
      let images = [...mainImages];
      const finalUpdateValues = {};

      if (otherImages.length > 0) {
        // get uuids from otherImages to store in publicData as an array
        const otherImagesUUIDs = otherImages.map(image => {
          return image.id.uuid || image.imageId.uuid;
        });
        images = images.concat(otherImages);
        finalUpdateValues.publicData = {
          otherImages: otherImagesUUIDs
        }
      }

      finalUpdateValues.images = images;
      onSubmit(finalUpdateValues);
    }

    const getFormComponentAndSubmitHandler = (listingType) => {
      switch (listingType) {
        case LISTING_TYPE_EQUIPMENT:
          return {
            formComponent: EditEquipmentListingPhotosForm,
            onSubmitHandler: onEquipmentPhotosSubmit
          }
        case LISTING_TYPE_SAUNA:
          return {
            formComponent: EditListingPhotosForm,
            onSubmitHandler: onSaunaPhotosSubmit
          }
        case LISTING_TYPE_EQUIPMENT:
          return {
            formComponent: EditListingPhotosForm,
            onSubmitHandler: onSaunaPhotosSubmit
          }
      }
    }

    const { formComponent: FormComponent, onSubmitHandler } = getFormComponentAndSubmitHandler(listingType);

    const isPublished =
      currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
    const panelTitle = isPublished ? (
      <FormattedMessage
        id="EditListingPhotosPanel.title"
        values={{ listingTitle: <ListingLink listing={listing} /> }}
      />
    ) : (
      <FormattedMessage id="EditListingPhotosPanel.createListingTitle" />
    );

    return (
      <div className={classes}>
        <h1 className={css.title}>{panelTitle}</h1>
        <FormComponent
          className={css.form}
          disabled={disabled}
          ready={ready}
          fetchErrors={errors}
          initialValues={{ images }}
          images={images}
          initialOtherImagesUUIDs={listing.attributes.publicData.otherImages}
          onImageUpload={onImageUpload}
          onSubmit={onSubmitHandler}
          onChange={onChange}
          onUpdateImageOrder={onUpdateImageOrder}
          onRemoveImage={onRemoveImage}
          saveActionMsg={submitButtonText}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
        />
      </div>
    );
  }
}

EditListingPhotosPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  images: [],
  listing: null,
};

EditListingPhotosPanel.propTypes = {
  className: string,
  rootClassName: string,
  errors: object,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  images: array,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  onImageUpload: func.isRequired,
  onUpdateImageOrder: func.isRequired,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  onRemoveImage: func.isRequired,
};

export default EditListingPhotosPanel;
