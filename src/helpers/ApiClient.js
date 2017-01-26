import superagent from 'superagent';
import config from '../config';
import cookie from 'react-cookie';

const methods = ['get', 'post', 'put', 'patch', 'del'];

export function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? `/${path}` : path;

  if (__SERVER__) {
    // Prepend host and port of the API server to the path.
    // return 'http://' + config.apiHost + ':' + config.apiPort + adjustedPath;
    return `${config.apiHost}:${config.apiPort}${adjustedPath}`;
  }
  // Prepend `/api` to relative URL, to proxy to API server.
  return `/api${adjustedPath}`;
}

export function getClientCookie() {
  return cookie.load('authToken', { path: '/' });
}

export default class ApiClient {
  constructor(req) {
    methods.forEach((method) =>
      this[method] = (path, { params, data } = {}) => new Promise((resolve, reject) => {

        console.log('API CLIENT !!!', formatUrl(path))
        
        const request = superagent[method](formatUrl(path));

        const authToken = (__SERVER__) ? req.cookies.authToken : getClientCookie();

        console.log('AUTH TOKEN IS API CLIENT', authToken)

        if (params) {
          request.query(params);
        }

        if (authToken && path !== '/signin' && path !== '/signup') {
          request.set('authorization', `${authToken}`);
        }

        if (data) {
          console.log('send data ', data)
          request.send(data);
        }

        request.end((err, { body } = {}) => {
          if (err) {
            console.log("ERRORRR", err)
            reject(body || err);
          } else {
            resolve(body);
          }
        });
      }));
  }
  /*
   * There's a V8 bug where, when using Babel, exporting classes with only
   * constructors sometimes fails. Until it's patched, this is a solution to
   * "ApiClient is not defined" from issue #14.
   * https://github.com/erikras/react-redux-universal-hot-example/issues/14
   *
   * Relevant Babel bug (but they claim it's V8): https://phabricator.babeljs.io/T2455
   *
   * Remove it at your own risk.
   */
  empty() {}
}
