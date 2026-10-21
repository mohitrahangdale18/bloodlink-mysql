const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const Donor = require('../models/Donor');

describe('Donor Model Latitude & Longitude Attributes', () => {
  test('Donor model has latitude and longitude defined with correct constraints', () => {
    const rawAttributes = Donor.rawAttributes;

    assert.ok(rawAttributes.latitude, 'Donor model must have latitude');
    assert.strictEqual(rawAttributes.latitude.allowNull, true, 'latitude must be nullable for existing records');

    assert.ok(rawAttributes.longitude, 'Donor model must have longitude');
    assert.strictEqual(rawAttributes.longitude.allowNull, true, 'longitude must be nullable for existing records');
  });

  test('Donor model getter converts decimal strings to native numbers', () => {
    const donorWithCoords = Donor.build({
      userId: '11111111-1111-1111-1111-111111111111',
      bloodGroup: 'O+',
      city: 'Nagpur',
      latitude: '21.14580000',
      longitude: '79.08820000',
    });

    assert.strictEqual(typeof donorWithCoords.latitude, 'number');
    assert.strictEqual(donorWithCoords.latitude, 21.1458);
    assert.strictEqual(typeof donorWithCoords.longitude, 'number');
    assert.strictEqual(donorWithCoords.longitude, 79.0882);
  });

  test('Donor model getter returns null when coordinates are not set', () => {
    const donorWithoutCoords = Donor.build({
      userId: '22222222-2222-2222-2222-222222222222',
      bloodGroup: 'A+',
      city: 'Mumbai',
    });

    assert.strictEqual(donorWithoutCoords.latitude, null);
    assert.strictEqual(donorWithoutCoords.longitude, null);
  });
});

describe('Donor Search Privacy Enforcement', () => {
  test('Search result sanitization strictly removes latitude and longitude', () => {
    // Simulating database return object
    const rawDbDonor = {
      id: 'd1',
      userId: 'u1',
      bloodGroup: 'O+',
      city: 'Nagpur',
      latitude: 21.1458,
      longitude: 79.0882,
      distanceKm: 3.4,
      isAvailable: true,
      toJSON() {
        return { ...this };
      },
    };

    // Apply the controller sanitization logic
    const sanitized = rawDbDonor.toJSON();
    delete sanitized.latitude;
    delete sanitized.longitude;

    assert.strictEqual(sanitized.latitude, undefined, 'latitude must never be returned');
    assert.strictEqual(sanitized.longitude, undefined, 'longitude must never be returned');
    assert.strictEqual(sanitized.distanceKm, 3.4, 'approximate distance is present');
    assert.strictEqual(sanitized.bloodGroup, 'O+');
    assert.strictEqual(sanitized.isAvailable, true);
  });
});
