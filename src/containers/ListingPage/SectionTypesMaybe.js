import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { PropertyGroup } from '../../components';

import css from './ListingPage.module.css';

const SectionTypeMaybe = props => {
  const { options, publicData } = props;
  if (!publicData) {
    return null;
  }

  const selectedOptions = publicData && publicData.types ? publicData.types : [];
  return (
    <div className={css.sectionFeatures}>
      <h2 className={css.featuresTitle}>
        <FormattedMessage id="EquipmentListingPage.typesTitle"/>
      </h2>
      <PropertyGroup
        id="EquipmentListingPage.types"
        options={options}
        selectedOptions={selectedOptions}
        twoColumns={true}
      />
    </div>
  );
};

export default SectionTypeMaybe;
