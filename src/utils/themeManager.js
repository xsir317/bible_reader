// 主题配置
const themes = {
  'brown-light': {
    name: '温暖棕',
    className: 'theme-brown-light'
  },
  'green-light': {
    name: '清新绿',
    className: 'theme-green-light'
  },
  'dark': {
    name: '深色模式',
    className: 'theme-dark'
  }
};

// 默认主题
const DEFAULT_THEME = 'green-light';

// 获取当前主题
const getTheme = () => {
  return localStorage.getItem('theme') || DEFAULT_THEME;
};

// 设置主题
const setTheme = (themeKey) => {
  if (!themes[themeKey]) {
    console.error(`主题 "${themeKey}" 不存在`);
    return false;
  }
  
  localStorage.setItem('theme', themeKey);
  document.body.className = themes[themeKey].className;
  return true;
};

// 应用当前主题
const applyTheme = () => {
  const currentTheme = getTheme();
  setTheme(currentTheme);
  return currentTheme;
};

// 获取所有可用主题
const getAllThemes = () => {
  return Object.keys(themes).map(key => ({
    id: key,
    name: themes[key].name
  }));
};

export { getTheme, setTheme, applyTheme, getAllThemes, themes };