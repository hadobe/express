/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  createTag,
  fetchMultifunctionButton,
  fetchPlaceholders,
  getIconElement,
  getLottie,
  lazyLoadLottiePlayer,
} from '../../scripts/scripts.js';

export const hideScrollArrow = ($floatButtonWrapper, $lottieScrollButton) => {
  $floatButtonWrapper.classList.add('floating-button--scrolled');
  if (document.activeElement === $lottieScrollButton) $lottieScrollButton.blur();
  $lottieScrollButton.tabIndex = -1;
};

export const showScrollArrow = ($floatButtonWrapper, $lottieScrollButton) => {
  $floatButtonWrapper.classList.remove('floating-button--scrolled');
  $lottieScrollButton.removeAttribute('tabIndex');
};

export function initLottieArrow($lottieScrollButton, $floatButtonWrapper, $scrollAnchor, data) {
  let clicked = false;
  $lottieScrollButton.addEventListener('click', () => {
    clicked = true;
    $floatButtonWrapper.classList.add('floating-button--clicked');
    window.scrollTo({
      top: $scrollAnchor.offsetTop,
      behavior: 'smooth',
    });
    const checkIfScrollToIsFinished = setInterval(() => {
      if ($scrollAnchor.offsetTop <= window.scrollY) {
        clicked = false;
        $floatButtonWrapper.classList.remove('floating-button--clicked');
        clearInterval(checkIfScrollToIsFinished);
      }
    }, 200);
    hideScrollArrow($floatButtonWrapper, $lottieScrollButton);
  });
  window.addEventListener('scroll', () => {
    data.scrollState = $floatButtonWrapper.classList.contains('floating-button--scrolled') ? 'withoutLottie' : 'withLottie';
    const multiFunctionButtonOpened = $floatButtonWrapper.classList.contains('toolbox-opened');
    if (clicked) return;
    if ($scrollAnchor.getBoundingClientRect().top < 100) {
      hideScrollArrow($floatButtonWrapper, $lottieScrollButton);
    } else if (!multiFunctionButtonOpened) {
      showScrollArrow($floatButtonWrapper, $lottieScrollButton);
    }
  }, { passive: true });
}

function makeCTAFromSheet($block, data) {
  const $buttonContainer = createTag('div', { class: 'button-container' });
  const ctaFromSheet = createTag('a', { href: data.mainCta.href, title: data.mainCta.text });
  ctaFromSheet.textContent = data.mainCta.text;
  $buttonContainer.append(ctaFromSheet);
  $block.append($buttonContainer);

  return ctaFromSheet;
}

export async function createFloatingButton($block, audience, data) {
  const $a = makeCTAFromSheet($block, data);
  const main = document.querySelector('main');

  // Floating button html
  const $floatButtonLink = $a.cloneNode(true);
  $floatButtonLink.className = '';
  $floatButtonLink.classList.add('button', 'gradient', 'xlarge');

  // Hide CTAs with same url & text as the Floating CTA && is NOT a Floating CTA (in mobile/tablet)
  const sameUrlCTAs = Array.from(main.querySelectorAll('a.button:any-link'))
    .filter((a) => (a.textContent.trim() === $a.textContent.trim() || a.href === $a.href)
      && !a.parentElement.classList.contains('floating-button'));
  sameUrlCTAs.forEach((cta) => {
    cta.classList.add('same-as-floating-button-CTA');
  });

  const $floatButtonWrapperOld = $a.closest('.floating-button-wrapper');
  const $floatButtonWrapper = createTag('div', { class: 'floating-button-wrapper' });
  const $floatButton = createTag('div', { class: 'floating-button' });
  const $lottieScrollButton = createTag('button', { class: 'floating-button-lottie' });

  if (audience) {
    $floatButtonWrapper.dataset.audience = audience;
    $floatButtonWrapper.dataset.sectionStatus = 'loaded';
  }

  $lottieScrollButton.innerHTML = getLottie('purple-arrows', '/express/blocks/floating-button/purple-arrows.json');
  fetchPlaceholders()
    .then((placeholders) => {
      $lottieScrollButton.setAttribute('aria-label', placeholders['see-more']);
    });

  const linksPopulated = new CustomEvent('linkspopulated', { detail: [$floatButtonLink, $lottieScrollButton] });
  document.dispatchEvent(linksPopulated);

  $floatButton.append($floatButtonLink);
  $floatButton.append($lottieScrollButton);
  $floatButtonWrapper.append($floatButton);
  main.append($floatButtonWrapper);
  if ($floatButtonWrapperOld) {
    const $parent = $floatButtonWrapperOld.parentElement;
    if ($parent && $parent.children.length === 1) {
      $parent.remove();
    } else {
      $floatButtonWrapperOld.remove();
    }
  }

  // Floating button scroll/click events
  lazyLoadLottiePlayer();
  const $scrollAnchor = document.querySelector('.section:not(:nth-child(1)):not(:nth-child(2)) .template-list, .section:not(:nth-child(1)):not(:nth-child(2)) .layouts, .section:not(:nth-child(1)):not(:nth-child(2)) .steps-highlight-container') ?? document.querySelector('.section:nth-child(3)');
  if (!$scrollAnchor) {
    hideScrollArrow($floatButtonWrapper, $lottieScrollButton);
  } else {
    initLottieArrow($lottieScrollButton, $floatButtonWrapper, $scrollAnchor, data);
  }

  // Intersection observer - hide button when scrolled to footer
  const $footer = document.querySelector('footer');
  if ($footer) {
    const hideButtonWhenFooter = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.intersectionRatio > 0 || entry.isIntersecting) {
        $floatButtonWrapper.classList.add('floating-button--hidden');
      } else {
        $floatButtonWrapper.classList.remove('floating-button--hidden');
      }
    }, {
      root: null,
      rootMargin: '32px',
      threshold: 0,
    });

    if (document.readyState === 'complete') {
      hideButtonWhenFooter.observe($footer);
    } else {
      window.addEventListener('load', () => {
        hideButtonWhenFooter.observe($footer);
      });
    }
  }

  const $heroCTA = document.querySelector('a.button.same-as-floating-button-CTA');
  if ($heroCTA) {
    const hideButtonWhenIntersecting = new IntersectionObserver((entries) => {
      const $e = entries[0];
      if ($e.boundingClientRect.top > window.innerHeight - 40 || $e.boundingClientRect.top === 0) {
        $floatButtonWrapper.classList.remove('floating-button--below-the-fold');
        $floatButtonWrapper.classList.add('floating-button--above-the-fold');
      } else {
        $floatButtonWrapper.classList.add('floating-button--below-the-fold');
        $floatButtonWrapper.classList.remove('floating-button--above-the-fold');
      }
      if ($e.intersectionRatio > 0 || $e.isIntersecting) {
        $floatButtonWrapper.classList.add('floating-button--intersecting');
      } else {
        $floatButtonWrapper.classList.remove('floating-button--intersecting');
      }
    }, {
      root: null,
      rootMargin: '-40px 0px -40px 0px',
      threshold: 0,
    });
    if (document.readyState === 'complete') {
      hideButtonWhenIntersecting.observe($heroCTA);
    } else {
      window.addEventListener('load', () => {
        hideButtonWhenIntersecting.observe($heroCTA);
      });
    }
  } else {
    $floatButtonWrapper.classList.add('floating-button--above-the-fold');
  }

  return $floatButtonWrapper;
}

export async function collectFloatingButtonData($block) {
  const multifunctionButton = await fetchMultifunctionButton(window.location.pathname);
  const dataArray = [];

  if (multifunctionButton) {
    const defaultButton = await fetchMultifunctionButton('default');
    const objectKeys = Object.keys(defaultButton);

    // eslint-disable-next-line consistent-return
    objectKeys.forEach((key) => {
      if (['path', 'live'].includes(key)) return false;
      dataArray.push([key, multifunctionButton[key] || defaultButton[key]]);
    });
  }

  const data = {
    scrollState: 'withLottie',
    delay: 3,
    tools: [],
    appStore: {},
    mainCta: {},
  };

  dataArray.forEach((col, index, array) => {
    const key = col[0];
    const value = col[1];

    if (key === 'delay') {
      data.delay = value;
    }

    if (key === 'main cta link') {
      data.mainCta.href = value;
    }

    if (key === 'main cta text') {
      data.mainCta.text = value;
    }

    if (key === 'ctas above divider') {
      data.toolsToStash = value;
    }

    for (let i = 1; i < 7; i += 1) {
      if (key === `cta ${i} icon`) {
        const [, href] = array[index + 1];
        const [, text] = array[index + 2];
        const $icon = getIconElement(value);
        const $a = createTag('a', { title: text, href });
        $a.textContent = text;
        data.tools.push({
          icon: $icon,
          anchor: $a,
        });
      }
    }
  });

  return data;
}

export function removeEmptySections() {
  const sections = Array.from(document.querySelectorAll('[class="section section-wrapper"], [class="section section-wrapper floating-button-container"]'));
  const emptySections = sections.filter((s) => s.children.length === 0 || (s.children.length === 1 && s.children[0].classList.contains('floating-button-wrapper')));
  emptySections.forEach((emptySection) => {
    emptySection.remove();
  });
}
