'use strict';

const ORDER_KEYWORDS = ['order', 'want to order', 'i want to buy', 'place order', 'get the', 'i want the'];
const CHECKOUT_KEYWORDS = ['checkout', 'pay', 'buy now', 'purchase'];
const CART_KEYWORDS = ['add to cart', 'add to bag'];
const STATUS_KEYWORDS = ['order status', 'where is my', 'tracking', 'delivery status'];
const INQUIRE_KEYWORDS = ['tell me about', 'details', 'description', 'specifications'];

function run(input) {
  const { message = '', catalog_context = {}, customer_id = 'unknown' } = input || {};
  const msg = message.toLowerCase();

  let intent = 'browse';
  if (STATUS_KEYWORDS.some(k => msg.includes(k))) intent = 'order_status';
  else if (CHECKOUT_KEYWORDS.some(k => msg.includes(k))) intent = 'checkout';
  else if (CART_KEYWORDS.some(k => msg.includes(k))) intent = 'add_to_cart';
  else if (ORDER_KEYWORDS.some(k => msg.includes(k))) intent = 'add_to_cart';
  else if (INQUIRE_KEYWORDS.some(k => msg.includes(k))) intent = 'inquire';

  let order_draft = null;
  let mock_response = 'Welcome! What are you looking for today?';

  if (intent === 'add_to_cart' || intent === 'checkout') {
    const order_id = 'ORD-' + Date.now();
    order_draft = { order_id, customer_id, items: [{ product: message, qty: 1 }], status: 'draft', payment_link: `https://pay.mock/${order_id}`, timestamp: new Date().toISOString() };
    mock_response = `Added to cart! Complete your order: https://pay.mock/${order_id}`;
  } else if (intent === 'order_status') {
    mock_response = 'Your order is being processed. Expected delivery: 2-3 business days.';
  } else if (intent === 'inquire') {
    mock_response = 'Here are the product details. Would you like to add it to your cart?';
  }

  return { intent, mock_response, order_draft };
}

module.exports = { run };
