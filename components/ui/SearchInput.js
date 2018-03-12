import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import escapeRegExp from 'lodash/escapeRegExp';
import classnames from 'classnames';

// Next
import { Link } from 'routes';

// Components
import Icon from 'components/ui/Icon';

class SearchInput extends PureComponent {
  static defaultProps = {
    link: {}
  }

  static propTypes = {
    input: PropTypes.object.isRequired,
    link: PropTypes.object,
    getRef: PropTypes.func,
    isHeader: PropTypes.bool,
    escapeText: PropTypes.bool,
    onSearch: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.input.value || undefined
    };
  }

  componentWillReceiveProps(nextProps) {
    const { input } = nextProps;

    this.setState({ value: input.value });
  }

  onSearch = (e) => {
    this.setState({
      value: e.currentTarget.value || ''
    }, () => {
      if (this.props.escapeText) this.props.onSearch(escapeRegExp(this.state.value));
      if (!this.props.escapeText) this.props.onSearch(this.state.value);
    });
  }

  getInputRef(c) {
    const { getRef } = this.props;
    if (getRef && typeof getRef === 'function') {
      return getRef(c);
    }
    return null;
  }

  render() {
    const { value } = this.state;
    const { link, input, isHeader } = this.props;

    const classNames = classnames({
      'c-search-input--header': isHeader
    });

    const inputClassNames = classnames({
      'c-search-input--header': isHeader
    });

    return (
      <div className={`c-search-input ${classNames}`}>
        <div className="c-field -fluid">
          <div className="field-container">
            <input
              className={`-fluid ${inputClassNames}`}
              ref={c => this.getInputRef(c)}
              onChange={this.onSearch}
              placeholder={input.placeholder}
              value={value || ''}
              type="search"
            />
            {!isHeader && <Icon name="icon-search" className="-small" />}
          </div>
        </div>

        {link.route &&
          <Link route={link.route} params={link.params}>
            <a className="c-button -primary">{link.label}</a>
          </Link>
        }
      </div>
    );
  }
}

export default SearchInput;
