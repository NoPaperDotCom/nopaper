import Head from "next/head";
import {
  Container,
  Flex,
  Block,
  Text,
  OutlineBtn,
  Logo
} from "de/components";
import { useTranslation } from "de/hooks";
import { share } from "de/utils";

import styles from "@/styles/global";
import { LoadingPopup, AlertPopup } from "@/components/modal";

const AppHead = ({ name, title, author = false, description = false, keywords = false }) => {
  return (
    <Head>
      <title>{`${name} - ${title}`}</title>
      <meta charSet="UTF-8" />
      {description ? <meta name="description" content={description} /> : null}
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      {author ? <meta name="author" content={author} /> : null}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

const Footer = ({
  shareLabel,
  color={ s: 0, l: 0 }
}) => {
  const _label = shareLabel;
  return (
    <Flex itemPosition={["center", "center"]} size="fullwidth">
      <Block size="fullwidth">
        <Text size={styles.textSize.small2step} family="Pacifico" weight={1} background={color}>{'Copyright @ NoPaper.life'}</Text>
      </Block>
      <Flex size="fullwidth">
        <Text size={styles.textSize.small2step} weight={1.2} background={color}>{_label}&nbsp;&nbsp;</Text>
        {["whatsapp", "facebook", "twitter"].map((socialMedia) =>
          <OutlineBtn key={socialMedia} size={["s", 3]} color={color} focusScaleEffect onClick={() => share({ socialMedia, url: window.location.href })}>
            <Logo size={styles.textSize.small2step} name={socialMedia} />
          </OutlineBtn>
        )}
      </Flex>
    </Flex>
  );
};

function MyApp({ Component, pageProps }) {
  const { t } = useTranslation(pageProps.localeObj);
  return (
    <>
      <AppHead
        author={t("app-author")}
        name={t("app-name")}
        description={t("app-description")}
        keywords={t("app-keywords")}
        title={t("app-title")}
      />
      <Container
        size={[1, 1]}
        theme={{
          fontColor: "#000000",
          fontFamily: ["Noto Sans TC", "Roboto"],
          fontSize: 16,   // px
          fontWeight: 400, // unitless
          thickness: 1, // px
          size: 16, //px
          radius: 16, // px
          spacing: 16, // px
          color: { h: 240, s: 0, l: 0 } // blue as theme color
        }}
        colorPalette={{
          focus: styles.color.natural
        }}
      >
        <Component {...pageProps} />
        {(pageProps.noFooter) ? null : <Footer shareLabel={t("share")} color={styles.color.darkgrey} />}
        <LoadingPopup id="loading-popup" />
        <AlertPopup id="alert-popup" />
      </Container>
    </>
  )
}

export default MyApp;
