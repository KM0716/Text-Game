// ============================================================
//  proxycfg.js - 代理请求配置（独立模块）
//  包含：loadProxyReqConfig/saveProxyReqConfig/clearProxyReqConfig/testProxyRequest
//  DOMContentLoaded 绑定按钮
// ============================================================

// ===== 代理请求配置持久化（独立localStorage） =====
const PROXY_CFG_KEY = 'dz_proxy_req_cfg';

function showProxyCfgStatus(message, type = 'success') {
    const statusEl = document.getElementById('proxyCfgStatus');
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    statusEl.style.color = type === 'error' ? 'var(--color-danger)' : 
                          type === 'info' ? 'var(--ink-light)' : 'var(--color-success)';
    setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
}

function loadProxyReqConfig() {
    try {
        const saved = localStorage.getItem(PROXY_CFG_KEY);
        if (!saved) return;
        const config = JSON.parse(saved);
        if (config.targetUrl !== undefined) { const el = document.getElementById('proxyTargetUrl'); if (el) el.value = config.targetUrl; }
        if (config.method !== undefined) { const el = document.getElementById('proxyMethod'); if (el) el.value = config.method; }
        if (config.body !== undefined) { const el = document.getElementById('proxyBody'); if (el) el.value = config.body; }
        if (config.headers !== undefined) { const el = document.getElementById('proxyHeaders'); if (el) el.value = config.headers; }
        showProxyCfgStatus('✓ 已加载历史配置', 'info');
    } catch (e) {
        console.warn('加载代理请求配置失败:', e.message);
        try { localStorage.removeItem(PROXY_CFG_KEY); } catch {}
    }
}

function saveProxyReqConfig() {
    try {
        const config = {
            targetUrl: (document.getElementById('proxyTargetUrl')?.value.trim()) || '',
            method: (document.getElementById('proxyMethod')?.value) || 'POST',
            body: (document.getElementById('proxyBody')?.value.trim()) || '',
            headers: (document.getElementById('proxyHeaders')?.value.trim()) || ''
        };
        if (config.body) { try { JSON.parse(config.body); } catch { showProxyCfgStatus('⚠ 请求Body不是有效的JSON格式', 'error'); return; } }
        if (config.headers) { try { JSON.parse(config.headers); } catch { showProxyCfgStatus('⚠ 请求头不是有效的JSON格式', 'error'); return; } }
        localStorage.setItem(PROXY_CFG_KEY, JSON.stringify(config));
        showProxyCfgStatus('✓ 配置已保存', 'success');
    } catch (e) {
        console.error('保存代理请求配置失败:', e.message);
        showProxyCfgStatus('保存失败: ' + e.message, 'error');
    }
}

function clearProxyReqConfig() {
    try {
        localStorage.removeItem(PROXY_CFG_KEY);
        const els = ['proxyTargetUrl', 'proxyBody', 'proxyHeaders'];
        els.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        const methodEl = document.getElementById('proxyMethod'); if (methodEl) methodEl.value = 'POST';
        showProxyCfgStatus('✓ 配置已清空', 'info');
    } catch (e) {
        console.error('清空代理请求配置失败:', e.message);
        showProxyCfgStatus('清空失败: ' + e.message, 'error');
    }
}

async function testProxyRequest() {
    const targetUrl = document.getElementById('proxyTargetUrl')?.value.trim() || '';
    if (!targetUrl) { showProxyCfgStatus('⚠ 请先填写目标接口地址', 'error'); return; }
    const method = document.getElementById('proxyMethod')?.value || 'POST';
    const bodyStr = document.getElementById('proxyBody')?.value.trim() || '';
    const headersStr = document.getElementById('proxyHeaders')?.value.trim() || '';
    
    let bodyObj = null;
    let headersObj = {};
    
    if (bodyStr) { try { bodyObj = JSON.parse(bodyStr); } catch { showProxyCfgStatus('⚠ 请求Body不是有效的JSON格式', 'error'); return; } }
    if (headersStr) { try { headersObj = JSON.parse(headersStr); } catch { showProxyCfgStatus('⚠ 请求头不是有效的JSON格式', 'error'); return; } }
    
    showProxyCfgStatus('⏳ 正在发送测试请求...', 'info');
    try {
        const cfgFn = typeof window.cfg === 'function' ? window.cfg : null;
        const cfg = cfgFn ? cfgFn() : { useProxy: false };
        let response;
        if (cfg.useProxy && cfg.proxyUrl) {
            response = await window._sendProxyRequest(targetUrl, bodyObj || {}, cfg.key || 'test', null, false);
        } else {
            response = await fetch(targetUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json', ...headersObj },
                body: method === 'POST' && bodyObj ? JSON.stringify(bodyObj) : undefined
            });
        }
        if (response.ok) { showProxyCfgStatus('✓ 测试请求成功 (HTTP ' + response.status + ')', 'success'); }
        else {
            let msg = '⚠ 请求失败 (HTTP ' + response.status + ')';
            if (response.status === 401) msg = '⚠ 请求失败：认证失败，请检查API密钥';
            else if (response.status === 403) msg = '⚠ 请求失败：访问被拒绝';
            else if (response.status === 404) msg = '⚠ 请求失败：目标接口不存在';
            else if (response.status === 429) msg = '⚠ 请求失败：请求过于频繁';
            else if (response.status >= 500) msg = '⚠ 请求失败：目标服务器暂时不可用';
            showProxyCfgStatus(msg, 'error');
        }
    } catch (e) {
        showProxyCfgStatus('✗ 请求异常: ' + e.message, 'error');
    }
}

// 暴露到全局
window._loadProxyReqConfig = loadProxyReqConfig;
window._saveProxyReqConfig = saveProxyReqConfig;
window._clearProxyReqConfig = clearProxyReqConfig;
window._testProxyRequest = testProxyRequest;

// 绑定按钮事件
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('btnSaveProxyCfg');
    const clearBtn = document.getElementById('btnClearProxyCfg');
    const testBtn = document.getElementById('btnTestProxyReq');
    if (saveBtn) saveBtn.addEventListener('click', saveProxyReqConfig);
    if (clearBtn) clearBtn.addEventListener('click', clearProxyReqConfig);
    if (testBtn) testBtn.addEventListener('click', testProxyRequest);
    loadProxyReqConfig();
});
