import React from 'react';
import { string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { NamedLink } from '../../components';

import css from './SectionHero.module.css';

const SectionHero = props => {
  const { rootClassName, className } = props;

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <div className={css.heroContent}>
        <h1 className={css.heroMainTitle}>
          <FormattedMessage id="SectionHero.title" />
        </h1>
        <h2 className={css.heroSubTitle}>
          <FormattedMessage id="SectionHero.subTitle" />
        </h2>
        <div className={css.searchButtons}>
          <NamedLink
            name="SearchPage"
            to={{
              search:
                'address=Finland&bounds=70.0922932%2C31.5870999%2C59.693623%2C20.456500199999937&pub_listingType=sauna',
            }}
            className={css.heroButton}
          >
            <FormattedMessage id="SectionHero.browseButton" />
          </NamedLink>
          {/* browse equipment button */}
          <NamedLink
            name="SearchPage"
            to={{
              search:
                'address=Ho%20Chi%20Minh%20City&bounds=11.1602136037603%2C107.0265769179448%2C10.34937042531151%2C106.3638783822327&pub_listingType=equipment',
            }}
            className={css.heroButton}
          >
            <FormattedMessage id="SectionHero.browseEquipmentButton" />
          </NamedLink>
        </div>
      </div>
    </div>
  );
};

SectionHero.defaultProps = { rootClassName: null, className: null };

SectionHero.propTypes = {
  rootClassName: string,
  className: string,
};

export default SectionHero;
