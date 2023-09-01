const googleAPI = (typeof window !== "undefined") ? false : require('googleapis');

import React from "react";
import { callParseMethod } from "@/utils/parse";
import AppError from "@/utils/error";

import {
  Spin,
  Flex
} from "de/components";

const _oauthSignInLinkRequest = (provider = "google", info = {}) => {
  if (provider === "google" && googleAPI) {
    const { google } = googleAPI;
    const _googleOAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      info.redirectURL
    );

    const _state = (!info.state) ? {} : { state: info.state };
    return _googleOAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["email", "openid", "profile"],
      ..._state
    });
  }

  return "/";
};

const _oauthRedirect = async (provider = "google", info = {}) => {
  let _authData = {};
  if (provider === "google" && googleAPI && info.code) {
    const { google } = googleAPI;
    const _googleOAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      info.redirectURL
    );

    const { tokens } = await _googleOAuth2Client.getToken(info.code);
    _googleOAuth2Client.setCredentials(tokens);

    const _oauth2 = google.oauth2({
      auth: _googleOAuth2Client,
      version: "v2"
    });

    const _userInfo = await _oauth2.userinfo.get();
    _authData = {
      id: _userInfo.data.id,
      email: _userInfo.data.email,
      name: _userInfo.data.name,
      picture: _userInfo.data.picture,
      id_token: tokens.id_token,
      access_token: tokens.access_token
    };
  }

  return await callParseMethod("linkUser", { provider, authData: _authData, service: info.service, trialMinutes: info.trialMinutes });
};

export default function OAuthPage() {
  return (
    <Flex size="100%" padding={10}>
      <Spin size={10} color={{ s: 0.25, l: 0.5 }} />
    </Flex>
  );
}

export async function getServerSideProps({ params, query, req, res }) {
  const { provider } = params;
  const { state = false, requestLink = false, oauthCode = false } = query;
  const _proto = req.headers["x-forwarded-proto"] || (req.connection.encrypted ? "https" : "http");
  const _redirectURL = `${_proto}://${req.headers.host}${process.env.OAUTH_URL}/${provider}`;
  let _cancelRedirectUrl = `${_proto}://${req.headers.host}`;

  if (requestLink) {
    if (!oauthCode) { throw new AppError({ text: `${provider}-signin`, status: 500, message: "No oauth code" }); }
    const _json = Buffer.from(oauthCode, 'base64').toString('utf8');
    const { service = false } = JSON.parse(_json);
    if (!service) { throw new AppError({ text: `${provider}-signin`, status: 500, message: "Oauth information is incomplete" }); }

    const _link = _oauthSignInLinkRequest(provider, { redirectURL: _redirectURL, state: oauthCode });
    return {
      redirect: {
        destination: _link,
        permanent: false
      }
    };
  }

  try {
    if (!state) { throw new AppError({ text: `${provider}-signin`, status: 500, message: `${provider} does not pass the oauth code` }); }
    const _json = Buffer.from(state, 'base64').toString('utf8');
    const { service = false, successRedirectUrl = `${_proto}://${req.headers.host}`, cancelRedirectUrl = _cancelRedirectUrl, trialMinutes = 15 } = JSON.parse(_json);
    _cancelRedirectUrl = cancelRedirectUrl;

    if (!service) { throw new AppError({ text: `${provider}-signin`, status: 500, message: `${provider} provide incomplete oauth information` }); }

    const _ret = await _oauthRedirect(provider, { code: query.code, redirectURL: _redirectURL, service, trialMinutes });
    if (_ret.error) { throw new AppError({ text: `${provider}-signin`, status: 500, message: _ret.error }); }
    if (!_ret.user || !_ret.user.sessionToken) {
      return {
        redirect: {
          destination: _cancelRedirectUrl,
          permanent: false
        }
      };
    }

    return {
      redirect: {
        destination: `${successRedirectUrl}?sessionToken=${_ret.user.sessionToken}`,
        permanent: false
      }
    };
  } catch (error) {
    const _message = error.message;
    return {
      redirect: {
        destination: `/error?message=${_message}&homeUrl=${_cancelRedirectUrl}`,
        permanent: false
      }
    };
  }
}
