document.addEventListener('DOMContentLoaded', () => {
    const sidebarElement = document.querySelector('.sidebar');
    const windowTabs = document.getElementById('window-tabs');
    const addWindowButton = document.querySelector('.add-window-button');
    let windowCount = 1; // 用于为每个窗口生成唯一 ID

    // 初始化窗口逻辑
    function initializeWindow(window_elem) {
        centerWindow(window_elem);
        bindWindowButtons(window_elem);
        setWindowActiveOnClick(window_elem);
        bindResizeHandles(window_elem);
        bindDrag(window_elem);
        bindInputEvents(window_elem);
    }

    function centerWindow(window_elem) {
        const windowWidth = window_elem.offsetWidth;
        const windowHeight = window_elem.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const top = (viewportHeight - windowHeight) / 2;
        const left = (viewportWidth - windowWidth) / 2;

        window_elem.style.top = `${top}px`;
        window_elem.style.left = `${left}px`;
    }

    function bindWindowButtons(window_elem) {
        const greenButton = window_elem.querySelector('.button.green');
        const yellowButton = window_elem.querySelector('.button.yellow');
        const redButton = window_elem.querySelector('.button.red');

        greenButton.addEventListener('click', () => minimizeWindow(window_elem));
        yellowButton.addEventListener('click', () => toggleMaximizeWindow(window_elem));
        redButton.addEventListener('click', () => closeWindow(window_elem));
    }

    function minimizeWindow(window_elem) {
        if (window_elem.classList.contains('restored')) {
            window_elem.classList.remove('restored');
        }
        const windowId = window_elem.id;
        window_elem.classList.add('minimized');
        const windowTab = document.createElement('div');
        windowTab.classList.add('window-tab');
        windowTab.innerText = window_elem.querySelector('.title').innerText;
        windowTab.setAttribute('data-window-id', windowId);
        windowTabs.appendChild(windowTab);
        windowTab.addEventListener('click', () => restoreWindow(window_elem, windowTab));
    }

    function restoreWindow(window_elem, windowTab) {
        if (window_elem.classList.contains('minimized')) {
            window_elem.classList.remove('minimized');
        }
        window_elem.classList.add('restored');
        windowTabs.removeChild(windowTab);
    }

    function closeWindow(window_elem) {
        windowCount--;
        window_elem.classList.add('closing');
        setTimeout(() => window_elem.remove(), 500);
    }

    function toggleMaximizeWindow(window_elem) {
        const sidebarWidth = sidebarElement.offsetWidth;
        if (window_elem.classList.contains('maximized')) {
            window_elem.classList.remove('maximized');
            window_elem.classList.add('normal');
            window_elem.style.width = '';
            window_elem.style.height = '';
        }
        else {
            if (window_elem.classList.contains('normal')) {
                window_elem.classList.remove('normal');
            }
            const maxWidth = window.innerWidth - sidebarWidth;
            const maxHeight = window.innerHeight;
            window_elem.classList.add('maximized');
            window_elem.style.left = `${sidebarWidth}px`;
            window_elem.style.top = `0px`;
            window_elem.style.width = `${maxWidth}px`;
            window_elem.style.height = `${maxHeight}px`;
        }
    }


    function setWindowActiveOnClick(window_elem) {
        window_elem.addEventListener('mousedown', () => {
            document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
            window_elem.classList.add('active');
        });
    }

    function bindResizeHandles(window_elem) {
        const resizeHandles = window_elem.querySelectorAll('.resize-handle');
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (event) => {
                let isResizing = true;
                const startX = event.clientX;
                const startY = event.clientY;
                const startWidth = window_elem.offsetWidth;
                const startHeight = window_elem.offsetHeight;
                const startLeft = window_elem.offsetLeft;
                const startTop = window_elem.offsetTop;

                const handleResize = (event) => {
                    if (!isResizing) return;
                    let newWidth = startWidth;
                    let newHeight = startHeight;
                    let newLeft = startLeft;
                    let newTop = startTop;

                    if (handle.classList.contains('right')) {
                        newWidth += event.clientX - startX;
                    }
                    if (handle.classList.contains('left')) {
                        newLeft += event.clientX - startX;
                        newWidth -= event.clientX - startX;
                    }
                    if (handle.classList.contains('bottom')) {
                        newHeight += event.clientY - startY;
                    }
                    if (handle.classList.contains('top')) {
                        newTop += event.clientY - startY;
                        newHeight -= event.clientY - startY;
                    }
                    if (handle.classList.contains('bottom-right')) {
                        newWidth += event.clientX - startX;
                        newHeight += event.clientY - startY;
                    }
                    if (handle.classList.contains('top-right')) {
                        newWidth += event.clientX - startX;
                        newTop += event.clientY - startY;
                        newHeight -= event.clientY - startY;
                    }
                    if (handle.classList.contains('bottom-left')) {
                        newHeight += event.clientY - startY;
                        newLeft += event.clientX - startX;
                        newWidth -= event.clientX - startX;
                    }
                    if (handle.classList.contains('top-left')) {
                        newTop += event.clientY - startY;
                        newHeight -= event.clientY - startY;
                        newLeft += event.clientX - startX;
                        newWidth -= event.clientX - startX;
                    }

                    window_elem.style.width = `${Math.max(newWidth, 200)}px`;
                    window_elem.style.height = `${Math.max(newHeight, 100)}px`;
                    window_elem.style.left = `${newLeft}px`;
                    window_elem.style.top = `${newTop}px`;
                };

                const stopResize = () => {
                    isResizing = false;
                    document.removeEventListener('mousemove', handleResize);
                    document.removeEventListener('mouseup', stopResize);
                };

                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', stopResize);
            });
        });
    }

    function bindDrag(window_elem) {
        const titleBar = window_elem.querySelector('.title-bar');
        titleBar.addEventListener('mousedown', (event) => {
            let isDragging = true;
            const offsetX = event.clientX - window_elem.offsetLeft;
            const offsetY = event.clientY - window_elem.offsetTop;

            const handleDrag = (event) => {
                if (!isDragging) return;
                const left = Math.max(0, Math.min(event.clientX - offsetX, window.innerWidth - window_elem.offsetWidth));
                const top = Math.max(0, Math.min(event.clientY - offsetY, window.innerHeight - window_elem.offsetHeight));
                window_elem.style.left = `${left}px`;
                window_elem.style.top = `${top}px`;
            };

            const stopDrag = () => {
                isDragging = false;
                document.removeEventListener('mousemove', handleDrag);
                document.removeEventListener('mouseup', stopDrag);
            };

            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', stopDrag);
        });
    }

    function bindInputEvents(window_elem) {
        const inputBox = window_elem.querySelector('#chat-input');
        const contentBox = window_elem.querySelector('.content');
        inputBox.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (window_elem.classList.contains('active')) {
                    const message = inputBox.value.trim();
                    if (message) {
                        console.log(message);
                        const messageElem = document.createElement('div');
                        messageElem.classList.add('message');
                        messageElem.innerText = `You: ${message}`;
                        contentBox.appendChild(messageElem);
                        inputBox.value = '';
                        contentBox.scrollTop = contentBox.scrollHeight;
                    }
                }
            }
        });
    }

    addWindowButton.addEventListener('click', () => {
        windowCount++;
        const newWindow = document.createElement('div');
        newWindow.classList.add('window');
        newWindow.id = `window${windowCount}`;
        newWindow.innerHTML = `
            <div class="title-bar">
                <div class="buttons">
                    <span class="button red"></span>
                    <span class="button yellow"></span>
                    <span class="button green"></span>
                </div>
                <div class="title">Robot ${windowCount}</div>
            </div>
            <div class="content">Window Content</div>
            <div class="resize-handle top"></div>
            <div class="resize-handle bottom"></div>
            <div class="resize-handle left"></div>
            <div class="resize-handle right"></div>
            <div class="resize-handle top-left"></div>
            <div class="resize-handle top-right"></div>
            <div class="resize-handle bottom-left"></div>
            <div class="resize-handle bottom-right"></div>
            <div class="input-box">
                <textarea id="chat-input" placeholder="请输入消息..."></textarea>
            <div class="resize-handle input"></div>
        </div>
        `;
        document.body.appendChild(newWindow);
        initializeWindow(newWindow);
    });

    // 初始化已有窗口
    document.querySelectorAll('.window').forEach(window_elem => initializeWindow(window_elem));
});
