import {OnmsAuthConfig} from './OnmsAuthConfig';

/**
 * Options to be used when making HTTP ReST calls.
 * @module OnmsHTTPOptions
 */ /** */
export class OnmsHTTPOptions {
  /** the authentication config that should be used when no server auth is configured */
  public auth: OnmsAuthConfig;

  /** how long to wait for ReST calls to time out */
  public timeout = 10000;

  /** the type of response to accept */
  public accept = 'application/xml';

  /** http parameters to be passed on the URL */
  public parameters = {} as any;

  /**
   * Construct a new OnmsHTTPOptions object.
   * @constructor
   */
  constructor(timeout?: number, auth?: OnmsAuthConfig) {
    if (timeout !== undefined) {
      this.timeout = timeout;
    }
    if (auth !== undefined) {
      this.auth = auth;
    }
  }
}
