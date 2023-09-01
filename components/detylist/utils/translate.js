export const getLocaleObj = (locale, localeFileNames = []) => {
  const fs = (typeof window !== "undefined") ? false : require('fs');
  const path = (typeof window !== "undefined") ? false : require('path');

  if (!fs || !path) { return; }

  const _filenames = (Array.isArray(localeFileNames)) ? localeFileNames : localeFileNames.toString().split(",");
  let _obj = {};
  _filenames.forEach(filename => {
    const _filePath = path.resolve('./public', "locales", locale, `${filename}.json`);
    if (fs.existsSync(_filePath)) {
      try {
        const _data = fs.readFileSync(_filePath, "utf8");
        _obj = { ..._obj, ...JSON.parse(_data) };
      } catch (error) {
        console.log(`Translation Error: ${error.message}`);
      }
    }

    return;
  });

  return _obj;
}
