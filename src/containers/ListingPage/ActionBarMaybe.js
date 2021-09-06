import React from 'react';
import { bool, oneOfType, object, oneOf } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import {
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_CLOSED,
  LISTING_STATE_DRAFT,
  propTypes,
} from '../../util/types';
import { NamedLink } from '../../components';
import EditIcon from './EditIcon';
import { LISTING_TYPES } from '../../marketplace-custom-config';

import css from './ListingPage.module.css';

export const ActionBarMaybe = props => {
  const { isOwnListing, listing, editParams, listingType } = props;
  const state = listing.attributes.state;
  const isPendingApproval = state === LISTING_STATE_PENDING_APPROVAL;
  const isClosed = state === LISTING_STATE_CLOSED;
  const isDraft = state === LISTING_STATE_DRAFT;

  if (isOwnListing) {
    let ownListingTextTranslationId = 'ListingPage.ownListing';

    if (isPendingApproval) {
      ownListingTextTranslationId = 'ListingPage.ownListingPendingApproval';
    } else if (isClosed) {
      ownListingTextTranslationId = 'ListingPage.ownClosedListing';
    } else if (isDraft) {
      ownListingTextTranslationId = 'ListingPage.ownListingDraft';
    }

    const message = isDraft ? 'ListingPage.finishListing' : 'ListingPage.editListing';
    const routeName = listingType === 'equipment' ? 'EditEquipmentListingPage' : 'EditListingPage';

    const ownListingTextClasses = classNames(css.ownListingText, {
      [css.ownListingTextPendingApproval]: isPendingApproval,
    });

    return (
      <div className={css.actionBar}>
        <p className={ownListingTextClasses}>
          <FormattedMessage id={ownListingTextTranslationId} />
        </p>
        <NamedLink className={css.editListingLink} name={routeName} params={editParams}>
          <EditIcon className={css.editIcon} />
          <FormattedMessage id={message} />
        </NamedLink>
      </div>
    );
  } else if (isClosed) {
    return (
      <div className={css.actionBar}>
        <p className={css.closedListingText}>
          <FormattedMessage id="ListingPage.closedListing" />
        </p>
      </div>
    );
  }
  return null;
};

ActionBarMaybe.defaultProps = {
  listingType: 'sauna',
}
ActionBarMaybe.propTypes = {
  isOwnListing: bool.isRequired,
  listing: oneOfType([propTypes.listing, propTypes.ownListing]).isRequired,
  editParams: object.isRequired,
  listingType: oneOf(LISTING_TYPES).isRequired,
};

ActionBarMaybe.displayName = 'ActionBarMaybe';

export default ActionBarMaybe;
