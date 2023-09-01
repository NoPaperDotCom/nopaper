// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getStripeObj } from "@/utils/stripe";

export default async (req, res) => {
  const _proto = req.headers["x-forwarded-proto"] || (req.connection.encrypted ? "https" : "http");
  const _host = `${_proto}://${req.headers.host}`;
  const { subscriptionId = false, successRedirectUrl = false, cancelRedirectUrl = _host } = req.query;

  try {
    if (!subscriptionId || !successRedirectUrl) { throw new Error("Information incomplete"); }
    const _customerId = subscriptionId.split("#")[0];
    const _stripeObj = getStripeObj();
    const _portalSession = await _stripeObj.billingPortal.sessions.create({
      customer: _customerId,
      return_url: successRedirectUrl
    });

    return res.redirect(303, _portalSession.url);
  } catch (error) {
    return res.redirect(303, `${_host}/error?message=${error.message}&homeUrl=${cancelRedirectUrl}`);
  }
};
