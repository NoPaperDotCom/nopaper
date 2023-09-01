import { loadStripe } from "@stripe/stripe-js";
let _stripe = null;
let _stripePromise = null;

export const getStripeObj = () => {
  if (!_stripe) { _stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); }
  return _stripe;
};

export const getStripePromise = () => {
  if (!_stripePromise) { _stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY); }
  return _stripePromise;
};
