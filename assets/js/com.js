$(document).ready(function () {
 $('body').removeClass('fadeout').addClass('fadein');
  /* s:lazyload */
  lazyLoads();
  /* e:lazyload */
  

    /* header스크롤 */
    initHeaderScrollToggle();

    // Lenis 제외 페이지 설정
    const lenisExcludePages = ['/project.html'];
    const currentPath = window.location.pathname;

    // Lenis 실행 (제외 페이지가 아니고, Lenis가 로드된 경우만)
    if (typeof Lenis !== 'undefined' && !lenisExcludePages.includes(currentPath)) {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            smoothTouch: false,
        });

        window.lenis = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // 예: 로고 클릭 시
    $('h1 img').on('click', function (e) {
        e.preventDefault(); // 새로고침 방지
        const targetUrl = '/'; // 이동할 URL

        $('body').removeClass('fadein').addClass('fadeout');

        setTimeout(function () {
            window.location.href = targetUrl;
        }, 500); // transition 시간과 동일하게
    });

    // 1. 일반 a 태그 처리
    handleFadeLinkTransition(
        'a[href]:not([href^="#"]):not([target="_blank"])',
        ($el) => $el.attr('href')
    );

    // 2. onclick="location.href='...'" 처리
    handleFadeLinkTransition(
        '[onclick*="location.href"]',
        ($el) => {
            const onclickValue = $el.attr('onclick');
            const match = onclickValue?.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
            return match ? match[1] : null;
        }
    );
    
    $('header').each(function () {
        const $header = $(this);
        const $btnHam = $header.find('.btn_ham');
        const $siteMap = $header.find('.site_map');
        const $logo = $header.find('h1 img');
        const originalLogoSrc = $logo.attr('src');
        let isAnimating = false;

        const updateHeaderZIndex = () => {
            if ($siteMap.hasClass('active')) {
                $header.css({ zIndex: '999' });
            } else {
                $header.css('z-index', '');
            }
        };

        $btnHam.on('click', function () {
            if (isAnimating) return;
            isAnimating = true;

            const isType2 = $header.hasClass('type2');
            const isType3 = $header.hasClass('type3');
            const isWhite = $header.hasClass('white');

            if ($btnHam.parent().hasClass('close')) {
                // ✅ 한 번에 닫히는 처리
                $siteMap.removeClass('active').addClass('close');
                $('body, html').css('overflow', ''); // ✅ body 스크롤 다시 활성화
                $siteMap.find('li').removeClass('active');
                $siteMap.find('.bottom').removeClass('active').children().removeClass('active');
                $btnHam.parent().removeClass('close');
                console.log('hihi')

                if (isType2 && isWhite) {
                    $logo.attr('src', originalLogoSrc);
                } else if (isType2) {
                    $logo.attr('src', toBlackLogo(originalLogoSrc));
                } else {
                    $logo.attr('src', toWhiteLogo(originalLogoSrc));
                }

                if (isType3) {
                    $logo.css('opacity', '0');
                }

                updateHeaderZIndex();

                setTimeout(() => {
                    $siteMap.removeClass('close');
                    isAnimating = false;
                }, 400); // 닫힘 애니메이션 시간 고려
            } else {
                // 열림 처리
                $siteMap.addClass('active');
                 $('body, html').css('overflow', 'hidden'); // ✅ 스크롤 비활성화
                updateHeaderZIndex();
                isAnimating = false;
                $btnHam.parent().addClass('close');

                if (isType2) {
                    $logo.attr('src', toBlackLogo(originalLogoSrc)); // ✅
                } else {
                    $logo.attr('src', toBlackLogo(originalLogoSrc));
                }

                if (isType3) {
                    $logo.css('opacity', '1');
                }

                const $items = $siteMap.find('li');
                $items.each(function (i) {
                    setTimeout(() => {
                        $(this).addClass('active');

                        if (i === $items.length - 1) {
                            $siteMap.find('.bottom').children().each(function (j) {
                                setTimeout(() => {
                                    $(this).addClass('active');
                                }, 300);
                            });
                        }
                    }, i * 300);
                });
            }
        });
    });
    
    /* e:sitemap */

    $('.top').on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 800); // 500은 애니메이션 시간(ms)
    });

    $('.to-bottom').on('click', function () {
        $('html, body').animate({
            scrollTop: $(document).height()
        }, 800); // 0.8초 동안 부드럽게 이동
    });

    initPageRestoreHandler();

    document.addEventListener('DOMContentLoaded', function () {
        const video = document.querySelector('video');
        if (video) {
            video.play().catch(() => {
            // autoplay 실패 시 처리
            video.muted = true;
            video.play();
            });
        }
    });

    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
        console.log('refresh')
    });



});

/* s:lazyload */
function lazyLoads() {
    const lazyElements = document.querySelectorAll('.lazy');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const original = el.getAttribute('data-src');
                        if (!original) return;

                        if (el.getAttribute('lazy-type') === 'bg') {
                            el.style.backgroundImage = `url('${original}')`;
                        } else if (el.tagName.toLowerCase() === 'img') {
                            el.src = original;
                        }
                        el.classList.remove('lazy');
                        obs.unobserve(el);
                    }
                });
            },
            { rootMargin: '0px 0px 200px 0px', threshold: 0.1 }
        );
        lazyElements.forEach((el) => observer.observe(el));
    } else {
        lazyElements.forEach((el) => {
            const original = el.getAttribute('data-src');
            if (!original) return;

            if (el.getAttribute('lazy-type') === 'bg') {
                el.style.backgroundImage = `url('${original}')`;
            } else if (el.tagName.toLowerCase() === 'img') {
                el.src = original;
            }

            el.classList.remove('lazy');
        });
    }
}

function initHeaderScrollToggle() {
  let lastScrollTop = 0;
  const delta = 5;
  const $Headers = $('header');
  const $Logo = $Headers.find('h1 img');
  const originalSrc = $Logo.attr('src');
  const whitekSrc = toWhiteLogo(originalSrc);
  const blacSrc = toBlackLogo(originalSrc);
  $(window).on('scroll.headerToggle', function () {
    if ($('.site_map.active').length > 0) return;
    const st = $(this).scrollTop();
    if (Math.abs(lastScrollTop - st) <= delta) return;
    const isMobile = window.innerWidth <= 767;
    // ✅ scrollTop 5 이하일 때 완전 초기화
    if (st <= 5) {
      if (isMobile) {
        $Headers.removeClass('on hide');
      } else {
        $Headers.removeClass('wh bl hide on');
        $Logo.attr('src', originalSrc);
      }
      lastScrollTop = st;
      return;
    }
    // ✅ 공통: 스크롤 방향에 따라 hide/on 처리
    if (st > lastScrollTop) {
      $Headers.addClass('hide').removeClass('on');
    } else {
      $Headers.removeClass('hide').addClass('on');
    }
    if (!isMobile) {
      // ✅ PC 전용: 섹션 배경에 따라 header 색상 및 로고 변경
      let matched = false;

      $('.dark-section, .light-section').each(function () {
        const $section = $(this);
        const top = $section.offset().top;
        const bottom = top + $section.outerHeight();
        if (st >= top && st < bottom) {
          matched = true;

          if ($section.hasClass('dark-section')) {
            $Headers.removeClass('bl').addClass('wh');
            $Logo.attr('src', whitekSrc);
          } else if ($section.hasClass('light-section')) {
            $Headers.removeClass('wh').addClass('bl');
            $Logo.attr('src', blacSrc);
          }
        }
      });

      // 섹션이 없거나 해당되지 않으면 원래 상태로
      if (!matched) {
        $Headers.removeClass('wh bl');
        $Logo.attr('src', originalSrc);
      }
    }
    lastScrollTop = st;
  });
}

/* e:lazyload */
function goBack() {
    const ref = document.referrer;
    if (ref && ref.startsWith(location.origin) && ref !== location.href) {
        location.href = ref;
    } else {
        location.href = '/';
    }
}

// ✅ 마우스 커서 효과 함수 (모바일 비활성 처리 포함)
function customCursorEffect($area = null, type = 'view') {
    const isMobile = window.innerWidth <= 767;
    const $cursorDot = $('.custom-cursor.dot-cursor');
    const $cursor = $(`.custom-cursor.${type}`);

    // ✅ 모든 이전 이벤트 제거 (중복 방지)
    $(document).off('mousemove.customCursor.' + type);
    if ($area) {
        $area.off('mouseenter.customCursor.' + type);
        $area.off('mouseleave.customCursor.' + type);
    }

    if (isMobile) {
        // ✅ 모바일이면 숨기고 리턴
        $cursorDot.css('display', 'none');
        $cursor.css('display', 'none');
        return;
    }

    // ✅ PC인 경우 커서 표시
    $cursorDot.css({
        display: 'block',
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1
    });
    $cursor.css({
        display: 'flex',
        transform: 'translate(-50%, -50%) scale(0.5)',
        opacity: 0
    });

    // ✅ 마우스 따라 이동
    $(document).on('mousemove.customCursor.' + type, function (e) {
        const x = e.clientX;
        const y = e.clientY;
        $cursorDot.css({ left: x, top: y });
        $cursor.css({ left: x, top: y });
    });

    // ✅ hover 대상 있을 경우
    if ($area && $area.length > 0) {
        $area.on('mouseenter.customCursor.' + type, function () {
            $cursorDot.css('transform', 'translate(-50%, -50%) scale(0)');
            $cursor.css({
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 1,
            });
        });

        $area.on('mouseleave.customCursor.' + type, function () {
            $cursorDot.css('transform', 'translate(-50%, -50%) scale(1)');
            $cursor.css({
                transform: 'translate(-50%, -50%) scale(0.5)',
                opacity: 0,
            });
        });
    }
}

function runGsapScrollAnimations(trigger, target, stagger = 0.2) {
    const elements = gsap.utils.toArray(target);
    if (!elements.length) return;
    gsap.timeline({
        scrollTrigger: {
            trigger: trigger,
            start: 'top 90%',
            end: 'bottom 80%',
            toggleActions: 'play none none none',
        },
    }).fromTo(
        elements,
        { y: 200, opacity: 0, force3D: true },
        {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: 'power2.inOut',
            stagger: stagger,
            force3D: true,
        }
    );
}

// ✅ 텍스트 복사 + 토스트 호출 함수
function copyTextAndToast(button, message) {
    const $targetP = $(button).closest('p');
    const clone = $targetP.clone();
    clone.find('button').remove(); // 버튼 제거
    const text = clone.text().trim();
    const temp = $('<textarea>');
    $('body').append(temp);
    temp.val(text).select();
    document.execCommand('copy');
    temp.remove();
    toast('auto', message, 1500);
}

// ✅ 토스트 띄우기
function toast(_type, _message, _time) {
    const _toast = $('.toast');
    _toast
        .removeClass('active auto confirm') // 기존 class 제거
        .addClass('active ' + _type)
        .html('<span>' + _message + '</span>');
    if (_type === 'auto') {
        setTimeout(function () {
            toast_close(_toast);
        }, _time);
    } else if (_type === 'confirm') {
        _toast.append('<a href="#none" onclick="toast_close($(this).parent());" class="btn_close">close</a>');
        setTimeout(function () {
            _toast.find('.btn_close').focus();
        });
    }
}

// ✅ 토스트 닫기
function toast_close(_toast) {
    _toast.attr('class', 'toast'); // class 초기화
    setTimeout(function () {
        $('body').find('[tabindex="-1"]').focus().removeAttr('tabindex');
        _toast.empty();
    }, 200);
}

function toBlackLogo(src) {
  return src.includes('_black.png') ? src : src.replace('.png', '_black.png');
}

function toWhiteLogo(src) {
  return src.replace('_black.png', '.png');
}

function replaceDivWithVideo($div, videoSrc) {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.position = 'absolute';
    video.style.top = 0;
    video.style.left = 0;
    video.style.zIndex = -1;

    // 기존 커서 효과 유지 위해 이벤트 타겟 div 자체는 유지
    $div.classList.remove('lazyload');
    $div.innerHTML = ''; // 내부 내용 비우고
    $div.appendChild(video); // video 추가
}

function updateLazyloadSrc() {
    const isMobile = window.innerWidth <= 767;

    document.querySelectorAll('.parallax-bg').forEach(function(el) {
        const mobileSrc = el.getAttribute('data-src-mobile');
        const pcSrc = el.getAttribute('data-src');
        const targetSrc = (isMobile && mobileSrc) ? mobileSrc : pcSrc;

        if (!el.getAttribute('data-src-original')) {
            el.setAttribute('data-src-original', pcSrc);
        }

        // 🎯 비디오 처리
        if (el.classList.contains('video-bg')) {
            const video = el.querySelector('video');
            if (video) {
                if (video.getAttribute('src') !== targetSrc) {
                    video.setAttribute('src', targetSrc);
                    video.load();
                }
            } else {
                replaceDivWithVideo(el, targetSrc);
            }
        } else {
            el.setAttribute('data-src', targetSrc);
        }
    });
    console.log('video')
}

function handleFadeLinkTransition(selector, getUrl) {
    $(document).on('click', selector, function (e) {
        const url = getUrl($(this));
        if (!url) return;

        // 예외 조건 처리
        if (
            url.startsWith('#') ||
            url.startsWith('javascript:') ||
            url.startsWith('tel:') ||
            url.startsWith('mailto:')
        ) return;

        e.preventDefault();
        $('body').removeClass('fadein').addClass('fadeout');

        setTimeout(function () {
            window.location.href = url;
        }, 450); // 페이드 시간과 맞추기
    });
}

function initPageRestoreHandler() {
    $(window).on('pageshow', function (event) {
        const isBackForward = event.originalEvent?.persisted ||
            performance.getEntriesByType("navigation")[0]?.type === "back_forward";

        if (isBackForward) {
            // ✅ fadein 복원
            $('body').removeClass('fadeout').addClass('fadein');

            // ✅ ScrollTrigger 재활성화
            if (window.ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
                ScrollTrigger.refresh();
            }

            // ✅ Lenis 재시작
            if (window.lenis && typeof lenis.raf === 'function') {
                requestAnimationFrame((t) => lenis.raf(t));
            }

            // ✅ lazyload 이미지 및 비디오 복구
            updateLazyloadSrc();
            if (typeof LazyLoad !== 'undefined') new LazyLoad();

            // ✅ 커스텀 커서도 재적용
            customCursorEffect($('.parallax-bg'), 'view');
            customCursorEffect($('.visual_cont'), 'view');
            customCursorEffect($('.video-bg'), 'view');
        }
    });
}