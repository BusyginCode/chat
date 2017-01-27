import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  storeAuthToken,
  deleteAuthToken,
  isLoaded,
  loadToken,
} from 'redux/modules/auth';
import * as authActions from 'redux/modules/auth';
import { push } from 'react-router-redux';
import { asyncConnect } from 'redux-async-connect';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Header, ReactLoader } from 'containers'
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin()

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = [];
    if (!isLoaded(getState())) {
      promises.push(dispatch(loadToken()));
    }
    return Promise.all(promises);
  }
}])
@connect(
  state => ({ token: state.auth.token }), { deleteAuthToken, storeAuthToken }
)
export default class App extends Component {

  componentWillReceiveProps(nextProps) {
    if (!this.props.token && nextProps.token) {
      storeAuthToken(nextProps.token);
    }

    if (this.props.token && !nextProps.token) {
      deleteAuthToken();
    }
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={ styles.app }>
          <ReactLoader />
          <Header />
          { this.props.children }
        </div>
      </MuiThemeProvider>
    );
  }
}

const styles = {
  app: {
    flex: 0.5,
  }
}