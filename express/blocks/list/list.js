/*
 * Copyright 2021 Adobe. All rights reserved.
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
} from '../../scripts/scripts.js';

function decorateList($block) {
  const list = [];

  const $rows = Array.from($block.children);
  $rows.forEach(($row, i) => {
    // eslint-disable-next-line no-console
    console.log(i);
    const $cells = Array.from($row.children);
    const $title = $cells[0];
    const $text = $cells[1];

    const title = $title.textContent;
    const text = $text.textContent;

    list.push({
      title, text,
    });
  });

  $block.innerHTML = '';
  list.forEach((item) => {
    const { title, text } = item;
    const $listItem = createTag('div', { class: 'item' });
    $block.append($listItem);
    const $title = createTag('h3', { class: 'item-title' });
    $title.innerHTML = title;
    $listItem.append($title);
    const $text = createTag('p', { class: 'item-text' });
    $text.innerHTML = text;
    $listItem.append($text);
  });
}

export default function decorate($block) {
  decorateList($block);
}
