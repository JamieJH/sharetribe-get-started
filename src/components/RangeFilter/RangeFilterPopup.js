import React, { Component } from 'react';
import { arrayOf, func, node, number, string, objectOf } from 'prop-types';
import classNames from 'classnames';

import { injectIntl, intlShape } from '../../util/reactIntl';

import { OutsideClickHandler } from '../../components';
import { RangeFilterForm } from '../../forms';
import css from './RangeFilterPopup.module.css';
import { getFilterQueryParamName, parse, format, getLabelText } from './sharedFunctions'

const KEY_CODE_ESCAPE = 27;
const RADIX = 10;


class RangeFilterPopup extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
    this.filter = null;
    this.filterContent = null;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.positionStyleForContent = this.positionStyleForContent.bind(this);
  }

  handleSubmit(values) {
    const { onSubmit, queryParamNames } = this.props;
    this.setState({ isOpen: false });
    const filterQueryParamName = getFilterQueryParamName(queryParamNames);
    onSubmit(format(values, filterQueryParamName));
  }

  handleClear() {
    const { onSubmit, queryParamNames } = this.props;
    this.setState({ isOpen: false });
    const filterQueryParamName = getFilterQueryParamName(queryParamNames);
    onSubmit(format(null, filterQueryParamName));
  }

  handleCancel() {
    const { onSubmit, initialValues } = this.props;
    this.setState({ isOpen: false });
    onSubmit(initialValues);
  }

  handleBlur() {
    this.setState({ isOpen: false });
  }

  handleKeyDown(e) {
    // Gather all escape presses to close menu
    if (e.keyCode === KEY_CODE_ESCAPE) {
      this.toggleOpen(false);
    }
  }

  toggleOpen(enforcedState) {
    if (enforcedState) {
      this.setState({ isOpen: enforcedState });
    } else {
      this.setState(prevState => ({ isOpen: !prevState.isOpen }));
    }
  }

  positionStyleForContent() {
    if (this.filter && this.filterContent) {
      // Render the filter content to the right from the menu
      // unless there's no space in which case it is rendered
      // to the left
      const distanceToRight = window.innerWidth - this.filter.getBoundingClientRect().right;
      const labelWidth = this.filter.offsetWidth;
      const contentWidth = this.filterContent.offsetWidth;
      const contentWidthBiggerThanLabel = contentWidth - labelWidth;
      const renderToRight = distanceToRight > contentWidthBiggerThanLabel;
      const contentPlacementOffset = this.props.contentPlacementOffset;

      const offset = renderToRight
        ? { left: contentPlacementOffset }
        : { right: contentPlacementOffset };
      // set a min-width if the content is narrower than the label
      const minWidth = contentWidth < labelWidth ? { minWidth: labelWidth } : null;

      return { ...offset, ...minWidth };
    }
    return {};
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
    const initialFilterValues =
      initialValues && initialValues[filterQueryParamName] ? parse(initialValues[filterQueryParamName], RADIX) : {};
    const { minRange, maxRange } = initialFilterValues || {};

    const hasValue = value => value != null;
    const hasInitialValues = initialValues && hasValue(minRange) && hasValue(maxRange);

    const currentLabel = getLabelText(label, filterQueryParamName, hasInitialValues, minRange, maxRange, intl, true);
    const labelStyles = hasInitialValues ? css.labelSelected : css.label;
    const contentStyle = this.positionStyleForContent();

    return (
      <OutsideClickHandler onOutsideClick={this.handleBlur}>
        <div
          className={classes}
          onKeyDown={this.handleKeyDown}
          ref={node => {
            this.filter = node;
          }}
        >
          <button className={labelStyles} onClick={() => this.toggleOpen()}>
            {currentLabel}
          </button>
          <RangeFilterForm
            id={id}
            initialValues={hasInitialValues ? initialFilterValues : { minRange: min, maxRange: max }}
            onClear={this.handleClear}
            onCancel={this.handleCancel}
            onSubmit={this.handleSubmit}
            intl={intl}
            contentRef={node => {
              this.filterContent = node;
            }}
            style={contentStyle}
            min={min}
            max={max}
            step={step}
            showAsPopup
            isOpen={this.state.isOpen}
          />
        </div>
      </OutsideClickHandler>
    );
  }
}

RangeFilterPopup.defaultProps = {
  rootClassName: null,
  className: null,
  initialValues: null,
  contentPlacementOffset: 0,
  liveEdit: false,
  step: number,
};

RangeFilterPopup.propTypes = {
  rootClassName: string,
  className: string,
  id: string.isRequired,
  label: node,
  queryParamNames: arrayOf(string).isRequired,
  onSubmit: func.isRequired,
  initialValues: objectOf(string),
  contentPlacementOffset: number,
  min: number.isRequired,
  max: number.isRequired,
  step: number,

  // form injectIntl
  intl: intlShape.isRequired,
};

export default injectIntl(RangeFilterPopup);
