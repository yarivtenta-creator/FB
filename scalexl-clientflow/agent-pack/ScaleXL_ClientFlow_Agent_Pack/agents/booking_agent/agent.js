'use strict';

const REQUIRED_FIELDS = ['name', 'date', 'time', 'service_type'];

function run(input) {
  const { message = '', existing_booking_data = {} } = input || {};
  const booking = Object.assign({}, existing_booking_data);
  const missing_fields = REQUIRED_FIELDS.filter(f => !booking[f]);

  if (missing_fields.length === 0) {
    const booking_object = Object.assign({}, booking, {
      id: 'BK-' + Date.now(),
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    });
    return { status: 'confirmed', booking_object, missing_fields: [] };
  }

  return {
    status: missing_fields.length < REQUIRED_FIELDS.length ? 'collecting' : 'missing_fields',
    booking_object: booking,
    missing_fields
  };
}

module.exports = { run };
