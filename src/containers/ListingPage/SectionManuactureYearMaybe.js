import React from 'react';
import { shape, string, number } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';

import css from './SectionTextContentMaybe.module.css';

const SectionManuactureYearMaybe = props => {
  const { className, rootClassName, publicData } = props;
  const classes = classNames(rootClassName || css.root, className);
  return publicData && publicData.manufactureYear ? (
    <div className={classes}>
      <h2 className={css.title}>
        <FormattedMessage id="EquipmentListingPage.manufactureYearTitle" />
      </h2>
      <p className={css.manufactureYear}>{publicData.manufactureYear}</p>
    </div>
  ) : null;
};

SectionManuactureYearMaybe.defaultProps = { className: null, rootClassName: null };

SectionManuactureYearMaybe.propTypes = {
  className: string,
  rootClassName: string,
  publicData: shape({
    manufactureYear: number,
  }),
};

export default SectionManuactureYearMaybe;
