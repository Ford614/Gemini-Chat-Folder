(function () {
  'use strict';

  let folders = JSON.parse(localStorage.getItem('gemini_folders') || '[]');
  const save = () => localStorage.setItem('gemini_folders', JSON.stringify(folders));

  // スタイル定義（フォントサイズ拡大版）
  const style = document.createElement('style');
  style.textContent = `
    #g-sidebar-folders-container {
      margin: 12px;
      padding: 14px;
      background: #282a2c;
      border: 1px solid #444746;
      border-radius: 14px;
      font-family: 'Google Sans', Roboto, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      box-sizing: border-box;
      flex-shrink: 0;
    }
    .g-f-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #e3e3e3;
      font-size: 14px; /* 13px -> 14px に拡大 */
      font-weight: 500;
      margin-bottom: 10px;
    }
    .g-f-btn-add {
      background: rgba(168, 199, 250, 0.08);
      border: 1px solid #a8c7fa;
      color: #a8c7fa;
      font-size: 12px; /* 11px -> 12px に拡大 */
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 6px;
      transition: all 0.2s ease;
      font-weight: 500;
    }
    .g-f-btn-add:hover {
      background: #a8c7fa;
      color: #040e15;
    }
    .g-f-item {
      margin-top: 8px;
      border-radius: 8px;
      background: #1e1f20;
      border: 2px dashed transparent;
      transition: all 0.2s ease;
      overflow: hidden;
    }
    .g-f-item.drag-over {
      border-color: #a8c7fa;
      background: rgba(168, 199, 250, 0.15);
    }
    .g-f-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 13.5px; /* 12.5px -> 13.5px に拡大 */
      color: #e3e3e3;
      user-select: none;
    }
    .g-f-item-header:hover { background: rgba(255, 255, 255, 0.05); }
    .g-f-chat-list {
      padding: 4px 6px 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .g-f-chat-list.collapsed { display: none; }
    .g-f-chat-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      color: #c4c7c5;
      text-decoration: none;
      font-size: 13px; /* 12px -> 13px に拡大 */
      border-radius: 6px;
    }
    .g-f-chat-link:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
    .g-f-chat-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 150px;
    }
    .g-f-icon-del {
      background: transparent;
      border: none;
      color: #8e918f;
      cursor: pointer;
      font-size: 12px; /* 11px -> 12px に拡大 */
      opacity: 0;
      padding: 2px 4px;
      border-radius: 4px;
    }
    .g-f-chat-link:hover .g-f-icon-del,
    .g-f-item-header:hover .g-f-icon-del { opacity: 1; }
    .g-f-icon-del:hover { color: #f2b8b5; background: rgba(242, 184, 181, 0.1); }
    .g-f-input-box {
      display: flex;
      gap: 6px;
      padding: 6px;
      background: #131314;
      border-radius: 6px;
      margin-top: 6px;
    }
    .g-f-input {
      flex: 1;
      background: #1e1f20;
      border: 1px solid #444746;
      border-radius: 4px;
      color: #fff;
      padding: 5px 8px;
      font-size: 12px; /* 11px -> 12px に拡大 */
      outline: none;
    }
  `;
  document.head.appendChild(style);

  // ドラッグ設定
  function enableNativeDrag() {
    const nativeLinks = document.querySelectorAll('a[href*="/app/"]');
    nativeLinks.forEach(a => {
      if (!a.closest('#g-sidebar-folders-container') && !a.dataset.dragEnabled) {
        a.setAttribute('draggable', 'true');
        a.dataset.dragEnabled = 'true';

        a.addEventListener('dragstart', (e) => {
          const title = a.innerText.trim() || '無題の会話';
          const url = a.href;
          e.dataTransfer.setData('text/plain', JSON.stringify({ title, url }));
          e.dataTransfer.effectAllowed = 'copy';
        });
      }
    });
  }

  // 非表示設定
  function cleanNativeSidebar() {
    const savedUrls = new Set();
    folders.forEach(f => f.chats.forEach(c => savedUrls.add(c.url)));

    const nativeLinks = document.querySelectorAll('a[href*="/app/"]');
    nativeLinks.forEach(a => {
      if (!a.closest('#g-sidebar-folders-container')) {
        const targetContainer = a.closest('li') || a.parentElement;
        if (targetContainer) {
          targetContainer.style.display = savedUrls.has(a.href) ? 'none' : '';
        }
      }
    });
  }

  // サイドバーの「正解スクロール領域」を特定して挿入
  function injectSidebarUI() {
    if (document.getElementById('g-sidebar-folders-container')) {
      enableNativeDrag();
      cleanNativeSidebar();
      return;
    }

    const newChatBtn = document.querySelector('a[href="/app"]') || 
                       document.querySelector('button[aria-label*="新規"]') ||
                       Array.from(document.querySelectorAll('a, button')).find(el => el.textContent.includes('新規'));

    if (newChatBtn) {
      const scrollContainer = newChatBtn.closest('div[class*="scroll"]') || 
                              newChatBtn.closest('nav') || 
                              newChatBtn.parentElement;

      if (scrollContainer) {
        const container = document.createElement('div');
        container.id = 'g-sidebar-folders-container';
        container.innerHTML = `
          <div class="g-f-header">
            <span>📁 フォルダ整理</span>
            <button class="g-f-btn-add" id="g-add-f-btn">+ フォルダ</button>
          </div>
          <div id="g-f-list"></div>
        `;

        newChatBtn.parentNode.insertBefore(container, newChatBtn);

        document.getElementById('g-add-f-btn').addEventListener('click', () => {
          showInput(container, 'フォルダ名...', (name) => {
            folders.push({ name, chats: [], collapsed: false });
            save();
            render();
          });
        });

        render();
      }
    }

    enableNativeDrag();
    cleanNativeSidebar();
  }

  function render() {
    const list = document.getElementById('g-f-list');
    if (!list) return;
    list.innerHTML = '';

    folders.forEach((folder, fIdx) => {
      const item = document.createElement('div');
      item.className = 'g-f-item';

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        item.classList.add('drag-over');
      });

      item.addEventListener('dragleave', () => item.classList.remove('drag-over'));

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');

        try {
          const rawData = e.dataTransfer.getData('text/plain');
          if (rawData) {
            const data = JSON.parse(rawData);
            if (data.url && data.title) {
              const exists = folder.chats.some(c => c.url === data.url);
              if (!exists) {
                folder.chats.push({ title: data.title, url: data.url });
                save();
                render();
              }
            }
          }
        } catch (err) {
          console.error('Drop error:', err);
        }
      });

      const header = document.createElement('div');
      header.className = 'g-f-item-header';
      const arrow = folder.collapsed ? '►' : '▼';
      header.innerHTML = `
        <span><span style="font-size:10px; margin-right:4px;">${arrow}</span> 📁 ${folder.name}</span>
        <button class="g-f-icon-del g-del-f-btn" title="削除">✕</button>
      `;

      header.addEventListener('click', (e) => {
        if (e.target.classList.contains('g-del-f-btn')) return;
        folders[fIdx].collapsed = !folders[fIdx].collapsed;
        save();
        render();
      });

      const chatList = document.createElement('div');
      chatList.className = `g-f-chat-list ${folder.collapsed ? 'collapsed' : ''}`;

      folder.chats.forEach((chat, cIdx) => {
        const link = document.createElement('a');
        link.className = 'g-f-chat-link';
        link.href = chat.url;
        link.innerHTML = `
          <span class="g-f-chat-title">💬 ${chat.title}</span>
          <button class="g-f-icon-del g-del-c-btn" title="整理解除">✕</button>
        `;

        link.querySelector('.g-del-c-btn').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          folders[fIdx].chats.splice(cIdx, 1);
          save();
          render();
        });

        chatList.appendChild(link);
      });

      header.querySelector('.g-del-f-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        folders.splice(fIdx, 1);
        save();
        render();
      });

      item.appendChild(header);
      if (folder.chats.length > 0) item.appendChild(chatList);
      list.appendChild(item);
    });

    cleanNativeSidebar();
  }

  function showInput(parent, placeholder, onSubmit) {
    const old = parent.querySelector('.g-f-input-box');
    if (old) old.remove();

    const box = document.createElement('div');
    box.className = 'g-f-input-box';
    box.innerHTML = `
      <input type="text" class="g-f-input" placeholder="${placeholder}">
      <button class="g-f-btn-add" style="background:#a8c7fa; color:#040e15;">保存</button>
    `;

    const input = box.querySelector('input');
    const btn = box.querySelector('button');

    const run = () => {
      if (input.value.trim()) onSubmit(input.value.trim());
      box.remove();
    };

    btn.addEventListener('click', run);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') run();
      if (e.key === 'Escape') box.remove();
    });

    parent.appendChild(box);
    input.focus();
  }

  setInterval(injectSidebarUI, 1000);
})();