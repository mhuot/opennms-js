declare const await, describe, beforeEach, it, xit, expect, jest;

import {log,catRoot,setLogLevel} from '../../src/api/Log';
import {LogLevel} from 'typescript-logging';

import {Client} from '../../src/Client';

import {OnmsAuthConfig} from '../../src/api/OnmsAuthConfig';
import {OnmsServer} from '../../src/api/OnmsServer';
import {OnmsResult} from '../../src/api/OnmsResult';

import {Comparators} from '../../src/api/Comparator';
import {Filter} from '../../src/api/Filter';
import {Restriction} from '../../src/api/Restriction';
import {SearchPropertyTypes} from '../../src/api/SearchPropertyType';

import {AlarmDAO} from '../../src/dao/AlarmDAO';

import {OnmsAlarm} from '../../src/model/OnmsAlarm';
import {TroubleTicketStates} from '../../src/model/OnmsTroubleTicketState';

import {MockHTTP19} from '../rest/MockHTTP19';
import {MockHTTP21} from '../rest/MockHTTP21';

const SERVER_NAME='Demo';
const SERVER_URL='http://demo.opennms.org/opennms/';
const SERVER_USER='demo';
const SERVER_PASSWORD='demo';

let opennms : Client, server, auth, mockHTTP, dao : AlarmDAO;

describe('AlarmDAO with v1 API', () => {
  beforeEach((done) => {
    auth = new OnmsAuthConfig(SERVER_USER, SERVER_PASSWORD);
    server = new OnmsServer(SERVER_NAME, SERVER_URL, auth);
    mockHTTP = new MockHTTP19(server);
    opennms = new Client(mockHTTP);
    dao = new AlarmDAO(mockHTTP);
    Client.getMetadata(server, mockHTTP).then((metadata) => {
      server.metadata = metadata;
      done();
    });
  });
  it('AlarmDAO.get(404725)', () => {
    return dao.get(404725).then((alarm) => {
      expect(alarm.id).toEqual(404725);
    });
  });
  it('AlarmDAO.find(id=404725)', () => {
    const filter = new Filter();
    filter.withOrRestriction(new Restriction('id', Comparators.EQ, 404725));
    return dao.find(filter).then((alarms) => {
      expect(alarms.length).toEqual(1);
    });
  });
  it('AlarmDAO.searchProperties() should reject', () => {
    return expect(dao.searchProperties()).rejects.toBeDefined();
  });

  for (const method of ['acknowledge', 'unacknowledge', 'escalate', 'clear']) {
    it('AlarmDAO.' + method + '(id=404725)', () => {
      return dao[method](404725);
    });
    it('AlarmDAO.' + method + '(OnmsAlarm(404725))', () => {
      const alarm = new OnmsAlarm();
      alarm.id=404725;
      return dao[method](alarm);
    });
  }

  it('AlarmDAO.setTTicketId(alarmId=404725, ticketId=abcde)', () => {
    return dao.setTTicketId(404725, 'abcde');
  });
  it('AlarmDAO.setTTicketId(alarm=OnmsAlarm(404725), ticketId=abcde)', () => {
    const alarm = new OnmsAlarm();
    alarm.id=404725;
    return dao.setTTicketId(alarm, 'abcde');
  });
  it('AlarmDAO.setTTicketState(alarmId=404725, ticketState=RESOLVED)', () => {
    return dao.setTTicketState(404725, TroubleTicketStates.RESOLVED);
  });
  it('AlarmDAO.setTTicketState(alarm=OnmsAlarm(404725), ticketState=RESOLVED)', () => {
    const alarm = new OnmsAlarm();
    alarm.id=404725;
    return dao.setTTicketState(alarm, TroubleTicketStates.RESOLVED);
  });

  it('AlarmDAO.createTicket(404725) should reject', () => {
    return expect(dao.createTicket(404725)).rejects.toBeDefined();
  });
  it('AlarmDAO.triggerTicketUpdate(404725) should reject', () => {
    return expect(dao.triggerTicketUpdate(404725)).rejects.toBeDefined();
  });
  it('AlarmDAO.closeTicket(404725) should reject', () => {
    return expect(dao.closeTicket(404725)).rejects.toBeDefined();
  });

  it('AlarmDAO.saveStickyMemo(404725, "test") should reject', () => {
    return expect(dao.saveStickyMemo(404725, 'test')).rejects.toBeDefined();
  });
  it('AlarmDAO.saveJournalMemo(404725, "test") should reject', () => {
    return expect(dao.saveJournalMemo(404725, 'test')).rejects.toBeDefined();
  });
  it('AlarmDAO.deleteStickyMemo(404725) should reject', () => {
    return expect(dao.deleteStickyMemo(404725)).rejects.toBeDefined();
  });
  it('AlarmDAO.deleteJournalMemo(404725) should reject', () => {
    return expect(dao.deleteJournalMemo(404725)).rejects.toBeDefined();
  });
});

describe('AlarmDAO with v2 API', () => {
  beforeEach((done) => {
    auth = new OnmsAuthConfig(SERVER_USER, SERVER_PASSWORD);
    server = new OnmsServer(SERVER_NAME, SERVER_URL, auth);
    mockHTTP = new MockHTTP21(server);
    opennms = new Client(mockHTTP);
    dao = new AlarmDAO(mockHTTP);
    Client.getMetadata(server, mockHTTP).then((metadata) => {
      server.metadata = metadata;
      done();
    });
  });
  it('AlarmDAO.get(6806)', () => {
    return dao.get(6806).then((alarm) => {
      expect(alarm.id).toEqual(6806);
    });
  });
  it('AlarmDAO.find(id=6806)', () => {
    const filter = new Filter();
    filter.withOrRestriction(new Restriction('alarm.id', Comparators.EQ, 6806));
    return dao.find(filter).then((alarms) => {
      expect(alarms.length).toEqual(1);
      expect(alarms[0].id).toEqual(6806);
    });
  });
  it('AlarmDAO.find(uei=should-not-exist)', () => {
    const filter = new Filter();
    filter.withOrRestriction(new Restriction('alarm.uei', Comparators.EQ, 'should-not-exist'));
    return dao.find(filter).then((alarms) => {
      expect(alarms.length).toEqual(0);
    });
  });
  it('should make the journal and sticky notes available - AlarmDAO.get(82416)', () => {
    return dao.get(82416).then((alarm) => {
      expect(alarm.id).toEqual(82416);
      expect(alarm.sticky.body).toEqual('sticky');
      expect(alarm.journal.body).toEqual('journal');
    });
  });
  it('AlarmDAO.searchProperties() should return a list of SearchProperty objects', () => {
    return dao.searchProperties().then((props) => {
      expect(props).toBeDefined();
      expect(props).toHaveLength(165);
      expect(props[0].id).toEqual('alarmAckTime');
      expect(props[0].type).toEqual(SearchPropertyTypes.TIMESTAMP);
    });
  });

  for (const method of ['acknowledge', 'unacknowledge', 'escalate', 'clear']) {
    it('AlarmDAO.' + method + '(id=404725)', () => {
      return dao[method](404725);
    });
    it('AlarmDAO.' + method + '(OnmsAlarm(404725))', () => {
      const alarm = new OnmsAlarm();
      alarm.id=404725;
      return dao[method](alarm);
    });
  }

  it('AlarmDAO.setTTicketId(alarmId=404725, ticketId=abcde)', () => {
    return dao.setTTicketId(404725, 'abcde');
  });
  it('AlarmDAO.setTTicketId(alarm=OnmsAlarm(404725), ticketId=abcde)', () => {
    const alarm = new OnmsAlarm();
    alarm.id=404725;
    return dao.setTTicketId(alarm, 'abcde');
  });
  it('AlarmDAO.setTTicketState(alarmId=404725, ticketState=RESOLVED)', () => {
    return dao.setTTicketState(404725, TroubleTicketStates.RESOLVED);
  });
  it('AlarmDAO.setTTicketState(alarm=OnmsAlarm(404725), ticketState=RESOLVED)', () => {
    const alarm = new OnmsAlarm();
    alarm.id=404725;
    return dao.setTTicketState(alarm, TroubleTicketStates.RESOLVED);
  });

  it('AlarmDAO.createTicket(404725) should return a 202', () => {
    return expect(dao.createTicket(404725).then(() => {
      return true;
    })).resolves.toBeTruthy();
  });
  it('AlarmDAO.triggerTicketUpdate(404725) should reject', () => {
    return expect(dao.triggerTicketUpdate(404725).then(() => {
      return true;
    })).resolves.toBeTruthy();
  });
  it('AlarmDAO.closeTicket(404725) should reject', () => {
    return expect(dao.closeTicket(404725).then(() => {
      return true;
    })).resolves.toBeTruthy();
  });

  it('AlarmDAO.saveStickyMemo(404725, "test") should return a 204', () => {
    return expect(dao.saveStickyMemo(404725, 'test').then(() => {
      return true;
    })).resolves.toBeTruthy();
  });
  it('AlarmDAO.saveJournalMemo(404725, "test") should return a 204', () => {
    return expect(dao.saveJournalMemo(404725, 'test').then(() => {
      return true;
    })).resolves.toBeTruthy();
  });
  it('AlarmDAO.deleteStickyMemo(404725) should return a 204', () => {
    return expect(dao.deleteStickyMemo(404725).then(() => {
      return true;
    })).resolves.toBeTruthy();
  });
  it('AlarmDAO.deleteJournalMemo(404725) should return a 204', () => {
    return expect(dao.deleteJournalMemo(404725).then(() => {
      return true;
    })).resolves.toBeTruthy();
  });
});
