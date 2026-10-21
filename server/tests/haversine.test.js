const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { calculateHaversineDistance } = require('../controllers/donorController');

describe('Haversine Distance Calculations', () => {
  test('returns 0 for identical coordinates', () => {
    const lat = 21.1458;
    const lon = 79.0882;
    const distance = calculateHaversineDistance(lat, lon, lat, lon);
    assert.strictEqual(distance, 0);
  });

  test('calculates accurate short distances (Nagpur Zero Mile to Sitabuldi Fort ~0.4km)', () => {
    const zeroMile = { lat: 21.1498, lon: 79.0806 };
    const sitabuldiFort = { lat: 21.1472, lon: 79.0833 };
    const distance = calculateHaversineDistance(zeroMile.lat, zeroMile.lon, sitabuldiFort.lat, sitabuldiFort.lon);
    
    // Distance is approximately 0.4 km
    assert.ok(distance >= 0.3 && distance <= 0.6, `Expected ~0.4 km, got ${distance}`);
  });

  test('calculates accurate medium distances (Nagpur to Wardha ~67km great-circle)', () => {
    const nagpur = { lat: 21.1458, lon: 79.0882 };
    const wardha = { lat: 20.7453, lon: 78.6022 };
    const distance = calculateHaversineDistance(nagpur.lat, nagpur.lon, wardha.lat, wardha.lon);

    // Straight line distance is approximately 67.3 km
    assert.ok(distance >= 65 && distance <= 70, `Expected ~67 km, got ${distance}`);
  });

  test('correctly filters points within 5km radius', () => {
    const userLocation = { lat: 21.1458, lon: 79.0882 }; // Nagpur Center
    
    const donorNear = { lat: 21.1550, lon: 79.0950 }; // ~1.2 km away
    const donorFar = { lat: 21.2200, lon: 79.1500 }; // ~10.4 km away
    
    const distNear = calculateHaversineDistance(userLocation.lat, userLocation.lon, donorNear.lat, donorNear.lon);
    const distFar = calculateHaversineDistance(userLocation.lat, userLocation.lon, donorFar.lat, donorFar.lon);

    assert.ok(distNear <= 5, 'Donor near should be within 5 km');
    assert.ok(distFar > 5, 'Donor far should exceed 5 km');
  });

  test('correctly filters points within 10km and 25km radius thresholds', () => {
    const userLocation = { lat: 21.1458, lon: 79.0882 };
    const donorAt8Km = { lat: 21.2000, lon: 79.1300 }; // ~7.3 km
    const donorAt18Km = { lat: 21.2800, lon: 79.1800 }; // ~17.5 km
    const donorAt35Km = { lat: 21.4000, lon: 79.2500 }; // ~32.6 km

    const d8 = calculateHaversineDistance(userLocation.lat, userLocation.lon, donorAt8Km.lat, donorAt8Km.lon);
    const d18 = calculateHaversineDistance(userLocation.lat, userLocation.lon, donorAt18Km.lat, donorAt18Km.lon);
    const d35 = calculateHaversineDistance(userLocation.lat, userLocation.lon, donorAt35Km.lat, donorAt35Km.lon);

    // 10km check
    assert.ok(d8 <= 10, 'donorAt8Km is within 10 km');
    assert.ok(d18 > 10, 'donorAt18Km exceeds 10 km');

    // 25km check
    assert.ok(d18 <= 25, 'donorAt18Km is within 25 km');
    assert.ok(d35 > 25, 'donorAt35Km exceeds 25 km');
  });

  test('is symmetric: distance from A to B equals distance from B to A', () => {
    const p1 = { lat: 18.5204, lon: 73.8567 }; // Pune
    const p2 = { lat: 19.0760, lon: 72.8777 }; // Mumbai

    const d1 = calculateHaversineDistance(p1.lat, p1.lon, p2.lat, p2.lon);
    const d2 = calculateHaversineDistance(p2.lat, p2.lon, p1.lat, p1.lon);

    assert.strictEqual(d1, d2);
  });
});
