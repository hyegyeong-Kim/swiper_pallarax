gsap.registerPlugin(ScrollTrigger);

$(document).ready(function () {
    const $visual = $('.visual');
    const $media = $visual.find('img, video').first(); // 이미지 또는 비디오
    const hasMedia = $media.length > 0;

    let $visualImg = null;
    let originalSrc = '';
    let mobileSrc = '';

    // 이미지인 경우만 처리
    if (hasMedia && $media.is('img')) {
        $visualImg = $media;
        originalSrc = $visualImg.attr('src');
        mobileSrc = originalSrc.replace(/\.png$/, '_mo.png');
    }

    function isMobileView() {
        return window.innerWidth <= 768;
    }

    // ✅ visual 이미지 교체
    function updateVisualImageSrc() {
        if (!$visualImg || !originalSrc) return;

        const currentSrc = $visualImg.attr('src');
        const isMoSrc = /_mo\.png$/.test(currentSrc);

        if (isMobileView()) {
            if (isMoSrc) return; // 이미 _mo 이미지면 무시

            const imgTest = new Image();
            imgTest.onload = function () {
                $visualImg.attr('src', mobileSrc);
            };
            imgTest.onerror = function () {
                $visualImg.attr('src', originalSrc);
            };
            imgTest.src = mobileSrc;
        } else {
            if (!isMoSrc) return; // 이미 원본이면 무시
            $visualImg.attr('src', originalSrc);
        }
    }

    // ✅ #layout 안의 모든 이미지 (_mo 대응)
    function updateLayoutImages() {
        $('#layout img').each(function () {
            const $img = $(this);
            const src = $img.attr('src');

            if (!src || /_mo\.png$/.test(src)) return;

            const moSrc = src.replace(/\.png$/, '_mo.png');

            if (isMobileView()) {
                const imgTest = new Image();
                imgTest.onload = function () {
                    $img.attr('src', moSrc);
                };
                imgTest.src = moSrc;
            } else {
                $img.attr('src', src); // PC에선 원본 유지
            }
        });
    }

    // ✅ 초기 실행
    updateVisualImageSrc();
    updateLayoutImages();

    // ✅ 리사이즈 대응
    $(window).on('resize', function () {
        updateVisualImageSrc();
        updateLayoutImages();
    });

    // ✅ 애니메이션
    const visualH1 = gsap.utils.toArray('.visual h1 span');
    const visualH2 = gsap.utils.toArray('.visual h2 span');
    const projectInfoItems = gsap.utils.toArray('.project-info li');
    const isMobile = isMobileView();

    if ((visualH1.length > 0 || visualH2.length > 0) && projectInfoItems.length > 0) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: isMobile ? '.visual' : '.wrap',
                start: isMobile ? 'top 90%' : 'top top',
                end: isMobile ? undefined : `+=${window.innerHeight}`,
                pin: isMobile ? false : '.visual',
                pinSpacing: isMobile ? false : false,
                scrub: isMobile ? false : false,
            },
        });

        if (hasMedia) {
            gsap.set($media[0], {
                scale: 1.5,
                transformOrigin: 'center center',
            });

            tl.to($media[0], {
                scale: 1,
                duration: isMobile ? 1 : 2,
                ease: 'power3.out',
            });
        }

        tl.fromTo(
            [...visualH1, ...visualH2],
            { y: 200, opacity: 0, force3D: true },
            {
                y: 0,
                opacity: 1,
                duration: 1.1,
                stagger: 0.15,
                ease: 'power2.out',
                force3D: true,
            },
            hasMedia ? '-=1' : '+=0'
        );

        tl.fromTo(
            projectInfoItems,
            { opacity: 0, force3D: true },
            {
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: 'power2.out',
                force3D: true,
            },
            '-=0.5'
        );
    }


    // ✅ section-common 애니메이션
    const sectionH3 = gsap.utils.toArray('.section-common h3 span');
    const sectionP = gsap.utils.toArray('.section-common p span');
    const desItems = gsap.utils.toArray('.des-container > li');

    if ((sectionH3.length > 0 || sectionP.length > 0) && desItems.length > 0) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.section-common',
                start: 'top 90%',
                toggleActions: 'play none none none',
            },
        });

        tl.fromTo(
            [...sectionH3, ...sectionP],
            { y: 200, opacity: 0, force3D: true },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.15,
                ease: 'power2.out',
                force3D: true,
            },
            0
        );

        tl.fromTo(
            desItems,
            { opacity: 0, force3D: true },
            {
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: 'power2.out',
                force3D: true,
            },
            0.6
        );
    }

    ScrollTrigger.refresh();
});


// ✅ 상세페이지 공통 함수 정의
function animateSectionItems(sectionSelector, itemSelector) {
    const sections = document.querySelectorAll(sectionSelector);
    if (!sections.length) return;

    sections.forEach(section => {
        let items = itemSelector
            ? gsap.utils.toArray(section.querySelectorAll(itemSelector))
            : gsap.utils.toArray(section.children);

        if (!items.length) return;

        gsap.set(items, { opacity: 0, y: 200, force3D: true });

        gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 1.4,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });
}

function animateListGroupWithChildren(sectionSelector, itemSelector = 'li *') {
    const sections = document.querySelectorAll(sectionSelector);
    if (!sections.length) return;

    sections.forEach(section => {
        const items = gsap.utils.toArray(section.querySelectorAll(itemSelector));
        if (!items.length) return;

        gsap.set(items, { opacity: 0, y: 200, force3D: true });

        gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 1.4,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });
}