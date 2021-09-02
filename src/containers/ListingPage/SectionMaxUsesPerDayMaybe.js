import React from 'react';
import { shape, string, number } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';

import css from './SectionTextContentMaybe.module.css';

const SectionMaxUsesPerDayMaybe = props => {
  const { className, rootClassName, publicData } = props;
  const classes = classNames(rootClassName || css.root, className);
  return publicData && publicData.maxUsesPerDay ? (
    <div className={classes}>
      <h2 className={css.title}>
        <FormattedMessage id="EquipmentListingPage.maxUsesPerDayTitle" />
      </h2>
      <p className={css.maxUsesPerDay}>{publicData.maxUsesPerDay}</p>
    </div>
  ) : null;
};

SectionMaxUsesPerDayMaybe.defaultProps = { className: null, rootClassName: null };

SectionMaxUsesPerDayMaybe.propTypes = {
  className: string,
  rootClassName: string,
  publicData: shape({
    maxUsesPerDay: number,
  }),
};

export default SectionMaxUsesPerDayMaybe;
