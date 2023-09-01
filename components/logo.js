import React from "react";

import {
  Block,
  Text,
  Icon
} from "de/components";

import styles from "@/styles/global";

export const NoPaperLogo = ({ width = "100%", baseStyle = {} }) => {
  return (
    <Block size={[width, "auto"]} baseStyle={baseStyle}>
      <Text family="Pacifico" size={styles.textSize.medium} weight={2.5} background={{ s: 0.45, l: 0.5 }}>~&nbsp;We&nbsp;&bull;&nbsp;Are&nbsp;&bull;&nbsp;No&nbsp;&bull;&nbsp;Paper&nbsp;~</Text>
      <br />
      <Text family="Noto Sans TC" size={styles.textSize.medium} weight={2} background={{ s: 0.2, l: 0.6 }}>&nbsp;無&nbsp;&nbsp;&nbsp;<Icon baseStyle={{ translate: [0, 0.1] }} size={styles.textSize.medium} color={{ s: 0.4, l: 0.55 }} name="note" fill />&nbsp;&nbsp;&nbsp;生&nbsp;&nbsp;&nbsp;活&nbsp;</Text>
    </Block>
  );
};
