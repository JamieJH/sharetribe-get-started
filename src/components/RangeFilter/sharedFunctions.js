import { formatCurrencyMajorUnit } from '../../util/currency';
import config from '../../config';

export const getFilterQueryParamName = (queryParamNames) => {
  // queryParamNames of a filter is either an Array or a String
  return Array.isArray(queryParamNames) ? queryParamNames[0] : queryParamNames;
};

// Parse value, which should look like "0,1000"
export const parse = (filterRange, RADIX) => {
  const [minRange, maxRange] = !!filterRange
    ? filterRange.split(',').map(v => Number.parseInt(v, RADIX))
    : [];
  // Note: we compare to null, because 0 as minRange is falsy in comparisons.
  return !!filterRange && minRange != null && maxRange != null ? { minRange, maxRange } : null;
};


// Format value, which should look like { minRange, maxRange }
export const format = (range, queryParamName) => {
  const { minRange, maxRange } = range || {};
  // Note: we compare to null, because 0 as minRange is falsy in comparisons.
  const value = minRange != null && maxRange != null ? `${minRange},${maxRange}` : null;
  return { [queryParamName]: value };
};


export const getLabelText = (label, filterQueryParamName, hasInitialValues, minRange, maxRange, intl, isOnMobile) => {
  const currency = config.currencyConfig.currency;

  if (hasInitialValues) {
    const formatMessageId = isOnMobile ? 'RangeFilter.labelSelectedButton' : 'RangeFilter.labelSelectedPlain';
    const labelRange = {};
    if (filterQueryParamName === 'price') {
      labelRange.minRange = formatCurrencyMajorUnit(intl, currency, minRange);
      labelRange.maxRange = formatCurrencyMajorUnit(intl, currency, maxRange);
    }
    else {
      labelRange.minRange = minRange;
      labelRange.maxRange = maxRange;
    }
    return intl.formatMessage(
      { id: formatMessageId },
      { ...labelRange, label }
    )
  }
  else if (label) {
    return label;
  }
  else {
    return intl.formatMessage({ id: 'RangeFilter.label' }, { label: filterQueryParamName });
  }
}
