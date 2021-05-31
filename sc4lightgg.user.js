// ==UserScript==
// @name                Simplified Chinese for light.gg
// @name:zh             light.gg 简体中文支持
// @name:zh-CN          light.gg 简体中文支持
// @namespace           https://github.com/HZDeluxe
// @version             0.1
// @description         Add Simplified Chinese weapons and perks display for light.gg
// @description:zh      为light.gg添加简体中文武器和特性支持
// @description:zh-CN   为light.gg添加简体中文武器和特性支持
// @author              HZDeluxe
// @match               https://www.light.gg/db/items/*
// @match               https://www.light.gg/db/*/items/*
// @grant               GM.setValue
// @grant               GM.getValue
// @grant               unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    // 修正奇怪的'文言'
    document.querySelector('#localemodal .modal-body div:last-child a').lastChild.textContent = ' 中文';

    var matches = location.pathname.match(/\/([a-z-]+)\/items\/(\d+)\//i);
    if (matches[1] != 'zh-cht') {
        document.querySelector('#sidebar-locales div:last-child img').title = '中文';
        return;
    }

    // 创建简繁按钮
    var btnChs = document.createElement('button');
    btnChs.classList.add('btn', 'btn-orange', 'btn-xs');
    btnChs.innerText = '简';
    btnChs.onclick = function() {
        localStorage.setItem('lang', 'chs');
        location.reload();
    };

    var btnCht = document.createElement('button');
    btnCht.classList.add('btn', 'btn-orange', 'btn-xs');
    btnCht.innerText = '繁';
    btnCht.onclick = function() {
        localStorage.setItem('lang', 'cht');
        location.reload();
    };

    document.querySelector('#main-column .item-header .item-name h2').append(btnChs);
    document.querySelector('#main-column .item-header .item-name h2').append(btnCht);

    // 读取设置
    var lang = localStorage.getItem('lang');
    if (!lang) {
        lang = 'chs';
        localStorage.setItem('lang', lang);
    }
    if (lang != 'chs') {
        return;
    }

    // 请求并替换简中武器信息
    var item = {};
    item.id = matches[2];
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/db/items/hover/' + item.id + '?lang=zh-chs');
    xhr.send();
    xhr.onload = function() {
        if (xhr.responseText) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(xhr.responseText, "text/html");

            item.name = doc.querySelector('.hover-item-header h2').innerText.trim();
            item.source = doc.querySelector('.collectible-hint .inner-description-container').lastChild.textContent;
            item.intrinsicPerk = doc.querySelector('.hover-item-intrinsic-perk h4').innerHTML;
            item.intrinsicPerkDesc = doc.querySelector('.hover-item-intrinsic-perk h4 + div').innerHTML;
            item.traitPerk = doc.querySelector('.hover-item-trait-perk h4').innerText;
            item.traitPerkDesc = doc.querySelector('.hover-item-trait-perk h4 + div').innerText;

            document.querySelector('#main-column .item-header .item-name h2').childNodes[0].textContent = item.name;
            document.querySelector('#related-collectible .item-header .item-name h2').childNodes[0].textContent = item.name;
            document.querySelector('#related-collectible .source-line').innerText = item.source;

            var keyPerks = document.querySelectorAll('.key-perk');
            keyPerks[0].querySelector('h4').innerHTML = item.intrinsicPerk;
            keyPerks[0].querySelector('h4 + div').innerHTML = item.intrinsicPerkDesc;
            keyPerks[1].querySelector('h4').innerHTML = item.traitPerk;
            keyPerks[1].querySelector('h4 + div').innerHTML = item.traitPerkDesc;
        }
    };

    // 修改繁中perk请求为简中
    var realOpen = unsafeWindow.XMLHttpRequest.prototype.open;
    unsafeWindow.XMLHttpRequest.prototype.open = function() {
        var url = arguments['1'];
        if (url.startsWith('/db/items/hover/')
            && url.includes('?lang=')) {
            var splits = url.split('=');
            url = splits[0] + '=zh-chs';
        }
        arguments['1'] = url;
        return realOpen.apply(this, arguments);
    };

})();
