// =========================================================
//  界外网球 · 全站页眉/页脚通用脚本
//  - 滚动时为 .site-header 添加 .scrolled（磨砂）
//  - 移动端汉堡菜单
//  - 点击展开「活动」下拉（默认隐藏，点击外部关闭）
//  - 向 #siteFooterMount 注入「彩虹 + 3D 网球游戏页脚」
//    （tennis-game.js 会自动初始化 .tennis-game-footer）
// =========================================================
(function () {
    function bindHeader() {
        var heads = document.querySelectorAll('.site-header');
        if (!heads.length) return;
        function onScroll() {
            heads.forEach(function (h) { h.classList.toggle('scrolled', window.scrollY > 30); });
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function bindBurger() {
        var bm = document.getElementById('burger'), mm = document.getElementById('mobileMenu');
        if (bm && mm) {
            bm.addEventListener('click', function (e) { e.stopPropagation(); mm.classList.toggle('open'); });
            mm.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () { mm.classList.remove('open'); });
            });
        }
    }

    function bindDropdown() {
        var dd = document.querySelector('.site-header .dropdown');
        if (!dd) return;
        var toggle = dd.querySelector('a');
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            dd.classList.toggle('open');
        });
        document.addEventListener('click', function (e) {
            if (!dd.contains(e.target)) dd.classList.remove('open');
        });
    }

    function injectFooter() {
        var mount = document.getElementById('siteFooterMount');
        if (!mount || mount.dataset.done) return;
        mount.dataset.done = '1';
        mount.innerHTML = [
            '<div class="rainbow-band"><div class="arc"></div><div class="shine"></div></div>',
            '<section class="tennis-game-footer">',
            '  <div class="tg-canvas"></div>',
            '  <button class="tg-play" type="button">▶ 开始游戏</button>',
            '  <div class="tg-score"><span id="tgScoreA">0</span> : <span id="tgScoreB">0</span></div>',
            '</section>',
            '<footer class="site-foot">',
            '  <div class="foot-qr">',
            '    <div class="qr-item"><img src="/qrcodes/redbook.png" alt="小红书"><div class="qr-label">小红书 · 旋转开关</div></div>',
            '    <div class="qr-item"><img src="/qrcodes/wechat.png" alt="微信"><div class="qr-label">主理人微信 · 小野</div></div>',
            '  </div>',
            '  <div class="foot-text">界外网球俱乐部 · Rebel Tennis Club</div>',
            '  <div class="foot-copy">&copy; 2026 界外网球 All Rights Reserved</div>',
            '  <div class="foot-icp"><a href="https://beian.miit.gov.cn" target="_blank" rel="noopener">沪ICP备2026022652号</a></div>',
            '</footer>'
        ].join('\n');
    }

    function init() { bindHeader(); injectFooter(); bindBurger(); bindDropdown(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
