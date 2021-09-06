import React, { Component } from 'react';
import { arrayOf, func, node, number, objectOf, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import config from '../../config';
import { getFilterQueryParamName, parse, format, getLabelText} from './sharedFunctions'

import { RangeFilterForm } from '../../forms';

import css from './RangeFilterPlain.module.css';

const RADIX = 10;


class RangeFilterPlainComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: true };

    this.handleChange = this.handleChange.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.toggleIsOpen = this.toggleIsOpen.bind(this);
  }

  handleChange(values) {
    const { onSubmit, queryParamNames } = this.props;
    const filterQueryParamName = getFilterQueryParamName(queryParamNames);
    onSubmit(format(values, filterQueryParamName));
  }

  handleClear() {
    const { onSubmit, queryParamNames } = this.props;
    const filterQueryParamName = getFilterQueryParamName(queryParamNames);
    onSubmit(format(null, filterQueryParamName));
  }

  toggleIsOpen() {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }


  render() {
    const {
      rootClassName,
      className,
      id,
      label,
      queryParamNames,
      initialValues,
      min,
      max,
      step,
      intl,
    } = this.props;
    const classes = classNames(rootClassName || css.root, className);

    const filterQueryParamName = getFilterQueryParamName(queryParamNames);
    const initialFilterValues = initialValues ? parse(initialValues[filterQueryParamName], RADIX) : {};
    const { minRange, maxRange } = initialFilterValues || {};

    const hasValue = value => value != null;
    const hasInitialValues = initialValues && hasValue(minRange) && hasValue(maxRange);

    const labelClass = hasInitialValues ? css.filterLabelSelected : css.filterLabel;
    const labelText = getLabelText(label, filterQueryParamName, hasInitialValues, minRange, maxRange, intl, false);

    return (
      <div className={classes}>
        <div className={labelClass}>
          <button type="button" className={css.labelButton} onClick={this.toggleIsOpen}>
            <span className={labelClass}>{labelText}</span>
          </button>
          <button type="button" className={css.clearButton} onClick={this.handleClear}>
            <FormattedMessage id={'RangeFilter.clear'} />
          </button>
        </div>
        <div className={css.formWrapper}>
          <RangeFilterForm
            id={id}
            initialValues={hasInitialValues ? initialFilterValues : { minRange: min, maxRange: max }}
            onChange={this.handleChange}
            intl={intl}
            contentRef={node => {
              this.filterContent = node;
            }}
            min={min}
            max={max}
            step={step}
            liveEdit
            isOpen={this.state.isOpen}
          />
        </div>
      </div>
    );
  }
}

RangeFilterPlainComponent.defaultProps = {
  rootClassName: null,
  className: null,
  initialValues: null,
  step: number,
  currencyConfig: config.currencyConfig,
};

RangeFilterPlainComponent.propTypes = {
  rootClassName: string,
  className: string,
  id: string.isRequired,
  label: node,
  queryParamNames: arrayOf(string).isRequired,
  onSubmit: func.isRequired,
  initialValues: objectOf(string),
  min: number.isRequired,
  max: number.isRequired,
  step: number,

  // form injectIntl
  intl: intlShape.isRequired,
};

const RangeFilterPlain = injectIntl(RangeFilterPlainComponent);

export default RangeFilterPlain;
