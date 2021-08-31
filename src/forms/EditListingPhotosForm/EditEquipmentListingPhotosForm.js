import React, { Component } from 'react';
import { array, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, Field } from 'react-final-form';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { nonEmptyArray, composeValidators } from '../../util/validators';
import { isUploadImageOverLimitError } from '../../util/errors';
import { AddImages, Button, Form, ValidationError } from '../../components';

import css from './EditListingPhotosForm.module.css';

const ACCEPT_IMAGES = 'image/*';

export class EditEquipmentListingPhotosFormComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageUploadRequested: false,
      otherImages: [],
      uploadedOtherImagesUUIDs: this.props.initialOtherImagesUUIDs ? { ...this.props.initialOtherImagesUUIDs } : {},
      isMainImageUploading: false,
      isMainImageUploaded: this.props.images.length > 0,
    };
    this.onImageUploadHandler = this.onImageUploadHandler.bind(this);
    this.onRemoveMainImage = this.onRemoveMainImage.bind(this);
    this.setOtherImages = this.setOtherImages.bind(this);
    this.onRemoveOtherImages = this.onRemoveOtherImages.bind(this);

    this.submittedMainImage = [];
    this.submittedOtherImages = [];
  }

  componentDidMount() {
    this.setOtherImages();
  }

  setOtherImages(uploadedOtherImagesUUIDs = this.state.uploadedOtherImagesUUIDs) {
    const otherImages = [];
    if (uploadedOtherImagesUUIDs) {
      this.props.images.forEach(image => {
        const imageId = image.id.uuid || (image.imageId && image.imageId.uuid) || image.id;
        if (uploadedOtherImagesUUIDs[imageId]) {
          otherImages.push(image);
        }
      })
    }

    this.setState({ otherImages: [...otherImages] });
  }

  getMainImage() {
    // this is a new listing
    if (this.props.images.length === 0) {
      return [];
    }

    // initialOtherImagesUUIDs undefined and otherImages.length = 0 implies that this listing does 
    // not have other images and user has not added any 
    // in this case, the main image is the only image avaialble
    if (!this.props.initialOtherImagesUUIDs && this.state.otherImages.length === 0) {
      return this.props.images;
    }

    const mainImage = this.props.images.find(image => {
      const imageId = image.id.uuid || (image.imageId && image.imageId.uuid) || image.id;
      return !this.state.uploadedOtherImagesUUIDs[imageId];
    })

    return mainImage ? [mainImage] : [];
  }


  onImageUploadHandler(file, imageType = 'other') {
    if (file) {
      const temporaryId = `${file.name}_${Date.now()}`;
      // temporaryImage serves to show a Spinner in ThumbnailWrapper while the image is being uploaded
      // it will be replaced by the uploadedImage when onImageUpload is done
      const temporaryImage = { id: temporaryId, file };
      if (imageType === 'other') {
        this.setState(prevState => {
          return {
            imageUploadRequested: true,
            otherImages: [...prevState.otherImages, temporaryImage]
          }
        });
      }
      else {
        this.setState({
          imageUploadRequested: true,
          isMainImageUploading: true,
        });
      }

      this.props
        .onImageUpload({ id: temporaryId, file, isOtherPhotos: imageType === 'other' })
        .then((response) => {
          this.setState(prevState => {
            const newState = {
              imageUploadRequested: false,
            }
            if (imageType === 'other') {
              // remove temporaryImage item 
              const newOtherImages = [...prevState.otherImages];
              newOtherImages.pop();
              newOtherImages.push({ ...response.data, file });
              const uploadedOtherImagesUUIDs = { ...prevState.uploadedOtherImagesUUIDs, [response.data.imageId.uuid]: true };
              newState.otherImages = newOtherImages;
              newState.uploadedOtherImagesUUIDs = uploadedOtherImagesUUIDs;
            }
            else {
              newState.isMainImageUploaded = true;
              newState.isMainImageUploading = false;
            }
            return newState;
          })
        })
        .catch(() => {
          this.setState({
            imageUploadRequested: false,
            isMainImageUploading: false
          });
        });
    }
  }

  onRemoveMainImage(values) {
    this.setState({ isMainImageUploaded: false })
    this.props.onRemoveImage(values);
  }

  async onRemoveOtherImages(values) {
    await this.props.onRemoveImage(values);
    this.setOtherImages();
  }

  render() {
    const mainImage = this.getMainImage();

    return (
      <FinalForm
        {...this.props}
        mainImage={mainImage}
        otherImages={this.state.otherImages}
        onRemoveMainImage={this.onRemoveMainImage}
        onRemoveOtherImages={this.onRemoveOtherImages}
        onImageUploadHandler={this.onImageUploadHandler}
        imageUploadRequested={this.state.imageUploadRequested}
        initialValues={{ mainImage: mainImage, otherImages: this.state.otherImages }}
        render={formRenderProps => {
          const {
            form,
            className,
            fetchErrors,
            handleSubmit,
            mainImage,
            otherImages,
            imageUploadRequested,
            intl,
            invalid,
            onImageUploadHandler,
            onRemoveOtherImages,
            disabled,
            ready,
            saveActionMsg,
            updated,
            updateInProgress,
            onRemoveMainImage
          } = formRenderProps;

          const chooseImageText = (
            <span className={css.chooseImageText}>
              <span className={css.chooseImage}>
                <FormattedMessage id="EditListingPhotosForm.chooseImage" />
              </span>
              <span className={css.imageTypes}>
                <FormattedMessage id="EditListingPhotosForm.imageTypes" />
              </span>
            </span>
          );

          const imageRequiredMessage = intl.formatMessage({
            id: 'EditListingPhotosForm.imageRequired',
          });

          const { publishListingError, showListingsError, updateListingError, uploadImageError } =
            fetchErrors || {};
          const uploadOverLimit = isUploadImageOverLimitError(uploadImageError);

          let uploadImageFailed = null;

          if (uploadOverLimit) {
            uploadImageFailed = (
              <p className={css.error}>
                <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadOverLimit" />
              </p>
            );
          } else if (uploadImageError) {
            uploadImageFailed = (
              <p className={css.error}>
                <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadFailed" />
              </p>
            );
          }

          // NOTE: These error messages are here since Photos panel is the last visible panel
          // before creating a new listing. If that order is changed, these should be changed too.
          // Create and show listing errors are shown above submit button
          const publishListingFailed = publishListingError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPhotosForm.publishListingFailed" params={{ listingType: 'equipment' }} />
            </p>
          ) : null;
          const showListingFailed = showListingsError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPhotosForm.showListingFailed" />
            </p>
          ) : null;

          const submittedOnce = this.submittedOtherImages.length > 0;
          // imgs can contain added images (with temp ids) and submitted images with uniq ids.
          const arrayOfImgIds = imgs =>
            imgs.map(i => (typeof i.id === 'string' ? i.imageId : i.id));
          const mainImageIdFromProps = arrayOfImgIds(mainImage);
          const mainImageIdFromPreviousSubmit = arrayOfImgIds(this.submittedMainImage);
          const mainImageArrayHasSameImages = isEqual(mainImageIdFromProps, mainImageIdFromPreviousSubmit);
          const mainImagePristineSinceLastSubmit = submittedOnce && mainImageArrayHasSameImages;

          const otherImageIdsFromProps = arrayOfImgIds(this.state.otherImages);
          const otherImageIdsFromPreviousSubmit = arrayOfImgIds(this.submittedOtherImages);
          const otherImagesArrayHasSameImages = isEqual(otherImageIdsFromProps, otherImageIdsFromPreviousSubmit);
          const otherImagesPristineSinceLastSubmit = submittedOnce && otherImagesArrayHasSameImages;

          const submitReady = (updated && otherImagesPristineSinceLastSubmit && mainImagePristineSinceLastSubmit) || ready;
          const submitInProgress = updateInProgress;
          const submitDisabled =
            invalid || disabled || submitInProgress || imageUploadRequested || ready;

          const classes = classNames(css.root, className);

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedOtherImages = otherImages;
                this.submittedMainImage = mainImage;
                handleSubmit(e);
              }}
            >
              {updateListingError ? (
                <p className={css.error}>
                  <FormattedMessage id="EditListingPhotosForm.updateFailed" />
                </p>
              ) : null}

              {/* Main Photo Section */}
              <h3 className={css.photosTitle}>
                <FormattedMessage id="EditEquipmentListingPhotosForm.mainImageTitle" />
              </h3>
              <AddImages
                className={css.imagesField}
                images={mainImage}
                thumbnailClassName={css.thumbnail}
                savedImageAltText={intl.formatMessage({
                  id: 'EditListingPhotosForm.savedImageAltText',
                })}
                onRemoveImage={onRemoveMainImage}
              >
                {/* we need 2 states for this because isMainImageUploaded is only updated after successful upload,
                  during that time, a second main input is shown (though it will then disappear). */}
                {(this.state.isMainImageUploading || this.state.isMainImageUploaded) ? '' :
                  <Field
                    id="addMainImage"
                    name="addMainImage"
                    accept={ACCEPT_IMAGES}
                    form={null}
                    label={chooseImageText}
                    type="file"
                    disabled={imageUploadRequested}
                  >
                    {fieldprops => {
                      const { accept, input, label, disabled: fieldDisabled } = fieldprops;
                      const { name, type } = input;
                      const onChange = e => {
                        const file = e.target.files[0];
                        form.change(`addMainImage`, file);
                        form.blur(`addMainImage`);
                        onImageUploadHandler(file, 'main');
                      };
                      const inputProps = { accept, id: name, name, onChange, type };
                      return (
                        <div className={css.addImageWrapper}>
                          <div className={css.aspectRatioWrapper}>
                            {fieldDisabled ? null : (
                              <input {...inputProps} className={css.addImageInput} />
                            )}
                            <label htmlFor={name} className={css.addImage}>
                              {label}
                            </label>
                          </div>
                        </div>
                      );
                    }}
                  </Field>
                }
                <Field
                  component={props => {
                    const { input, meta } = props;
                    return (
                      <div className={css.imageRequiredWrapper}>
                        <input {...input} />
                        <ValidationError fieldMeta={meta} isImageInput={true} />
                      </div>
                    );
                  }}
                  name="mainImage"
                  type="hidden"
                  validate={composeValidators(nonEmptyArray(imageRequiredMessage))}
                />
              </AddImages>
              {uploadImageFailed}

              {/* Other Photos Section */}
              <h3 className={css.photosTitle}>
                <FormattedMessage id="EditEquipmentListingPhotosForm.otherImagesTitle" />
              </h3>
              <AddImages
                className={css.imagesField}
                images={this.state.otherImages}
                thumbnailClassName={css.thumbnail}
                savedImageAltText={intl.formatMessage({
                  id: 'EditListingPhotosForm.savedImageAltText',
                })}
                onRemoveImage={onRemoveOtherImages}
              >
                <Field
                  id="addOtherImages"
                  name="addOtherImages"
                  accept={ACCEPT_IMAGES}
                  form={null}
                  label={chooseImageText}
                  type="file"
                  disabled={imageUploadRequested}
                >
                  {fieldprops => {
                    const { accept, input, label, disabled: fieldDisabled } = fieldprops;
                    const { name, type } = input;
                    const onChange = e => {
                      const file = e.target.files[0];
                      form.change(`addOtherImages`, file);
                      form.blur(`addOtherImages`);
                      onImageUploadHandler(file);
                    };
                    const inputProps = { accept, id: name, name, onChange, type };
                    return (
                      <div className={css.addImageWrapper}>
                        <div className={css.aspectRatioWrapper}>
                          {fieldDisabled ? null : (
                            <input {...inputProps} className={css.addImageInput} />
                          )}
                          <label htmlFor={name} className={css.addImage}>
                            {label}
                          </label>
                        </div>
                      </div>
                    );
                  }}
                </Field>

              </AddImages>
              {uploadImageFailed}

              <p className={css.tip}>
                <FormattedMessage id="EditEquipmentListingPhotosForm.addImagesTip" />
              </p>
              {publishListingFailed}
              {showListingFailed}

              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={submitReady}
              >
                {saveActionMsg}
              </Button>
            </Form>
          );
        }}
      />
    );
  }
}

EditEquipmentListingPhotosFormComponent.defaultProps = { fetchErrors: null, images: [] };

EditEquipmentListingPhotosFormComponent.propTypes = {
  fetchErrors: shape({
    publishListingError: propTypes.error,
    showListingsError: propTypes.error,
    uploadImageError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  // images is the main photo of the listing
  images: array,
  otherImages: array,
  intl: intlShape.isRequired,
  onImageUpload: func.isRequired,
  onUpdateImageOrder: func.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  onRemoveImage: func.isRequired,
};

export default compose(injectIntl)(EditEquipmentListingPhotosFormComponent);
