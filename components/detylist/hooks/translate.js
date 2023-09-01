import React from "react";

export const useTranslation = (localeObj = false) => {
  const _t = (key, params = {}) => {
    if (!localeObj) { return key; }
    if (!localeObj.hasOwnProperty(key)) { return key; }
    let _translatedItem = localeObj[key];
    if (typeof _translatedItem === "string") {
      Object.entries(params).forEach(([k, v]) => {
        _translatedItem = _translatedItem.replaceAll(`{{${k}}}`, v);
      });
    }

    return _translatedItem;
  };

  return { t: _t };
};
