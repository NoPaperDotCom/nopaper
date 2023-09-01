import React from "react";
import { callMethod, useTranslation } from "de/hooks";
import { getLocaleObj } from "de/utils";
import { callParseMethod } from "@/utils/parse";

import {
  setOverlayDisplay,
  Flex,
  Block,
  Locator,
  ColorBackground,
  ImageBackground,
  Text,
  Icon,
  Logo,
  FillBtn,
  OutlineBtn,
  TextInput,
  Select
} from "de/components";

import styles from "@/styles/global";
import { NoPaperLogo } from "@/components/logo";
import { whatsapp } from "de/utils";

const _scrollTo = (el) => {
  const _el = (el instanceof Element) ? el : document.getElementById(el);
  if (_el instanceof Element) { return _el.scrollIntoView({ behavior: 'smooth' }, true); }
  return false;
};

const Navbar = ({ t }) => (
  <Locator fixed loc={[0,0,1]} size="fullwidth">
    <ColorBackground color={styles.color.white} />
    <Flex itemPosition={["start", "center"]} size="fullwidth" padding={1}>
      <Flex itemPosition={["start", "center"]} size={[2, "s"]} padding={[1, 0]}>
        <ImageBackground src="/imgs/nopaper.png" />
      </Flex>
      <Flex itemPosition={["end", "center"]} padding={[1, 0]} gap={1} baseStyle={{ translate: [0, -0.4] }}>
        {["introduction", "services", "custom"].map(title => (
          <OutlineBtn
            key={title}
            size="auto"
            color={styles.color.darkgrey}
            hoverLightEffect
            focusLightEffect
            focusScaleEffect
            padding={0}
            onClick={() => _scrollTo(title)}
          >
            <Text size={styles.textSize.custom(1.25)} weight={2}>{t(`${title}-title`)}</Text>
          </OutlineBtn>
        ))}
        <FillBtn
          size={[2, "s"]}
          onClick={() => whatsapp({ phone: "85295414921" })}
          rounded
          padding={0.5}
          color={styles.color.antisimilar2}
          hoverColorEffect
          focusScaleEffect
          baseStyle={{ translate: [0, 0.05] }}
        >
          <Logo color={styles.color.white} />
        </FillBtn>
      </Flex>
    </Flex>
  </Locator>
);

const MyTextInput = React.forwardRef(({ max, ratio, placeholder, rows = 1 }, ref) => (
  <Flex itemPosition={["start", "center"]} size={styles.layout.column(ratio)}>
    <TextInput
      ref={ref}
      border
      rounded
      rows={rows}
      color={styles.color.darkgrey}
      placeholder={placeholder}
      maxLength={max}
    />
  </Flex>
));

const BannerPanel = ({ t }) => (
  <Flex size={["100%", "100vh"]}>
    <NoPaperLogo />
    <Locator reverse loc={[0,0,1]} size="fullwidth">
      <OutlineBtn
        size="fullwidth"
        focusScaleEffect
        padding={0}
        onClick={() => _scrollTo("services")}
      >
        <Flex size="fullwidth" gap={0.5} padding={0.5}>
          <Flex size="fullwidth">
            <Text size={styles.textSize.custom(1)} weight={2} color={styles.color.darkgrey}>{t("down-more")}</Text>
          </Flex>
          <Flex size="fullwidth">
            <Icon name="keyboard_double_arrow_down" color={styles.color.darkgrey} size={1.5} />
          </Flex>
        </Flex>
      </OutlineBtn>
    </Locator>
  </Flex>
);

const IntroductionPanel = ({ t }) => (
  <Flex id="introduction" size={["100%", "100vh"]}>
    <Flex size="auto" padding={[0, 5]}>
      <ColorBackground color={styles.color.grey} />
      <Flex size={styles.layout.column(0.4, "100%")}>
        <Text size={styles.textSize.custom(8)} weight={2} color={styles.color.natural}>&ldquo;&nbsp;紙&nbsp;&rdquo;</Text>
      </Flex>
      <Flex size={styles.layout.column(0.6, "100%")} padding={2}>
        <Flex size="fullwidth" itemPosition="start">
          <Text size={styles.textSize.medium} weight={2} color={styles.color.darkgrey}>{t("introduction")}</Text>
        </Flex>
      </Flex>
    </Flex>
  </Flex>
);

const ServicesPanel = ({ t }) => {
  const [_filterIdx, _setFilterIdx] = React.useState(0);
  const _category = t("app-category");
  const _list = t("app-list").filter(({ category }) => (_filterIdx === 0 || category === _category[_filterIdx]));
  
  return (
    <Flex id="services" itemPosition={["center", "start"]} size={["100%", "100vh"]} padding={1}>
      <ColorBackground color={styles.color.lighten} />
      <Flex size={["50%", "5vh"]}>
        <Select
          datalist={_category.map((c, idx) => ({ value: idx, label: c }))}
          border
          rounded
          color={styles.color.natural}
          placeholder={t("services-category")}
          onChange={(ev) => _setFilterIdx(parseInt(ev.target.value))}
          value={_filterIdx}
        />
      </Flex>
      <Flex itemPosition="start" size={["100%", "80vh"]} padding={1} baseStyle={{ overflowY: true }}>
        {(_list.length > 0) ? null : <Block size="fullwidth"><Text size={1.5} weight={2} color={styles.color.natural}>{t("no-record")}</Text></Block>}
        <Flex itemPosition="start" size="fullwidth" gap={1}>
        {
          _list.map(({ name, title }) => (
            <OutlineBtn
              key={name}
              size={["30%", "auto"]}
              focusScaleEffect
              padding={0}
              onClick={() => window.open(`https://${name}.vercel.app`, "_blank")}
            >
              <Flex size="auto" gap={0.5} padding={0.5}>
                <Flex size={[5, "s"]} rounded>
                  <ImageBackground src={`/imgs/app/${name}.png`} />
                </Flex>
                <Flex size="fullwidth">
                  <Text size={1} weight={1} color={styles.color.white}>{title}</Text>
                </Flex>
              </Flex>
            </OutlineBtn>          
          ))
        }
        </Flex>
      </Flex>
    </Flex>
  );
};

const CustomPanel = ({ t }) => {
  const [_disabledSendBtn, _setDisabledSendBtn] = React.useState(false);
  const _nameInputRef = React.useRef();
  const _contactInputRef = React.useRef();
  const _contentInputRef = React.useRef();

  return (
    <Flex id="custom" size={["100%", "100vh"]}>
      <Flex size="fullwidth" padding={4} gap={1}>
        <Flex itemPosition="start" size="fullwidth" gap={1}>
          <Block align="start" size="fullwidth">
            <Icon size={2} name="mail" color={styles.color.natural} baseStyle={{ translate: [0, 0.2] }} />&nbsp;&nbsp;
            <Text size={1.5} weight={2} color={styles.color.darkgrey}>{t("contact")}</Text>
          </Block>
          <MyTextInput ref={_nameInputRef} max={20} ratio={0.494} placeholder={t("contact-name")} />
          <MyTextInput ref={_contactInputRef} max={50} ratio={0.494} placeholder={t("contact-email")} />
          <MyTextInput ref={_contentInputRef} max={1000} ratio={1} rows={10} placeholder={t("contact-content")} />
          <FillBtn
            size="auto"
            disabled={_disabledSendBtn}
            onClick={() => {
              const _name = (_nameInputRef.current.value || "").trim();
              const _email = (_contactInputRef.current.value || "").trim();
              const _content = (_contentInputRef.current.value || "").trim();

              if (!_name || !_email || !_content) {
                callMethod("alert-popup", "setText", { text: t("information-required") });
                return setOverlayDisplay("alert-popup", true);      
              }

              setOverlayDisplay("loading-popup", true);
              return callParseMethod("mail", { subject: ("NoPaper - " + t("custom-title")), name: _name, content: _content, email: _email })
              .then(() => {
                _setDisabledSendBtn(true);
                setOverlayDisplay("loading-popup", false);
                callMethod("alert-popup", "setText", { text: t("send-complete") });
                return setOverlayDisplay("alert-popup", true);
              });
            }}
            rounded="{}"
            padding={0.5}
            color={styles.color.antisimilar2}
            hoverColorEffect
            focusScaleEffect
          >
            <Text weight={1} size={1} color={styles.color.white}>{t("send")}</Text>
          </FillBtn>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default function Index({ localeObj }) {
  const { t } = useTranslation(localeObj);  
  return (
    <>
      <Navbar t={t} />
      <BannerPanel t={t} />
      <IntroductionPanel t={t} />
      <ServicesPanel t={t} />
      <CustomPanel t={t} />
    </>
  );
}

export async function getServerSideProps({ locale, req, res }) {
  const _locale = (!locale) ? "zh_hk" : locale;
  const _localeObj = getLocaleObj(_locale, ["common", "app", "index"]);
  return { props: { localeObj: _localeObj } };
}
