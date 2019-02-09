import * as assert from 'assert';
import { createState } from '../../_server/state';
import { createNewConnection } from '../../_server/reducers';
import { State, Connection } from '../../_server/types';

describe('reducers', () => {
  let state: State;

  beforeEach(() => {
    state = createState(0);
  });

  describe('createNewConnection', () => {
    it('Возвращает ID нового соедениния', () => {
      const socket: any = {};
      const expectedId = state.connections.nextId;
      const id = createNewConnection(state.connections, socket);
      assert.ok(id);
      assert.equal(id, expectedId);
    });

    it('Добавляет новое соединение в стейт', () => {
      const socket: any = {};
      const id = createNewConnection(state.connections, socket);

      const actualConnection = state.connections.map.get(id);
      assert.ok(actualConnection);
      assert.strictEqual((actualConnection as Connection).socket, socket);
    });

    it('Увеличивает счетчик nextId', () => {
      const socket: any = {};
      const oldNextId = state.connections.nextId;
      createNewConnection(state.connections, socket);
      assert.notEqual(state.connections.nextId, oldNextId);
    });
  });
});
