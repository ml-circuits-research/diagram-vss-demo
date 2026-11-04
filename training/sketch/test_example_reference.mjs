// Reference contracts only: these checks do not evaluate or train a reader.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const K = require('../../docs/js/logic.js');
const R = require('../../docs/js/example-reference.js');
const S = require('../../docs/js/scenarios.js');
const C = require('../../docs/examples/reference.json');
const start = require('../../docs/js/start-diagram.js');

test('Every menu scenario has exact-text references that replay without engine errors', () => {
  assert.equal(Object.keys(C.scenarios).length, S.length);
  for (const sc of S) {
    assert.deepEqual(C.scenarios[sc.id].map(r => r.text), sc.turns, sc.id);
    const session = R.create(C, { id: sc.id, turns: sc.turns });
    for (let i = 0; i < sc.turns.length; i++) assert.deepEqual(session.at(i).problems, [], `${sc.id}: ${i + 1}`);
  }
});
test('Quick examples replay from the opening drawing and never mutate the supplied state', () => {
  const ui = fs.readFileSync(new URL('../../docs/js/ui.js', import.meta.url), 'utf8');
  const quick = Function('return ' + ui.match(/const QUICK = (\[[\s\S]*?\n\]);/)[1])();
  assert.deepEqual(C.quick.map(r => r.text), quick);
  const sys = K.createSystem(); sys.engine.run(K.parse(start.SOP));
  const initial = sys.world.snapshot(), before = JSON.stringify(initial);
  for (const text of quick) {
    const session = R.create(C, { turns: [text], initial });
    assert.deepEqual(session.at(0).problems, [], text);
    assert.equal(JSON.stringify(initial), before);
    assert.equal(JSON.stringify(sys.world.state), before);
  }
});
test('House expectations keep every create and exact coordinates', () => {
  const sc = S.find(s => s.id === 'house'), session = R.create(C, { id: sc.id, turns: sc.turns });
  const first = session.at(0), final = session.at(4);
  assert.equal(first.state.shapes.length, 1);
  assert.equal(final.state.shapes.length, 8);
  const door = final.state.shapes.find(s => s.name === 'Door');
  assert.deepEqual([door.x, door.y, door.label], [400, 337, 'door']);
  assert.equal(session.at(0).state.shapes.length, 1, 'later replay must not mutate an earlier snapshot');
});
test('Scene values survive conversion, including dimensions, fills and layers', () => {
  const args = K.parse(C.scenarios.farm[1].sop)[0].args;
  assert.deepEqual([args.width, args.height, args.at, args.fill, args.layer], [780, 250, [400, 135], 'light', 'background']);
});
test('Name remapping keeps local SOP references and changes names and literal labels consistently', () => {
  const sop = '@s1 command action=create shape=circle name=Box label="Box status"\n@s2 command action=connect from=Sun to=$s1';
  const nodes = K.parse(R.renameProgram(sop, { Box: 'Box2', Sun: 'Sun2' }));
  assert.equal(nodes[0].args.name, 'Box2'); assert.equal(nodes[0].args.label, 'Box2 status');
  assert.equal(nodes[1].args.from, 'Sun2'); assert.deepEqual(nodes[1].args.to, { ref: 's1' });
  const sc = S.find(s => s.id === 'house'), map = { Walls: 'Walls2', Door: 'Door2' };
  const frame = R.create(C, { id: sc.id, turns: sc.turns.map(t => R.rename(t, map)), map }).at(4);
  assert.equal(frame.blocked, null); assert.ok(frame.state.shapes.find(s => s.name === 'Walls2'));
});
test('Edited requests have no silently reused reference, and dependent previews stop', () => {
  const sc = S.find(s => s.id === 'house'), turns = sc.turns.slice(); turns[0] = 'Draw a purple triangle instead.';
  const session = R.create(C, { id: sc.id, turns });
  assert.equal(session.rows[0].sop, null); assert.equal(session.at(4).blocked, 1);
  assert.equal(session.at(4).state.shapes.length, 0);
});
test('An incomplete annotation stays qualified in later and final previews', () => {
  const sc = S.find(s => s.id === 'factory'), session = R.create(C, { id: sc.id, turns: sc.turns });
  assert.equal(session.at(sc.turns.length - 1).incomplete, 23);
});
test('A failing saved SOP cannot be presented as a complete expected result', () => {
  const session = R.create({ scenarios: {}, quick: [] }, { turns: ['@s1 command action=move target=Absent direction=left'] });
  assert.equal(session.at(0).blocked, 1); assert.ok(session.at(0).problems.length);
});
