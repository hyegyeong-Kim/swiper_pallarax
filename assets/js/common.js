/* 적응형 페이지 분기 진행행 */
function loadPageCSS() {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const head = document.head;

  const pageName = (function () {
    const path = window.location.pathname.split('/');
    const file = path[path.length - 1].split('.')[0];
    return file || 'index';
  })();

  const pageCss = isMobile
    ? `/assets/css/mo_${pageName}.css`
    : `/assets/css/pc_${pageName}.css`;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = pageCss;
  link.type = 'text/css';
  head.appendChild(link);
}

document.addEventListener('DOMContentLoaded', loadPageCSS);