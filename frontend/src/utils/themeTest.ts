// Theme functionality test utility
export const testThemeSwitching = () => {
  console.log('Testing theme switching functionality...');
  
  // Test 1: Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem('theme');
  console.log('Stored theme:', storedTheme);
  
  // Test 2: Check if theme class is applied to document
  const htmlElement = document.documentElement;
  const hasThemeClass = htmlElement.classList.contains('light') || htmlElement.classList.contains('dark');
  console.log('Theme class applied:', hasThemeClass);
  console.log('Current classes:', htmlElement.className);
  
  // Test 3: Check data attribute
  const dataTheme = htmlElement.getAttribute('data-theme');
  console.log('Data theme attribute:', dataTheme);
  
  // Test 4: Check meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    console.log('Meta theme-color:', metaThemeColor.getAttribute('content'));
  }
  
  // Test 5: Check computed styles
  const bodyStyles = window.getComputedStyle(document.body);
  console.log('Body background-color:', bodyStyles.backgroundColor);
  console.log('Body color:', bodyStyles.color);
  
  console.log('Theme switching test completed');
};

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(testThemeSwitching, 1000);
}
