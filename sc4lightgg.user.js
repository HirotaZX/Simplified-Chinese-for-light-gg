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

    // 汉化界面
    var dict = {
        common: {
            "Splicer": "永夜",
            "Chosen": "天选",
            "Beyond Light": "凌光之刻",
            "Trials": "试炼",
            "Raids": "突袭",
            "Lore": "传奇故事",
            "Exotic Gear": "异域装备",
            "Gambit": "智谋",
            "Vanguard": "先锋",
            "Crucible": "熔炉",
            "The Crucible": "熔炉",
            "Iron Banner": "铁旗",
            "Emblems": "徽标",
            "Checklists": "清单",
            "Eververse": "永恒之诗",
            "Season 14": "14赛季",
            "Override Gear": "超控装备",
            "Vault of Glass Gear": "玻璃宝库装备",
            "New Exotics": "新增异域装备",
            "New Armor": "新增护甲",
            "New Weapons": "新增武器",
            "New Cosmetics": "新增装饰",
            "New Quests": "新增任务",
            "Trials Gear": "试炼装备",
            "All Seasons": "所有赛季",
            "Exotics": "异域装备",
            "Weapons": "武器",
            "All Armor": "所有护甲",
            "Titan Gear": "泰坦装备",
            "Hunter Gear": "猎人装备",
            "Warlock Gear": "术士装备",
            "Cosmetics": "装饰",
            "Inventory Items": "物品栏",
            "Quests": "任务",
            "Bounties": "悬赏",
            "Legend": "传说",
            "Collections": "收藏品",
            "Triumphs": "成就",
            "Badges": "证章",
            "Seals": "印章",
            "Vendors": "商人",
            "God Roll Hub": "God Roll 中心",
            "God Roll Finder": "God Roll 查找",
            "Roll Appraiser": "Roll 评估",
            "Tooltip Builder": "Tooltip 构建",
            "Season Pass Tracker": "季票进度追踪",
            "The Director": "导航器",
            "API Update Tracker": "API 更新追踪",
            "Item Comparer": "装备对比"
        },
        navbar: {
            "Database": "数据库",
            "God Rolls": "God Rolls",
            "Tools": "工具",
            "Collection": "收藏",
            "Leaderboard": "排行榜",
        }
    };
    var navbar = document.querySelector('#navbar-collapse');
    var navbarWalker = document.createTreeWalker(
        navbar,
        NodeFilter.SHOW_TEXT
    );
    var currentNode = navbarWalker.currentNode;
    while(currentNode) {
        var text = currentNode.textContent.trim();
        text = dict.navbar[text] || dict.common[text];
        if(text) {
           currentNode.textContent = text; 
        }
        currentNode = navbarWalker.nextNode();
    }
})();
