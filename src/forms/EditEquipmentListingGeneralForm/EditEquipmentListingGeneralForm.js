import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import arrayMutators from 'final-form-arrays';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { maxLength, required, composeValidators, minLength, minNumber, maxNumber, minAndMaxNumber } from '../../util/validators';
import { Form, Button, FieldTextInput, FieldCheckboxGroup } from '../../components';
import { findMinMaxRangeAndStepForNumberFilter, findOptionsForSelectFilter } from '../../util/search';
import config from '../../config';

import css from './EditEquipmentListingGeneralForm.module.css';

const TITLE_MAX_LENGTH = 60;

const EditEquipmentListingGeneralFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        filterConfig
      } = formRenderProps;

      // messages for equipment name
      const titleMessage = intl.formatMessage({ id: 'EditEquipmentListingGeneralForm.title' });
      const titlePlaceholderMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.titlePlaceholder',
      });
      const titleRequiredMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditEquipmentListingGeneralForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      // messages for equipment description
      const descriptionMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.description',
      });
      const descriptionPlaceholderMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.descriptionPlaceholder',
      });
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const descriptionRequiredMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.descriptionRequired',
      });

      // messages for equipment types
      const typesMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.types',
      });
      const typesPlaceholderMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.descriptionPlaceholder',
      });
      const typesRequiredMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.descriptionRequired',
      });

      // messages for equipment manufacture year
      const manufactureYearRange = findMinMaxRangeAndStepForNumberFilter('manufacture-year', filterConfig);

      const manufactureYearMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.manufactureYear',
      });
      const manufactureYearPlaceholderMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.descriptionPlaceholder',
      });
      const manufactureYearRequiredMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.manufactureYearRequired',
      });
      const manufactureYearRangeMessage = intl.formatMessage(
        { id: 'EditEquipmentListingGeneralForm.manufactureYearRange' },
        {
          min: manufactureYearRange.min,
          max: manufactureYearRange.max
        }
      );

      // messages for equipment max use per day
      const maxUsesPerDayRange = findMinMaxRangeAndStepForNumberFilter('max-uses-per-day', filterConfig);

      const maxUsesPerDayMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.maxUsesPerDay',
      });
      const maxUsesPerDayPlaceholderMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.descriptionPlaceholder',
      });
      const maxUsesPerDayRequiredMessage = intl.formatMessage({
        id: 'EditEquipmentListingGeneralForm.maxUsesPerDayRequired',
      });
      const maxUsesPerDayRangeMessage = intl.formatMessage(
        { id: 'EditEquipmentListingGeneralForm.maxUsesPerDayRange' },
        {
          min: maxUsesPerDayRange.min,
          max: maxUsesPerDayRange.max
        }
      );


      const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.updateFailed" />
        </p>
      ) : null;

      const errorMessageCreateListingDraft = createListingDraftError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.createListingDraftError" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      const typesOptions = findOptionsForSelectFilter('types', filterConfig);

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessageCreateListingDraft}
          {errorMessageUpdateListing}
          {errorMessageShowListing}
          <FieldTextInput
            id="title"
            name="title"
            className={css.title}
            type="text"
            label={titleMessage}
            placeholder={titlePlaceholderMessage}
            maxLength={TITLE_MAX_LENGTH}
            validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
            autoFocus
          />

          <FieldTextInput
            id="description"
            name="description"
            className={css.description}
            type="textarea"
            label={descriptionMessage}
            placeholder={descriptionPlaceholderMessage}
            validate={composeValidators(required(descriptionRequiredMessage))}
          />

          <FieldCheckboxGroup
            id='types'
            name='types'
            className={css.types}
            options={typesOptions}
            label={typesMessage}
            placeholder={typesPlaceholderMessage}
            validate={composeValidators(required(typesRequiredMessage))}
          />

          <FieldTextInput
            id="manufactureYear"
            name="manufactureYear"
            className={css.manufactureYear}
            type="number"
            min={manufactureYearRange.min.toString()}
            max={manufactureYearRange.max.toString()}
            label={manufactureYearMessage}
            placeholder={manufactureYearPlaceholderMessage}
            validate={composeValidators(required(manufactureYearRequiredMessage), minAndMaxNumber(manufactureYearRangeMessage, manufactureYearRange.min, manufactureYearRange.max))}
          />

          <FieldTextInput
            id="maxUsesPerDay"
            name="maxUsesPerDay"
            className={css.maxUsesPerDay}
            type="number"
            min={maxUsesPerDayRange.min.toString()}
            max={maxUsesPerDayRange.max.toString()}
            label={maxUsesPerDayMessage}
            placeholder={maxUsesPerDayPlaceholderMessage}
            validate={composeValidators(required(maxUsesPerDayRequiredMessage), minAndMaxNumber(maxUsesPerDayRangeMessage, maxUsesPerDayRange.min, maxUsesPerDayRange.max))}
          />

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

EditEquipmentListingGeneralFormComponent.defaultProps = {
  className: null,
  fetchErrors: null,
  filterConfig: config.custom.filters,
};

EditEquipmentListingGeneralFormComponent.propTypes = {
  className: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    createListingDraftError: propTypes.error,
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  filterConfig: propTypes.filterConfig,
};

export default compose(injectIntl)(EditEquipmentListingGeneralFormComponent);
