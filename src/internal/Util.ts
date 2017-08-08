import {OnmsError} from '../api/OnmsError';

import {Address4, Address6} from 'ip-address';
import {Moment} from 'moment';

/** @hidden */
// tslint:disable-next-line
const moment = require('moment');

/** @hidden */
const dateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

/**
 * A utility class for random stuff.
 * @module Util
 */
export class Util {

  /**
   * Convert an IP address string to an [[Address4]] or [[Address6]] object.
   */
  public static toIPAddress(addr?: string) {
    if (addr) {
      if (addr.indexOf(':') >= 0) {
        return new Address6(addr);
      } else {
        return new Address4(addr);
      }
    }
    return undefined;
  }

  /**
   * Whether or not the passed object is already a date. (Either a [[Moment]] object, or
   * a JavaScript [[Date]] object.)
   */
  public static isDateObject(date: any) {
    return moment.isMoment(date) || date instanceof Date;
  }

  /**
   * Create a [[Moment]] from any form of date (JavaScript [[Date]], [[Moment]], or epoch).
   * [[Moment]] dates in OpenNMS.js will always be converted internally to UTC to avoid time
   * zone issues.
   */
  public static toDate(date: Date|Moment|string|number): Moment {
    if (date === undefined || date === null) {
      return undefined;
    } else if (moment.isMoment(date)) {
      return (date as Moment).utc();
    } else if (typeof(date) === 'number' || date instanceof Date
      || typeof(date) === 'string' || date instanceof String) {
      return moment(date).utc();
    } else {
      throw new OnmsError('Unable to parse type "' + typeof(date) + '" as a date.');
    }
  }

  /**
   * Create a date string from any form of date (JavaScript [[Date]], [[Moment]], or epoch).
   * Date strings in OpenNMS.js will always be converted internally to UTC to avoid time
   * zone issues.
   */
  public static toDateString(date: Date|Moment|number) {
    if (date === undefined || date === null) {
      return undefined;
    } else if (moment.isMoment(date)) {
      return (date as Moment).utc().format(dateFormat);
    } else if (typeof(date) === 'number' || date instanceof Date) {
      return moment(date).utc().format(dateFormat);
    } else {
      throw new OnmsError('Unable to parse "' + date + '" as a date.');
    }
  }
}
