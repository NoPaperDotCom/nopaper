import React from "react";
import { useTranslation } from "de/hooks";
import { getLocaleObj } from "de/utils";
import { validUserSessionToken, callParseMethod } from "@/utils/parse";

import {
  Flex,
  Block,
  Text,
  FillBtn
} from "de/components";

import { NoPaperLogo } from "@/components/logo";

import styles from "@/styles/global";
import AppError from "@/utils/error";
import { getStripeObj } from "@/utils/stripe";

const _formatDate = (date) => `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()}`;

export default function CheckoutIndexPage({ localeObj, homeUrl, recipt }) {
  const { t } = useTranslation(localeObj);
  return (      
    <Flex size={["100%", "auto"]} gap={1} padding={[2, 6]}>
      <NoPaperLogo />
      <Block size={["100%", "auto"]}>
        <Text size={styles.textSize.medium} weight={2} color={{ h: -240, s: 0.6, l: 0.65 }}>{t("recipt-message")}</Text> 
      </Block>
      <Block align="start" size={["100%", "auto"]} padding={0.5}>
        <Text size={styles.textSize.medium} weight={1} color={styles.color.black}>{t("recipt-transactionid", { objectId: recipt.objectId })}</Text>
        <br />
        <Text size={styles.textSize.medium} weight={1} color={styles.color.black}>{t("recipt-username", { userName: recipt.userName })}</Text>
        <br />
        <Text size={styles.textSize.medium} weight={1} color={styles.color.black}>{t("recipt-item", { item: recipt.item })}</Text>
        <br />
        <Text size={styles.textSize.medium} weight={1} color={styles.color.black}>{t("recipt-cost", { price: recipt.price, currency: recipt.currency })}</Text>
        <br />
        <Text size={styles.textSize.medium} weight={1} color={styles.color.black}>{t("recipt-start-date", { startDate: _formatDate(new Date(recipt.startDate)) })}</Text>   
        <br />
        <Text size={styles.textSize.medium} weight={1} color={styles.color.black}>{t("recipt-expired-date", { expiredDate: _formatDate(new Date(recipt.expiredDate)) })}</Text>  
        <br />
        <Text size={styles.textSize.medium} weight={1} color={styles.color.black}>{t("recipt-remarks", { remarks: recipt.remarks })}</Text>        
      </Block>
      <FillBtn
        padding={1}
        rounded="()"
        size={["100%", "auto"]}
        color={styles.color.antisimilar2}
        hoverColorEffect
        focusScaleEffect={0.8}
        onClick={() => window.open(homeUrl, "_self")}
      >
        <Text size={1} weight={2} color={styles.color.white}>{t("home")}</Text>
      </FillBtn>
    </Flex>
  )
};

export async function getServerSideProps({ params, query, locale, req, res }) {
  const _proto = req.headers["x-forwarded-proto"] || (req.connection.encrypted ? "https" : "http");
  const { sessionToken = false, sessionId = false, paymentCode = false, successRedirectUrl = `${_proto}://${req.headers.host}`, cancelRedirectUrl = `${_proto}://${req.headers.host}` } = query;
  const _locale = (!locale) ? "zh_hk" : locale;
  const _localeObj = getLocaleObj(_locale, ["common", "app", "checkout"]);

  try {
    const _stripeObj = getStripeObj();

    if (sessionId) {
      const _session = await _stripeObj.checkout.sessions.retrieve(sessionId);
      if (!_session || _session["payment_status"] !== "paid") { throw new AppError({ text: "stripe-error", status: 500, message: _session["payment_status"] }); }

      const _metaData = _session.metadata;
      const _subscription = _session.subscription;
      const _customer = _session.customer;

      // set expired date / add transaction ......
      const _ret = await callParseMethod("purchased", {
        service: _metaData.service,
        serviceName: _metaData.serviceName,
        userId: _metaData.userId,
        userName: _metaData.userName,
        email: _metaData.email,
        method: "stripe",
        refNumber: _session.payment_intent,
        startDate: parseInt(_metaData.startDate),
        subscriptionId: (_subscription && _customer) ? `${_customer.id}#${_subscription.id}` : false,
        days: parseInt(_metaData.days),
        item: _metaData.item,
        price: _session.amount_total / 100,
        currency: _session.currency
      });

      if (_ret instanceof Error) { throw _ret; }
      
      return {
        props: {
          recipt: _ret.transaction,
          homeUrl: successRedirectUrl,
          localeObj: _localeObj
        }
      };
    }
    
    if (!paymentCode) { throw new AppError({ text: "stripe-error", status: 500, message: "No pay code" }); }
    const _json = decodeURIComponent(Buffer.from(paymentCode, 'base64').toString('utf8'));
    const {
      mode = "payment",
      service = false,
      serviceName = false,
      days = false,
      item = false,
      currency = "hkd",
      price = false
    } = JSON.parse(_json);

    if (!service || !serviceName || !days || !item || !price) { throw new AppError({ text: "stripe-error", status: 500, message: "Payment information is incomplete" }); }

    // not a user or checkout cancelled
    if (!sessionToken) {
      return {
        redirect: {
          destination: cancelRedirectUrl,
          permanent: false
        }
      };
    }

    const _user = await validUserSessionToken(sessionToken);
    if (_user instanceof Error) {
      return {
        redirect: {
          destination: cancelRedirectUrl,
          permanent: false
        }
      };    
    }

    // create stripe checkout ...
    const _localeJson = require(`@/public/locales/${_locale}/checkout.json`);
    const _now = new Date();
    const _endDate = new Date();
    let _days = days;
    if (mode === "subscription") {
      if (_days <= 1) { _days = 1; }
      else if (_days <= 7) { _days = 7; }
      else if (_days <= 30) { _days = 30; }
      else { _days = 365; }
    }
    _endDate.setDate(_now.getDate() + _days);

    const _metaData = {
      service,
      serviceName,
      userId: _user.objectId,
      userName: _user.email,
      email: _user.email,
      startDate: _now.valueOf(),
      days: _days,
      item
    };
 
    const _product = await _stripeObj.products.create({
      name: (mode === "subscription") ? item : `${item} (${_formatDate(_now)} - ${_formatDate(_endDate)})`,
      description: _localeJson.terms.replace("{{link}}", `${_proto}://${req.headers.host}/policy`)
    });

    const _priceConfig = {
      product: _product.id,
      unit_amount: price * 100,
      currency,
      metadata: _metaData
    };

    if (mode === "subscription") {
      _priceConfig.recurring = {
        interval: (_days === 1) ? "day" : (_days === 7) ? "week" : (_days === 30) ? "month" : "year",
        interval_count: 1,
        usage_type: "licensed"
      };
    }

    const _price = await _stripeObj.prices.create(_priceConfig);

    // Create Checkout Sessions.
    const _session = await _stripeObj.checkout.sessions.create({
      line_items: [{
        price: _price.id,
        quantity: 1
      }],
      customer_email: _user.email,
      payment_method_types: ["card"],//, "wechat_pay"],
      payment_method_options: {
        wechat_pay: {
          client: "web"
        }
      },
      mode,
      metadata: _metaData,
      success_url: `${_proto}://${req.headers.host}${process.env.STRIPE_CHECKOUT_URL}?status=success&successRedirectUrl=${successRedirectUrl}&cancelRedirectUrl=${cancelRedirectUrl}&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelRedirectUrl
    });

    return {
      redirect: {
        destination: _session.url,
        permanent: false
      }
    };
  } catch (error) {
    return {
      redirect: {
        destination: `/error?message=${error.message}&homeUrl=${cancelRedirectUrl}`,
        permanent: false
      }
    };
  }
};
