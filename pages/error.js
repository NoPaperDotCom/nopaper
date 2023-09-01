import React from "react";
import { useTranslation } from "de/hooks";
import { getLocaleObj } from "de/utils";

import {
  Flex,
  Block,
  Text,
  FillBtn
} from "de/components";

import { NoPaperLogo } from "@/components/logo";
import styles from "@/styles/global";

export default function ErrorPage({ localeObj, homeUrl, error }) {
  const { t } = useTranslation(localeObj);
  const _errorText = t(error.text, { message: error.message });

  return (
    <Flex size={["100%", "85vh"]} padding={[5, 0]}>
      <Flex size="fullwidth" gap={2}>
        <NoPaperLogo />
        <Block size={["100%", "auto"]}>
          <Text size={styles.textSize.small} weight={2} color={{ h: -240, s: 0.6, l: 0.65 }}>{_errorText}</Text>
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
    </Flex>
  );
}

export async function getServerSideProps({ locale, query, req, res }) {
  const { message = "internal_500_unknown", homeUrl = "" } = query;
  const [errorText, errorCode = 500, errorMessage = ""] = message.split("_");
  const _locale = (!locale) ? "zh_hk" : locale;
  const _localeObj = getLocaleObj(_locale, ["common", "app", "error"]);
  return { props: { localeObj: _localeObj, homeUrl, error: { text: errorText, code: errorCode, message: errorMessage } }};
};
