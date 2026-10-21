const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { getCompatibleDonorGroups, searchDonors } = require('../controllers/donorController');

describe('Blood Compatibility Logic', () => {
  test('O- is universal donor (compatible with all recipient blood groups)', () => {
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const group of allGroups) {
      const compatible = getCompatibleDonorGroups(group);
      assert.ok(compatible.includes('O-'), `O- must be compatible with ${group}`);
    }
  });

  test('AB+ can receive from all 8 blood groups (universal recipient)', () => {
    const compatible = getCompatibleDonorGroups('AB+');
    assert.strictEqual(compatible.length, 8);
    const expected = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const bg of expected) {
      assert.ok(compatible.includes(bg));
    }
  });

  test('O- can ONLY receive from O-', () => {
    const compatible = getCompatibleDonorGroups('O-');
    assert.deepStrictEqual(compatible, ['O-']);
  });

  test('A+ recipient can receive from A+, A-, O+, O-', () => {
    const compatible = getCompatibleDonorGroups('A+');
    assert.strictEqual(compatible.length, 4);
    assert.ok(compatible.includes('A+'));
    assert.ok(compatible.includes('A-'));
    assert.ok(compatible.includes('O+'));
    assert.ok(compatible.includes('O-'));
  });

  test('B+ recipient can receive from B+, B-, O+, O-', () => {
    const compatible = getCompatibleDonorGroups('B+');
    assert.strictEqual(compatible.length, 4);
    assert.ok(compatible.includes('B+'));
    assert.ok(compatible.includes('B-'));
    assert.ok(compatible.includes('O+'));
    assert.ok(compatible.includes('O-'));
  });
});

describe('Search Donors Input Validation', () => {
  // Helper to create mock req and res
  const createMockHttp = (query = {}) => {
    const req = { query };
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      },
    };
    return { req, res };
  };

  test('fails with 400 when bloodGroup parameter is missing', async () => {
    const { req, res } = createMockHttp({});
    await searchDonors(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /bloodGroup query parameter is required/i);
  });

  test('fails with 400 when bloodGroup is invalid', async () => {
    const { req, res } = createMockHttp({ bloodGroup: 'Z+' });
    await searchDonors(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /invalid blood group/i);
  });

  test('fails with 400 when only latitude is provided without longitude', async () => {
    const { req, res } = createMockHttp({ bloodGroup: 'O+', latitude: '21.1458' });
    await searchDonors(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /both latitude and longitude are required/i);
  });

  test('fails with 400 when only longitude is provided without latitude', async () => {
    const { req, res } = createMockHttp({ bloodGroup: 'O+', longitude: '79.0882' });
    await searchDonors(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /both latitude and longitude are required/i);
  });

  test('fails with 400 when latitude is out of bounds (< -90 or > 90)', async () => {
    const { req, res } = createMockHttp({ bloodGroup: 'O+', latitude: '95.5', longitude: '79.0882' });
    await searchDonors(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /invalid latitude/i);
  });

  test('fails with 400 when longitude is out of bounds (< -180 or > 180)', async () => {
    const { req, res } = createMockHttp({ bloodGroup: 'O+', latitude: '21.1458', longitude: '190.0' });
    await searchDonors(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /invalid longitude/i);
  });

  test('fails with 400 when coordinates are non-numeric strings', async () => {
    const { req, res } = createMockHttp({ bloodGroup: 'O+', latitude: 'abc', longitude: 'xyz' });
    await searchDonors(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /invalid latitude/i);
  });

  test('fails with 400 when radius is negative or zero', async () => {
    const { req, res } = createMockHttp({
      bloodGroup: 'O+',
      latitude: '21.1458',
      longitude: '79.0882',
      radius: '-5',
    });
    await searchDonors(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /invalid radius/i);
  });

  test('fails with 400 when radius exceeds max limit (500 km)', async () => {
    const { req, res } = createMockHttp({
      bloodGroup: 'O+',
      latitude: '21.1458',
      longitude: '79.0882',
      radius: '1000',
    });
    await searchDonors(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /invalid radius/i);
  });
});
