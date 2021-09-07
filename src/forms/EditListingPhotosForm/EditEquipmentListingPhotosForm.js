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
      mainImages: [],
      uploadedOtherImagesUUIDs: this.props.initialOtherImagesUUIDs ? [...this.props.initialOtherImagesUUIDs] : [],
    };
    this.onImageUploadHandler = this.onImageUploadHandler.bind(this);
    this.onRemoveImage = this.onRemoveImage.bind(this);
    this.setMainAndOtherImages = this.setMainAndOtherImages.bind(this);

    this.submittedMainImages = [];
    this.submittedOtherImages = [];
  }

  componentDidMount() {
    this.setMainAndOtherImages();
  }

  setMainAndOtherImages() {
    // default values for a new listing
    let mainImages = [];
    let otherImages = [];

    // initialOtherImagesUUIDs undefined and otherImages.length = 0 implies that this listing does 
    // not have other images and user has not added any 
    // in this case, the main image is the images array
    if (!this.props.initialOtherImagesUUIDs && this.state.otherImages.length === 0) {
      mainImages = [...this.props.images];
    }
    else {
      const uploadedOtherImagesUUIDs = this.state.uploadedOtherImagesUUIDs;
      mainImages = this.props.images.filter(image => {
        const imageId = image.id.uuid || (image.imageId && image.imageId.uuid) || image.id;
        return uploadedOtherImagesUUIDs.indexOf(imageId) === -1;
      })

      if (uploadedOtherImagesUUIDs) {
        this.props.images.forEach(image => {
          const imageId = image.id.uuid || (image.imageId && image.imageId.uuid) || image.id;
          if (uploadedOtherImagesUUIDs.indexOf(imageId) !== -1) {
            otherImages.push(image);
          }
        })
      }

    }
    this.setState({ mainImages, otherImages });
  }


  onImageUploadHandler(file, imageType = 'other') {
    if (file) {
      const temporaryId = `${file.name}_${Date.now()}`;
      // temporaryImage serves to show a Spinner in ThumbnailWrapper while the image is being uploaded
      // it will be replaced by the uploadedImage when onImageUpload is done
      const temporaryImage = { id: temporaryId, file };
      const imageTypeArray = imageType === 'other' ? 'otherImages' : 'mainImages';
      this.setState(prevState => {
        return {
          imageUploadRequested: true,
          [imageTypeArray]: [...prevState[imageTypeArray], temporaryImage]
        }
      });

      const updateImageArrayWithResponseImage = (response, file, imagesArray) => {
        imagesArray.pop();
        imagesArray.push({ ...response.data, file });
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
              updateImageArrayWithResponseImage(response, file, newOtherImages);
              const uploadedOtherImagesUUIDs = [...prevState.uploadedOtherImagesUUIDs, response.data.imageId.uuid];
              newState.otherImages = newOtherImages;
              newState.uploadedOtherImagesUUIDs = uploadedOtherImagesUUIDs;
            }
            else {
              // remove temporaryImage item 
              const newMainImages = [...prevState.mainImages];
              updateImageArrayWithResponseImage(response, file, newMainImages);
              newState.mainImages = newMainImages;
            }
            return newState;
          })
        })
        .catch(() => {
          this.setState({
            imageUploadRequested: false,
          });
        });
    }
  }

  async onRemoveImage(values) {
    await this.props.onRemoveImage(values);
    this.setMainAndOtherImages();
  }

  render() {
    return (
      <FinalForm
        {...this.props}
        mainImages={this.state.mainImages}
        otherImages={this.state.otherImages}
        onImageUploadHandler={this.onImageUploadHandler}
        onRemoveImage={this.onRemoveImage}
        imageUploadRequested={this.state.imageUploadRequested}
        initialValues={{ mainImages: this.state.mainImages, otherImages: this.state.otherImages }}
        render={formRenderProps => {
          const {
            form,
            className,
            fetchErrors,
            handleSubmit,
            mainImages,
            otherImages,
            imageUploadRequested,
            intl,
            invalid,
            onImageUploadHandler,
            disabled,
            ready,
            saveActionMsg,
            updated,
            updateInProgress,
            onRemoveImage
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
          const arrayOfImgIds = (imgs) =>
            imgs.map(i => (typeof i.id === 'string' ? i.imageId : i.id));
          const mainImageIdFromProps = arrayOfImgIds(mainImages);
          const mainImageIdFromPreviousSubmit = arrayOfImgIds(this.submittedMainImages);
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
                this.submittedMainImages = mainImages;
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
                images={mainImages}
                thumbnailClassName={css.thumbnail}
                savedImageAltText={intl.formatMessage({
                  id: 'EditListingPhotosForm.savedImageAltText',
                })}
                onRemoveImage={onRemoveImage}
              >
                <Field
                  id="addMainImages"
                  name="addMainImages"
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
                      form.change(`addMainImages`, file);
                      form.blur(`addMainImages`);
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
                  name="mainImages"
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
                onRemoveImage={onRemoveImage}
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
