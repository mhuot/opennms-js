declare const await, describe, beforeEach, it, expect, jest;

import {log,catRoot,setLogLevel} from '../../src/api/Log';
import {LogLevel} from 'typescript-logging';

import {OnmsError} from '../../src/api/OnmsError';
import {Comparator, Comparators} from '../../src/api/Comparator';
import {Filter} from '../../src/api/Filter';
import {Restriction} from '../../src/api/Restriction';

import {OnmsAlarm} from '../../src/model/OnmsAlarm';
import {OnmsSeverity, Severities} from '../../src/model/OnmsSeverity';

import {V1FilterProcessor} from '../../src/dao/V1FilterProcessor';

describe('V1FilterProcessor', () => {
  it('default alarm filter', () => {
    const filter = new Filter();
    const proc = new V1FilterProcessor();
    const params = proc.getParameters(filter);
    expect(Object.keys(params).length).toEqual(1);
    expect(params.limit).toEqual('1000');
  });
  it('alarm filter with no parameters', () => {
    const filter = new Filter();
    filter.limit = undefined;
    const proc = new V1FilterProcessor();
    const params = proc.getParameters(filter);
    expect(Object.keys(params).length).toEqual(0);
  });
  it('alarm filter: id=notnull', () => {
    const filter = new Filter();
    filter.withOrRestriction(new Restriction('id', Comparators.NOTNULL));
    const proc = new V1FilterProcessor();
    const params = proc.getParameters(filter);
    expect(Object.keys(params).length).toEqual(2);
    expect(params.id).toEqual('notnull');
  });
  it('alarm filter: id=notnull, ackTime=null', () => {
    const filter = new Filter();
    filter.withOrRestriction(new Restriction('id', Comparators.NOTNULL));
    filter.withOrRestriction(new Restriction('ackTime', Comparators.NULL));
    const proc = new V1FilterProcessor();
    const params = proc.getParameters(filter);
    expect(Object.keys(params).length).toEqual(3);
    expect(params.id).toEqual('notnull');
    expect(params.ackTime).toEqual('null');
  });
  it('alarm filter: id=notnull, severity="MINOR"', () => {
    const filter = new Filter();
    filter.withOrRestriction(new Restriction('id', Comparators.NOTNULL));
    filter.withOrRestriction(new Restriction('severity', Comparators.EQ, 'MINOR'));
    const proc = new V1FilterProcessor();
    const params = proc.getParameters(filter);
    expect(Object.keys(params).length).toEqual(4);
    expect(params.comparator).toEqual('eq');
    expect(params.id).toEqual('notnull');
    expect(params.severity).toEqual('MINOR');
  });
  it('alarm filter: id=notnull, severity=OnmsSeverity.MINOR', () => {
    const filter = new Filter();
    filter.withOrRestriction(new Restriction('id', Comparators.NOTNULL));
    filter.withOrRestriction(new Restriction('severity', Comparators.EQ, Severities.MINOR));
    const proc = new V1FilterProcessor();
    const params = proc.getParameters(filter);
    expect(Object.keys(params).length).toEqual(4);
    expect(params.comparator).toEqual('eq');
    expect(params.id).toEqual('notnull');
    expect(params.severity).toEqual('MINOR');
  });
  it('alarm filter: severity=OnmsSeverity.MINOR, id!=0', () => {
    const filter = new Filter();
    filter.withOrRestriction(new Restriction('severity', Comparators.EQ, Severities.MINOR));
    filter.withOrRestriction(new Restriction('id', Comparators.NE, 0));
    const proc = new V1FilterProcessor();
    expect(() => {
      proc.getParameters(filter);
    }).toThrow(OnmsError);
  });
  it('alarm filter: lastEventTime=1976-04-14T00:00:00.000+0000', () => {
    const filter = new Filter();
    filter.withOrRestriction(new Restriction('lastEventTime', Comparators.EQ, new Date(198288000000)));
    const proc = new V1FilterProcessor();
    expect(proc.getParameters(filter)).toMatchObject({
      lastEventTime: '1976-04-14T00:00:00.000+0000'
    });
  });
});
